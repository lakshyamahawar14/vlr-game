"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export type Player = { name: string; cost: number };

export function useRoom() {
  const params = useParams();
  const [myId, setMyId] = useState<string | null>(null);
  const [myName, setMyName] = useState<string>("");
  const [oppName, setOppName] = useState<string>("ENEMY");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(true);
  const [team, setTeam] = useState<Player[]>([]);
  const [oppTeam, setOppTeam] = useState<Player[]>([]);
  const [budget, setBudget] = useState(100);
  const [timer, setTimer] = useState(30);
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<"p1" | "p2" | null>(null);
  const [categories, setCategories] = useState<Record<string, string[]> | null>(null);
  const [rawStats, setRawStats] = useState<Record<string, number>>({});
  const [oppLeft, setOppLeft] = useState(false);
  
  const statusRef = useRef<string | null>(null);
  const isProcessingPick = useRef(false);
  const pickQueue = useRef<{ name: string; cost: number }[]>([]);

  const syncStates = useCallback((data: any) => {
    if (!data || !myId) return;
    setRoomExists(true);
    const isP1 = data.p1_id === myId;
    setRole(isP1 ? "p1" : "p2");
    
    const inMyTeam = isP1 ? data.p1_team || [] : data.p2_team || [];
    const inOppTeam = isP1 ? data.p2_team || [] : data.p1_team || [];
    
    setTeam(inMyTeam);
    setOppTeam(inOppTeam);
    setBudget(isP1 ? data.p1_budget : data.p2_budget);
    setCategories(data.categories || null);
    setRawStats(data.raw_stats || {});

    const totalPlayers = (inMyTeam.length || 0) + (inOppTeam.length || 0);

    if (totalPlayers >= 10 || data.status === "ENDED") {
      setTimer(0);
      setStatus("ENDED");
      statusRef.current = "ENDED";
      if (isP1 && data.status !== "ENDED") {
        supabase.from("room").update({ status: "ENDED" }).eq("id", data.id).then();
      }
    } else {
      setStatus(data.status);
      statusRef.current = data.status;
    }

    if (data.draft_start_at && data.status === "DRAFTING") {
      const start = new Date(data.draft_start_at).getTime();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setTimer(Math.max(0, 30 - elapsed));
    }

    if (isP1) {
      if (data.p1_name) setMyName(data.p1_name);
      setOppName(data.p2_name || "WAITING...");
    } else {
      if (data.p2_name) setMyName(data.p2_name);
      setOppName(data.p1_name || "WAITING...");
    }

    if (data.status === "ENDED" || (data.categories && Object.keys(data.categories).length > 0)) {
      setIsLoading(false);
    }
  }, [myId]);

  useEffect(() => {
    setIsMounted(true);
    const storedId = localStorage.getItem("vlr_duel_id");
    const storedName = localStorage.getItem("vlr_duel_username");
    setMyId(storedId);
    setMyName(storedName || (storedId ? `PLAYER_${storedId.slice(0, 4)}` : "PLAYER"));
  }, []);

  useEffect(() => {
    if (!isMounted || !myId || !params?.id) return;
    const roomId = params.id as string;

    const waitForCategoriesAndJoin = async (isP1: boolean) => {
      for (let i = 0; i < 5; i++) {
        await new Promise(res => setTimeout(res, 2000));
        const { data: freshData } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
        if (!freshData) continue;

        const categoriesExist = freshData.categories && Object.keys(freshData.categories).length > 0;
        const p1Joined = freshData.p1_joined;
        const myJoinedField = isP1 ? freshData.p1_joined : freshData.p2_joined;

        if (categoriesExist && p1Joined && !myJoinedField) {
          const updateObj = isP1 ? { p1_joined: true } : { p2_joined: true };
          await supabase.from("room").update(updateObj).eq("id", roomId);
          const { data: updatedData } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
          syncStates(updatedData);
          return;
        }

        if (categoriesExist && p1Joined) {
          syncStates(freshData);
          return;
        }
      }
    };

    const fetchInitial = async () => {
      const { data } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
      if (!data) {
        setRoomExists(false);
        setIsLoading(false);
        return;
      }

      const isP1 = data.p1_id === myId;
      if (data.status !== "ENDED" && (!data.categories || Object.keys(data.categories).length === 0) && isP1) {
        try {
          const res = await fetch("/api/players");
          const vlr = await res.json();
          const { data: updatedData } = await supabase.from("room")
            .update({ 
              categories: vlr.pool,
              raw_stats: vlr.rawStats,
              draft_start_at: new Date().toISOString(),
              p1_joined: true
            })
            .eq("id", roomId)
            .select()
            .single();
          if (updatedData) syncStates(updatedData);
        } catch (e) {
          syncStates(data);
        }
      } else {
        syncStates(data);
      }
      waitForCategoriesAndJoin(isP1);
    };

    fetchInitial();

    const channel = supabase.channel(`room_realtime_${roomId}`, {
      config: { presence: { key: myId } },
    })
      .on("postgres_changes", { 
        event: "UPDATE", 
        schema: "public", 
        table: "room", 
        filter: `id=eq.${roomId}` 
      }, (payload) => {
        syncStates(payload.new);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (statusRef.current === "DRAFTING") {
          const isOpponentLeaving = leftPresences.some(p => p.user_id !== myId);
          if (isOpponentLeaving) {
            statusRef.current = "ENDED";
            setStatus("ENDED");
            setTimer(0);
            setOppLeft(true);
            supabase.from("room").update({ status: "ENDED" }).eq("id", roomId).then();
          }
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: myId, online_at: new Date().toISOString() });
        }
      });

    const interval = setInterval(() => {
      if (statusRef.current === "DRAFTING") {
        setTimer((prev) => {
          if (prev <= 1) {
            if (role === "p1") {
              supabase.from("room").update({ status: "ENDED" }).eq("id", roomId).then();
            }
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => { 
      clearInterval(interval); 
      supabase.removeChannel(channel); 
    };
  }, [isMounted, myId, params?.id, role, syncStates]);

  const processQueue = async () => {
    if (isProcessingPick.current || pickQueue.current.length === 0) return;
    isProcessingPick.current = true;
    const { name, cost } = pickQueue.current[0];

    try {
      await supabase.rpc('pick_player', {
        room_id_input: params.id,
        player_name: name,
        player_cost: cost,
        player_role: role
      });
    } catch (e) {
    } finally {
      pickQueue.current.shift();
      isProcessingPick.current = false;
      processQueue();
    }
  };

  const handlePick = async (name: string, cost: number) => {
    if (!params?.id || !role || status !== "DRAFTING" || team.length >= 5 || budget < cost) return;
    if (team.some(p => p.name === name) || oppTeam.some(p => p.name === name)) return;
    
    setTeam(prev => [...prev, { name, cost }]);
    setBudget(prev => prev - cost);
    
    pickQueue.current.push({ name, cost });
    processQueue();
  };

  const myValue = useMemo(() => team.reduce((acc, p) => acc + p.cost, 0), [team]);
  const oppValue = useMemo(() => oppTeam.reduce((acc, p) => acc + p.cost, 0), [oppTeam]);

  return {
    params, myId, myName, oppName, isMounted, isLoading, roomExists,
    team, oppTeam, budget, timer, status, myValue, oppValue, handlePick,
    categories, rawStats, oppLeft
  };
}