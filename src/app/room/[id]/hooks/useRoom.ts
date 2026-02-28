"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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

    const syncStates = async (data: any) => {
      if (!data) return;

      const isP1 = data.p1_id === myId;
      setRole(isP1 ? "p1" : "p2");

      const myTeam = isP1 ? data.p1_team || [] : data.p2_team || [];
      const enemyTeam = isP1 ? data.p2_team || [] : data.p1_team || [];

      setTeam(myTeam);
      setOppTeam(enemyTeam);
      setBudget(isP1 ? data.p1_budget : data.p2_budget);
      setCategories(data.categories || null);
      setRawStats(data.raw_stats || {});

      setStatus(data.status);
      statusRef.current = data.status;

      if (data.status === "DRAFTING" && data.draft_start_at) {
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

      if (data.status === "ENDED") {
        setTimer(0);
        setIsLoading(false);
      }

      if (data.categories && Object.keys(data.categories).length > 0) {
        setIsLoading(false);
      }
    };

    const fetchInitial = async () => {
      const { data } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
      if (!data) {
        setRoomExists(false);
        setIsLoading(false);
        return;
      }

      if (data.p1_id === myId && !data.p1_joined) {
        await supabase.from("room").update({ p1_joined: true }).eq("id", roomId);
      }

      if (data.p2_id === myId && !data.p2_joined) {
        await supabase.from("room").update({ p2_joined: true }).eq("id", roomId);
      }

      if (
        data.status !== "ENDED" &&
        (!data.categories || Object.keys(data.categories).length === 0) &&
        data.p1_id === myId
      ) {
        try {
          const res = await fetch("/api/players");
          const vlr = await res.json();
          await supabase.from("room").update({
            categories: vlr.pool,
            raw_stats: vlr.rawStats
          }).eq("id", roomId);
        } catch {}
      }

      syncStates(data);
    };

    fetchInitial();

    const channel = supabase
      .channel(`room_realtime_${roomId}`, { config: { presence: { key: myId } } })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "room",
        filter: `id=eq.${roomId}`
      }, (payload) => {
        syncStates(payload.new);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (statusRef.current === "DRAFTING") {
          const oppGone = leftPresences.some(p => p.user_id !== myId);
          if (oppGone) {
            setOppLeft(true);
            setStatus("ENDED");
            setTimer(0);
            supabase.from("room").update({ status: "ENDED" }).eq("id", roomId);
          }
        }
      })
      .subscribe(async (s) => {
        if (s === "SUBSCRIBED") {
          await channel.track({ user_id: myId });
        }
      });

    const interval = setInterval(() => {
      if (statusRef.current === "DRAFTING") {
        setTimer((prev) => {
          if (prev <= 1 && role === "p1") {
            supabase.from("room").update({ status: "ENDED" }).eq("id", roomId);
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

    try {
      await supabase.rpc("pick_player", {
        room_id_input: params.id,
        player_name: name,
        player_cost: cost,
        player_role: role
      });
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

  const myValue = useMemo(() => team.reduce((a, p) => a + p.cost, 0), [team]);
  const oppValue = useMemo(() => oppTeam.reduce((a, p) => a + p.cost, 0), [oppTeam]);

  return {
    params,
    myId,
    myName,
    oppName,
    isMounted,
    isLoading,
    roomExists,
    team,
    oppTeam,
    budget,
    timer,
    status,
    myValue,
    oppValue,
    handlePick,
    categories,
    rawStats,
    oppLeft
  };
}