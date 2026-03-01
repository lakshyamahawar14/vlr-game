"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export type Player = { name: string; cost: number };
export type GameResult = {
  myScore: number;
  oppScore: number;
  winnerName: string;
  iWon: boolean;
  oppWon: boolean;
  isDraw: boolean;
};

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
  const [results, setResults] = useState<GameResult | null>(null);
  
  const statusRef = useRef<string | null>(null);
  const isProcessingPick = useRef(false);
  const pickQueue = useRef<{ name: string; cost: number }[]>([]);
  const initialFetchDone = useRef(false);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const syncStates = useCallback((data: any) => {
    if (!data || !myId) return;
    
    const isP1 = data.p1_id === myId;
    setRole(isP1 ? "p1" : "p2");
    
    const inMyTeam = isP1 ? data.p1_team || [] : data.p2_team || [];
    const inOppTeam = isP1 ? data.p2_team || [] : data.p1_team || [];
    
    setTeam(inMyTeam);
    setOppTeam(inOppTeam);
    setBudget(isP1 ? data.p1_budget : data.p2_budget);
    setCategories(data.categories || null);
    setRawStats(data.raw_stats || {});

    const p1Count = (data.p1_team || []).length;
    const p2Count = (data.p2_team || []).length;

    if (data.status === "ENDED") {
      const prevStatus = statusRef.current;
      statusRef.current = "ENDED";
      setStatus("ENDED");
      setTimer(0);
      setIsLoading(false);

      if ((p1Count === 0 || p2Count === 0) && (prevStatus === "DRAFTING" || (data.p1_joined && data.p2_joined))) {
        if (isP1) supabase.from("room").delete().eq("id", data.id).then();
        setRoomExists(false);
        return;
      }

      if (data.winner_id) {
        const drawId = "00000000-0000-0000-0000-000000000000";
        const myScore = isP1 ? Number(data.p1_score || 0) : Number(data.p2_score || 0);
        const oppScore = isP1 ? Number(data.p2_score || 0) : Number(data.p1_score || 0);
        
        let wName = "DRAW";
        if (data.winner_id === myId) {
          wName = isP1 ? data.p1_name : data.p2_name;
        } else if (data.winner_id !== drawId) {
          wName = isP1 ? data.p2_name : data.p1_name;
        }

        setResults({
          myScore, oppScore, winnerName: wName,
          iWon: data.winner_id === myId,
          oppWon: data.winner_id !== myId && data.winner_id !== drawId,
          isDraw: data.winner_id === drawId
        });
      }
    }

    setRoomExists(true);
    setStatus(data.status);
    statusRef.current = data.status;

    if (data.draft_start_at && data.status === "DRAFTING") {
      const start = new Date(data.draft_start_at).getTime();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setTimer(remaining);
      setIsLoading(false);
    } else {
      setTimer(30);
      if (data.status === "READY" || data.status === "WAITING") setIsLoading(true);
    }

    if (isP1) {
      if (data.p1_name) setMyName(data.p1_name);
      if (data.p2_name) setOppName(data.p2_name);
      else setOppName(prev => (prev === "ENEMY" ? "WAITING..." : prev));
    } else {
      if (data.p2_name) setMyName(data.p2_name);
      if (data.p1_name) setOppName(data.p1_name);
      else setOppName(prev => (prev === "ENEMY" ? "WAITING..." : prev));
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
    if (!isMounted || !myId || !params?.id || initialFetchDone.current) return;
    initialFetchDone.current = true;
    const roomId = params.id as string;

    const setupRoom = async () => {
      const { data: room } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
      
      if (!room) { 
        setRoomExists(false); 
        setIsLoading(false); 
        return; 
      }

      if (room.status === "ENDED") {
        const p1C = (room.p1_team || []).length;
        const p2C = (room.p2_team || []).length;
        if (p1C === 0 || p2C === 0) {
          setRoomExists(false);
          setIsLoading(false);
          return;
        }
        syncStates(room);
        setRoomExists(true);
        setIsLoading(false);
        return;
      }

      const isP1 = room.p1_id === myId;
      const roleKey = isP1 ? "p1_joined" : "p2_joined";

      if (!room[roleKey]) {
        await supabase.from("room").update({ [roleKey]: true }).eq("id", roomId);
      }

      if (isP1 && (!room.categories || Object.keys(room.categories).length === 0)) {
        try {
          const res = await fetch("/api/players");
          const vlr = await res.json();
          await supabase.from("room").update({ 
            categories: vlr.pool, 
            raw_stats: vlr.rawStats,
            p1_joined: true
          }).eq("id", roomId);
        } catch (e) {}
      }

      const { data: fresh } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
      if (fresh) syncStates(fresh);

      const channel = supabase.channel(`room_${roomId}`, { config: { presence: { key: myId } } })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "room", filter: `id=eq.${roomId}` }, (p) => {
            syncStates(p.new);
        })
        .on("presence", { event: "sync" }, async () => {
          const state = channel.presenceState();
          const userCount = Object.keys(state).length;

          if (userCount === 2 && leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
          }

          if (userCount === 2 && statusRef.current === "READY") {
            await supabase.from("room").update({ 
              status: "DRAFTING", 
              draft_start_at: new Date().toISOString() 
            }).eq("id", roomId);
          }
        })
        .on("presence", { event: "leave" }, ({ leftPresences }) => {
          if (statusRef.current === "DRAFTING" && leftPresences.some(p => p.user_id !== myId)) {
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
            
            leaveTimeoutRef.current = setTimeout(() => {
              setOppLeft(true);
              setTimer(0);
              supabase.from("room").update({ status: "ENDED" }).eq("id", roomId).then();
            }, 5000);
          }
        })
        .subscribe(async (s) => {
          if (s === "SUBSCRIBED") await channel.track({ user_id: myId, online_at: new Date().toISOString() });
        });
    };

    setupRoom();
  }, [isMounted, myId, params?.id, syncStates]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (statusRef.current === "DRAFTING") {
        setTimer((prev) => {
          if (prev <= 0) {
            if (role === "p1" && statusRef.current !== "ENDED") {
                supabase.from("room").update({ status: "ENDED" }).eq("id", params.id).then();
            }
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [role, params.id]);

  useEffect(() => {
    if (!isMounted || (status !== "WAITING" && status !== "READY")) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from("room").select("status").eq("id", params.id).single();
      if (data && data.status !== statusRef.current) {
         const { data: fullData } = await supabase.from("room").select("*").eq("id", params.id).single();
         if (fullData) syncStates(fullData);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [status, isMounted, params.id, syncStates]);

  const processQueue = async () => {
    if (isProcessingPick.current || pickQueue.current.length === 0) return;
    isProcessingPick.current = true;
    const { name, cost } = pickQueue.current[0];
    try {
      await supabase.rpc('pick_player', { room_id_input: params.id, player_name: name, player_cost: cost, player_role: role });
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
    categories, rawStats, oppLeft, results
  };
}