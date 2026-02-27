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
  const statusRef = useRef<string | null>(null);

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
      const isP1 = data.p1_id === myId;
      setRole(isP1 ? "p1" : "p2");
      const incomingMyTeam = isP1 ? data.p1_team || [] : data.p2_team || [];
      const incomingOppTeam = isP1 ? data.p2_team || [] : data.p1_team || [];
      setTeam(incomingMyTeam);
      setOppTeam(incomingOppTeam);
      setBudget(100 - incomingMyTeam.reduce((acc: number, p: Player) => acc + p.cost, 0));
      
      if (data.created_at && data.status === "DRAFTING") {
        const startTime = new Date(data.created_at).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimer(Math.max(0, 30 - elapsed));
      }
      
      setOppName(isP1 ? (data.p2_name || "WAITING...") : (data.p1_name || "WAITING..."));
      statusRef.current = data.status;
      setStatus(data.status);
      setIsLoading(false);
    };

    const fetchInitial = async () => {
      const { data } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
      if (data) {
        setRoomExists(true);
        syncStates(data);
      } else {
        setRoomExists(false);
        setIsLoading(false);
      }
    };

    fetchInitial();

    const channel = supabase.channel(`room_sync_${roomId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "room", filter: `id=eq.${roomId}` }, (payload) => {
        syncStates(payload.new);
      })
      .subscribe();

    const interval = setInterval(() => {
      if (statusRef.current === "DRAFTING") {
        setTimer((p) => {
          if (p <= 1) {
            if (role === "p1") supabase.from("room").update({ status: "ENDED" }).eq("id", roomId).then();
            return 0;
          }
          return p - 1;
        });
      }
    }, 1000);

    return () => { 
      clearInterval(interval); 
      supabase.removeChannel(channel); 
    };
  }, [isMounted, myId, params?.id, role]);

  const handlePick = async (name: string, cost: number) => {
    if (!params?.id || !role || status !== "DRAFTING" || team.length >= 5 || budget < cost) return;
    if (team.some(p => p.name === name) || oppTeam.some(p => p.name === name)) return;
    const newTeam = [...team, { name, cost }];
    const updatePayload = role === "p1" ? { p1_team: newTeam } : { p2_team: newTeam };
    await supabase.from("room").update(updatePayload).eq("id", params.id);
  };

  const myValue = useMemo(() => team.reduce((acc, p) => acc + p.cost, 0), [team]);
  const oppValue = useMemo(() => oppTeam.reduce((acc, p) => acc + p.cost, 0), [oppTeam]);

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
    handlePick
  };
}