"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/lib/auth";
import { PresenceUser } from "./useLobby";

interface MatchmakingProps {
  myId: string;
  username: string;
  isQueuing: boolean;
  onlineUsers: PresenceUser[];
  challengeStack: { id: string; name: string }[];
  presenceChannelRef: React.MutableRefObject<any>;
  enqueue: (fn: () => Promise<void>) => void;
  setChallengeStack: (stack: { id: string; name: string }[]) => void;
}

export function useMatchmaking({
  myId,
  username,
  isQueuing,
  onlineUsers,
  challengeStack,
  presenceChannelRef,
  enqueue,
  setChallengeStack
}: MatchmakingProps) {
  const matchmakingLockRef = useRef<boolean>(false);

  const acceptDuel = () => {
    if (challengeStack.length === 0) return;
    const challenger = challengeStack[0];
    console.log("Accepting Duel from:", challenger.name);
    setChallengeStack([]);
    const roomId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    enqueue(async () => {
      const { name: actualName } = getStoredUser();
      const { error } = await supabase.from("room").insert([{
        id: roomId,
        p1_id: challenger.id,
        p2_id: myId,
        status: "WAITING",
        p1_joined: false,
        p2_joined: false,
        p1_name: challenger.name,
        p2_name: actualName,
        p1_budget: 100,
        p2_budget: 100
      }]);

      if (!error && presenceChannelRef.current) {
        console.log("Match Room Created:", roomId);
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
    console.log("Declining Duel from:", challengerId);
    setChallengeStack([]);
    enqueue(async () => {
      if (presenceChannelRef.current) {
        await presenceChannelRef.current.send({
          type: "broadcast",
          event: "duel_declined",
          payload: { challengerId },
        });
      }
    });
  };

  useEffect(() => {
    if (!isQueuing || matchmakingLockRef.current || !username || username === "YOU") return;

    const queueStack = onlineUsers
      .filter((u) => u.isQueuing)
      .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

    if (queueStack.length >= 2) {
      const p1 = queueStack[0];
      const p2 = queueStack[1];

      if (myId === p1.id) {
        console.log("Matchmaker: Found match between", p1.name, "and", p2.name);
        matchmakingLockRef.current = true;
        const other = p2;
        const roomId = `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

        enqueue(async () => {
          const { name: actualName } = getStoredUser();
          const { error } = await supabase.from("room").insert([{
            id: roomId,
            p1_id: myId,
            p2_id: other.id,
            status: "WAITING",
            p1_joined: false,
            p2_joined: false,
            p1_name: actualName,
            p2_name: other.name,
            p1_budget: 100,
            p2_budget: 100
          }]);

          if (error) {
            console.error("Matchmaker Error:", error);
            matchmakingLockRef.current = false;
          } else if (presenceChannelRef.current) {
            console.log("Matchmaker Success! Broadcasting room:", roomId);
            await presenceChannelRef.current.send({
              type: "broadcast",
              event: "duel_started",
              payload: { roomId, challengerId: myId, targetId: other.id },
            });
          }
        });
      }
    }
  }, [isQueuing, onlineUsers, myId, username, enqueue, presenceChannelRef]);

  return { acceptDuel, declineDuel, matchmakingLockRef };
}