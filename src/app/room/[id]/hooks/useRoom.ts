"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export type Player = { name: string; cost: number };

export function useRoom() {
  const params = useParams();
  const [myId, setMyId] = useState<string | null>(null);
  const [myName, setMyName] = useState<string>("YOU");
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
  const statusRef = useRef<string | null>(null);
  
  const isProcessingPick = useRef(false);
  const pickQueue = useRef<{ name: string; cost: number }[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setMyId(localStorage.getItem("vlr_duel_id"));
    setMyName(localStorage.getItem("vlr_duel_username") || "YOU");
  }, []);

  useEffect(() => {
    if (!isMounted || !myId || !params?.id) return;
    const roomId = params.id as string;

    const syncStates = (data: any) => {
      if (!data) return;
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
      
      if (data.draft_start_at && data.status === "DRAFTING") {
        const start = new Date(data.draft_start_at).getTime();
        const elapsed = Math.floor((Date.now() - start) / 1000);
        setTimer(Math.max(0, 30 - elapsed));
      }
      setOppName(isP1 ? (data.p2_name || "WAITING...") : (data.p1_name || "WAITING..."));
      statusRef.current = data.status;
      setStatus(data.status);

      if (data.status === "ENDED" || (data.categories && Object.keys(data.categories).length > 0)) {
        setIsLoading(false);
      }
    };

    const fetchInitial = async () => {
      const { data, error } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
      
      if (error || !data) {
        setTimeout(async () => {
          const { data: retryData } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
          if (!retryData) {
            setRoomExists(false);
            setIsLoading(false);
          } else {
            syncStates(retryData);
          }
        }, 2000);
        return;
      }

      setRoomExists(true);
      if (data.status !== "ENDED" && (!data.categories || Object.keys(data.categories).length === 0) && data.p1_id === myId) {
        try {
          const res = await fetch("/api/players");
          const vlr = await res.json();
          const { data: updatedData } = await supabase.from("room")
            .update({ 
              categories: vlr.pool,
              raw_stats: vlr.rawStats,
              draft_start_at: new Date().toISOString()
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
    };

    fetchInitial();

    const channel = supabase.channel(`room_${roomId}`)
      .on("postgres_changes", { 
        event: "UPDATE", 
        schema: "public", 
        table: "room", 
        filter: `id=eq.${roomId}` 
      }, (payload) => {
        syncStates(payload.new);
      })
      .subscribe();

    const interval = setInterval(() => {
      if (statusRef.current === "DRAFTING") {
        setTimer((prev) => {
          if (prev <= 1) {
            if (myId && role === "p1") {
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
  }, [isMounted, myId, params?.id, role]);

  const processQueue = async () => {
    if (isProcessingPick.current || pickQueue.current.length === 0) return;
    isProcessingPick.current = true;
    const { name, cost } = pickQueue.current[0];

    await supabase.rpc('pick_player', {
      room_id_input: params.id,
      player_name: name,
      player_cost: cost,
      player_role: role
    });

    pickQueue.current.shift();
    isProcessingPick.current = false;
    processQueue();
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
    categories, rawStats
  };
}