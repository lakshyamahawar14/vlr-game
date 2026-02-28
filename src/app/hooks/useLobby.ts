"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export type PresenceUser = {
  id: string;
  name: string;
  challenging?: string | null;
  isQueuing?: boolean;
  joinedAt?: number;
};

export function useLobby() {
  const router = useRouter();
  const [myId, setMyId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [challengeStack, setChallengeStack] = useState<{ id: string; name: string }[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<string | null>(null);

  const presenceChannelRef = useRef<any>(null);
  const matchmakingLockRef = useRef<boolean>(false);
  const actionQueueRef = useRef<Promise<void>>(Promise.resolve());
  
  const currentStatusRef = useRef({
    name: "",
    isQueuing: false,
    challenging: null as string | null,
    joinedAt: 0
  });

  const enqueue = (fn: () => Promise<void>) => {
    actionQueueRef.current = actionQueueRef.current.then(fn).catch(() => {});
  };

  const trackPresence = async () => {
    if (!presenceChannelRef.current) return;
    const latestName = localStorage.getItem("vlr_duel_username") || currentStatusRef.current.name;
    if (latestName === "YOU") return;

    await presenceChannelRef.current.track({
      name: latestName,
      challenging: currentStatusRef.current.challenging,
      isQueuing: currentStatusRef.current.isQueuing,
      joinedAt: currentStatusRef.current.joinedAt
    });
  };

  const sendDuelRequest = (targetId: string) => {
    setIsWaitingForResponse(targetId);
    currentStatusRef.current.challenging = targetId;
    enqueue(() => trackPresence());
  };

  const cancelDuelRequest = () => {
    setIsWaitingForResponse(null);
    currentStatusRef.current.challenging = null;
    enqueue(() => trackPresence());
  };

  const acceptDuel = () => {
    if (challengeStack.length === 0) return;
    const challenger = challengeStack[0];
    setChallengeStack([]);
    const roomId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    enqueue(async () => {
      const actualName = localStorage.getItem("vlr_duel_username") || username;
      const { error } = await supabase.from("room").insert([{
        id: roomId, 
        p1_id: challenger.id, 
        p2_id: myId, 
        status: "DRAFTING",
        p1_name: challenger.name, 
        p2_name: actualName,
        p1_budget: 100,
        p2_budget: 100
      }]);
      if (!error && presenceChannelRef.current) {
        await presenceChannelRef.current.send({
          type: "broadcast", 
          event: "duel_started",
          payload: { roomId, challengerId: challenger.id, targetId: myId },
        });
      }
    });
  };

  const declineDuel = () => {
    if (challengeStack.length === 0) return;
    const challengerId = challengeStack[0].id;
    setChallengeStack([]);
    enqueue(async () => {
      if (presenceChannelRef.current) {
        await presenceChannelRef.current.send({
          type: "broadcast", event: "duel_declined", payload: { challengerId },
        });
      }
    });
  };

  const toggleQueue = () => {
    const next = !isQueuing;
    setIsQueuing(next);
    currentStatusRef.current.isQueuing = next;
    currentStatusRef.current.joinedAt = next ? Date.now() : 0;
    matchmakingLockRef.current = false;
    enqueue(() => trackPresence());
  };

  useEffect(() => {
    setIsMounted(true);
    const uid = localStorage.getItem("vlr_duel_id") || crypto.randomUUID();
    localStorage.setItem("vlr_duel_id", uid);
    setMyId(uid);

    const storedName = localStorage.getItem("vlr_duel_username") || `Player_${uid.slice(0, 4)}`;
    setUsername(storedName);
    currentStatusRef.current.name = storedName;

    const channel = supabase.channel("global_lobby", {
      config: { presence: { key: uid }, broadcast: { self: true } },
    });

    presenceChannelRef.current = channel;

    const syncState = () => {
      const state = channel.presenceState();
      const users = Object.entries(state).map(([key, value]: [string, any]) => {
        const p = value[0];
        return {
          id: key,
          name: p?.name && p.name !== "YOU" ? p.name : "Anonymous",
          challenging: p?.challenging ?? null,
          isQueuing: !!p?.isQueuing,
          joinedAt: p?.joinedAt || 0
        };
      });

      setOnlineUsers(users);
      const me = users.find((u) => u.id === uid);
      if (me) {
        setIsQueuing(!!me.isQueuing);
        currentStatusRef.current.isQueuing = !!me.isQueuing;
        setIsWaitingForResponse(me.challenging || null);
        currentStatusRef.current.challenging = me.challenging || null;
      }

      setChallengeStack(users.filter((u) => u.challenging === uid).map((u) => ({ id: u.id, name: u.name })));
    };

    channel
      .on("presence", { event: "sync" }, syncState)
      .on("presence", { event: "join" }, syncState)
      .on("presence", { event: "leave" }, syncState)
      .on("broadcast", { event: "duel_declined" }, (payload: any) => {
        if (payload.payload.challengerId === uid) {
          currentStatusRef.current.challenging = null;
          setIsWaitingForResponse(null);
          enqueue(() => trackPresence());
        }
      })
      .on("broadcast", { event: "duel_started" }, (payload: any) => {
        if (payload.payload.targetId === uid || payload.payload.challengerId === uid) {
          router.push(`/room/${payload.payload.roomId}`);
        }
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await trackPresence();
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  useEffect(() => {
    if (!isQueuing || matchmakingLockRef.current || !username || username === "YOU") return;

    const queueStack = onlineUsers
      .filter((u) => u.isQueuing)
      .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

    if (queueStack.length >= 2) {
      const p1 = queueStack[0];
      const p2 = queueStack[1];

      if (myId === p1.id || myId === p2.id) {
        if (myId === p1.id) {
          matchmakingLockRef.current = true;
          const other = p2;
          const roomId = `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          
          enqueue(async () => {
            const actualName = localStorage.getItem("vlr_duel_username") || username;
            const { error } = await supabase.from("room").insert([{
              id: roomId, 
              p1_id: myId, 
              p2_id: other.id, 
              status: "DRAFTING", 
              p1_name: actualName, 
              p2_name: other.name,
              p1_budget: 100,
              p2_budget: 100
            }]);

            if (error) {
              matchmakingLockRef.current = false;
            } else if (presenceChannelRef.current) {
              await presenceChannelRef.current.send({
                type: "broadcast", 
                event: "duel_started",
                payload: { roomId, challengerId: myId, targetId: other.id },
              });
            }
          });
        }
      }
    }
  }, [isQueuing, onlineUsers, myId, username]);

  return {
    myId, username, setUsername, isMounted, isQueuing, onlineUsers, challengeStack, isWaitingForResponse,
    sendDuelRequest, cancelDuelRequest, acceptDuel, declineDuel, toggleQueue, trackPresence, enqueue, currentStatusRef
  };
}