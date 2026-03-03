"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import { useQueue } from "./useQueue";
import { useMatchmaking } from "./useMatchmaking";

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

  const queue = useQueue(myId, username);
  const matchmaking = useMatchmaking({
    myId,
    username,
    isQueuing: queue.isQueuing,
    onlineUsers: queue.onlineUsers,
    challengeStack: queue.challengeStack,
    presenceChannelRef: queue.presenceChannelRef,
    enqueue: queue.enqueue,
    setChallengeStack: queue.setChallengeStack,
  });

  useEffect(() => {
    const inviteCount = queue.challengeStack.length;
    const badge = inviteCount > 0 ? `(${inviteCount}) ` : "";
    document.title = `${badge}VLR DUEL - Realtime Roster Drafting 1v1 Duel Game`;
  }, [queue.challengeStack.length]); // Only run when count changes

  useEffect(() => {
    setIsMounted(true);
    const { id, name } = getStoredUser();
    setMyId(id);
    setUsername(name);
    queue.currentStatusRef.current.name = name;

    console.log("Initializing Lobby Channel for:", name);

    const channel = supabase.channel("global_lobby", {
      config: { presence: { key: id }, broadcast: { self: true } },
    });

    queue.presenceChannelRef.current = channel;

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

      console.log("Online Users Updated:", users.length);
      queue.setOnlineUsers(users);
      
      const me = users.find((u) => u.id === id);
      if (me) {
        queue.setIsQueuing(!!me.isQueuing);
        queue.currentStatusRef.current.isQueuing = !!me.isQueuing;
        queue.setIsWaitingForResponse(me.challenging || null);
        queue.currentStatusRef.current.challenging = me.challenging || null;
      }

      queue.setChallengeStack(users.filter((u) => u.challenging === id).map((u) => ({ id: u.id, name: u.name })));
    };

    channel
      .on("presence", { event: "sync" }, syncState)
      .on("presence", { event: "join" }, syncState)
      .on("presence", { event: "leave" }, syncState)
      .on("broadcast", { event: "duel_declined" }, (payload: any) => {
        if (payload.payload.challengerId === id) {
          console.log("Duel Declined by target");
          queue.currentStatusRef.current.challenging = null;
          queue.setIsWaitingForResponse(null);
          queue.enqueue(() => queue.trackPresence());
        }
      })
      .on("broadcast", { event: "duel_started" }, (payload: any) => {
        if (payload.payload.targetId === id || payload.payload.challengerId === id) {
          console.log("Match Starting! Redirecting to room:", payload.payload.roomId);
          router.push(`/room/${payload.payload.roomId}`);
        }
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to Global Lobby");
          await queue.trackPresence();
        }
      });

    return () => { 
      console.log("Cleaning up Lobby Channel");
      supabase.removeChannel(channel); 
    };
  }, [myId, username]); 

  return {
    myId,
    username,
    setUsername,
    isMounted,
    ...queue,
    ...matchmaking
  };
}