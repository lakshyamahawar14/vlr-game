"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [hasChecked, setHasChecked] = useState(false);
  const [roomExists, setRoomExists] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<"p1" | "p2" | null>(null);
  const [timer, setTimer] = useState(30);

  const statusRef = useRef<string | null>(null);
  const roomCreatedAtRef = useRef<string | null>(null);
  const initialFetchDone = useRef(false);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedId = localStorage.getItem("vlr_duel_id");
    const storedName = localStorage.getItem("vlr_duel_username");
    setMyId(storedId);
    setMyName(storedName || (storedId ? `PLAYER_${storedId.slice(0, 4)}` : "PLAYER"));
  }, []);

  const syncRoomData = useCallback((data: any) => {
    if (!data || !myId) return;
    roomCreatedAtRef.current = data.created_at;
    if (statusRef.current !== data.status) {
      statusRef.current = data.status;
      setStatus(data.status);
    }
    const isP1 = data.p1_id === myId;
    setRole(isP1 ? "p1" : "p2");
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

  return { 
    params, myId, myName, oppName, isMounted, isLoading, setIsLoading, 
    roomExists, setRoomExists, hasChecked, setHasChecked, status, setStatus, 
    role, timer, setTimer, statusRef, roomCreatedAtRef, initialFetchDone, 
    leaveTimeoutRef, syncRoomData 
  };
}