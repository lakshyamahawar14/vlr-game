"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Player, GameResult } from "./useRoom";

export function useGame(roomProps: any) {
  const { 
    params, myId, role, statusRef, setTimer, 
    setRoomExists, setIsLoading, setHasChecked, roomCreatedAtRef, 
    leaveTimeoutRef, syncRoomData, roomExists 
  } = roomProps;

  const [team, setTeam] = useState<Player[]>([]);
  const [oppTeam, setOppTeam] = useState<Player[]>([]);
  const [budget, setBudget] = useState(100);
  const [categories, setCategories] = useState<Record<string, string[]> | null>(null);
  const [rawStats, setRawStats] = useState<Record<string, number>>({});
  const [oppLeft, setOppLeft] = useState(false);
  const [results, setResults] = useState<GameResult | null>(null);

  const isProcessingPick = useRef(false);
  const pickQueue = useRef<{ name: string; cost: number }[]>([]);

  const syncStates = useCallback((data: any) => {
    if (!data || !myId) return;
    syncRoomData(data);
    const isP1 = data.p1_id === myId;
    const inMyTeam = isP1 ? data.p1_team || [] : data.p2_team || [];
    const inOppTeam = isP1 ? data.p2_team || [] : data.p1_team || [];
    setTeam(inMyTeam);
    setOppTeam(inOppTeam);
    setBudget(isP1 ? data.p1_budget : data.p2_budget);
    setCategories(data.categories || null);
    setRawStats(data.raw_stats || {});
    const p1Count = (data.p1_team || []).length;
    const p2Count = (data.p2_team || []).length;

    if (p1Count === 5 && p2Count === 5 && data.status === "DRAFTING" && isP1) {
      supabase.from("room").update({ status: "ENDED" }).eq("id", data.id).then();
    }

    if (data.status === "ENDED") {
      setTimer(0);
      setIsLoading(false);
      if (p1Count === 0 || p2Count === 0) {
        supabase.from("room").delete().eq("id", data.id).then(() => setRoomExists(false));
        return;
      }
      if (data.winner_id) {
        const drawId = "00000000-0000-0000-0000-000000000000";
        const myScore = isP1 ? Number(data.p1_score || 0) : Number(data.p2_score || 0);
        const oppScore = isP1 ? Number(data.p2_score || 0) : Number(data.p1_score || 0);
        let wName = "DRAW";
        if (data.winner_id === myId) wName = isP1 ? data.p1_name : data.p2_name;
        else if (data.winner_id !== drawId) wName = isP1 ? data.p2_name : data.p1_name;
        setResults({ myScore, oppScore, winnerName: wName, iWon: data.winner_id === myId, oppWon: data.winner_id !== myId && data.winner_id !== drawId, isDraw: data.winner_id === drawId });
      }
    }

    if (data.draft_start_at && data.status === "DRAFTING") {
      const start = new Date(data.draft_start_at).getTime();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setTimer(Math.max(0, 30 - elapsed));
      setIsLoading(false);
    } else if (data.status === "READY" || data.status === "WAITING") {
      const start = new Date(data.created_at).getTime();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setTimer(Math.max(0, 15 - elapsed));
      setIsLoading(true);
    } else {
      setTimer(30);
    }
  }, [myId, syncRoomData, setTimer, setIsLoading, setRoomExists]);

  useEffect(() => {
    if (!myId || !params?.id || roomProps.initialFetchDone.current) return;
    roomProps.initialFetchDone.current = true;
    const roomId = params.id as string;

    const setupRoom = async () => {
      try {
        const { data: room, error } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
        if (error || !room) {
          setRoomExists(false);
        } else {
          syncStates(room);
          if (room.status === "ENDED") return;
          const isP1 = room.p1_id === myId;
          const roleKey = isP1 ? "p1_joined" : "p2_joined";
          if (!room[roleKey]) {
            await supabase.from("room").update({ [roleKey]: true }).eq("id", roomId);
          }
          if (isP1 && (!room.categories || Object.keys(room.categories).length === 0)) {
            const res = await fetch("/api/players");
            const vlr = await res.json();
            await supabase.from("room").update({ categories: vlr.pool, raw_stats: vlr.rawStats, p1_joined: true }).eq("id", roomId);
          }
          const channel = supabase.channel(`room_${roomId}`, { config: { presence: { key: myId } } })
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "room", filter: `id=eq.${roomId}` }, (p) => syncStates(p.new))
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "room", filter: `id=eq.${roomId}` }, () => setRoomExists(false))
            .on("presence", { event: "sync" }, async () => {
              const state = channel.presenceState();
              const userCount = Object.keys(state).length;
              if (userCount === 2 && leaveTimeoutRef.current) {
                clearTimeout(leaveTimeoutRef.current);
                leaveTimeoutRef.current = null;
              }
              if (userCount === 2 && statusRef.current === "READY") {
                await supabase.from("room").update({ status: "DRAFTING", draft_start_at: new Date().toISOString() }).eq("id", roomId);
              }
            })
            .on("presence", { event: "leave" }, ({ leftPresences }) => {
              if (statusRef.current === "DRAFTING" && leftPresences.some(p => p.user_id !== myId)) {
                if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
                leaveTimeoutRef.current = setTimeout(async () => {
                  setOppLeft(true); setTimer(0);
                  const { data: latest } = await supabase.from("room").select("p1_team, p2_team").eq("id", roomId).maybeSingle();
                  const p1Empty = (latest?.p1_team || []).length === 0;
                  const p2Empty = (latest?.p2_team || []).length === 0;
                  if (p1Empty || p2Empty) {
                    await supabase.from("room").delete().eq("id", roomId);
                    setRoomExists(false);
                  } else {
                    await supabase.from("room").update({ status: "ENDED" }).eq("id", roomId);
                  }
                }, 5000);
              }
            })
            .subscribe(async (s) => {
              if (s === "SUBSCRIBED") await channel.track({ user_id: myId, online_at: new Date().toISOString() });
            });
        }
      } finally {
        setIsLoading(false);
        setHasChecked(true);
      }
    };
    setupRoom();
  }, [myId, params?.id, syncStates]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = statusRef.current;
      if (currentStatus === "WAITING" || currentStatus === "READY") {
        if (roomCreatedAtRef.current) {
          const age = Math.floor((Date.now() - new Date(roomCreatedAtRef.current).getTime()) / 1000);
          setTimer(Math.max(0, 15 - age));
          if (age >= 15 && roomExists) {
            setRoomExists(false);
            supabase.from("room").update({ status: "ENDED" }).eq("id", params.id).then(() => {
              supabase.from("room").delete().eq("id", params.id).then();
            });
          }
        }
      } else if (currentStatus === "DRAFTING") {
        setTimer((prev: number) => {
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
  }, [role, params.id, roomExists]);

  const processQueue = async () => {
    if (isProcessingPick.current || pickQueue.current.length === 0) return;
    isProcessingPick.current = true;
    const currentPick = pickQueue.current[0];
    try {
      const { error } = await supabase.rpc('pick_player', { room_id_input: params.id, player_name: currentPick.name, player_cost: currentPick.cost, player_role: role });
      if (error) throw error;
      pickQueue.current.shift();
    } catch (e) {
      pickQueue.current.shift();
    } finally {
      isProcessingPick.current = false;
      if (pickQueue.current.length > 0) processQueue();
    }
  };

  const handlePick = async (name: string, cost: number) => {
    if (!params?.id || !role || statusRef.current !== "DRAFTING" || team.length >= 5 || budget < cost) return;
    if (team.some(p => p.name === name) || oppTeam.some(p => p.name === name)) return;
    setTeam(prev => [...prev, { name, cost }]);
    setBudget(prev => prev - cost);
    pickQueue.current.push({ name, cost });
    if (!isProcessingPick.current) processQueue();
  };

  const myValue = useMemo(() => team.reduce((acc, p) => acc + p.cost, 0), [team]);
  const oppValue = useMemo(() => oppTeam.reduce((acc, p) => acc + p.cost, 0), [oppTeam]);

  return { team, oppTeam, budget, categories, rawStats, oppLeft, results, handlePick, myValue, oppValue };
}