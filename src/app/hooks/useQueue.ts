"use client";

import { useState, useRef } from "react";
import { getStoredUser } from "@/lib/auth";
import { PresenceUser } from "./useLobby";

export function useQueue(id: string, name: string) {
  const [isQueuing, setIsQueuing] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [challengeStack, setChallengeStack] = useState<{ id: string; name: string }[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<string | null>(null);

  const presenceChannelRef = useRef<any>(null);
  const actionQueueRef = useRef<Promise<void>>(Promise.resolve());

  const currentStatusRef = useRef({
    name: name,
    isQueuing: false,
    challenging: null as string | null,
    joinedAt: 0
  });

  const enqueue = (fn: () => Promise<void>) => {
    actionQueueRef.current = actionQueueRef.current.then(fn).catch(() => {});
  };

  const trackPresence = async () => {
    if (!presenceChannelRef.current) return;
    const { name: latestName } = getStoredUser();
    if (latestName === "YOU") return;

    console.log("Tracking Presence:", { ...currentStatusRef.current, name: latestName });

    await presenceChannelRef.current.track({
      name: latestName,
      challenging: currentStatusRef.current.challenging,
      isQueuing: currentStatusRef.current.isQueuing,
      joinedAt: currentStatusRef.current.joinedAt
    });
  };

  const sendDuelRequest = (targetId: string) => {
    console.log("Sending Duel Request to:", targetId);
    setIsWaitingForResponse(targetId);
    currentStatusRef.current.challenging = targetId;
    enqueue(() => trackPresence());
  };

  const cancelDuelRequest = () => {
    console.log("Canceling Duel Request");
    setIsWaitingForResponse(null);
    currentStatusRef.current.challenging = null;
    enqueue(() => trackPresence());
  };

  const toggleQueue = () => {
    const next = !isQueuing;
    console.log(next ? "Entering Queue" : "Leaving Queue");
    setIsQueuing(next);
    currentStatusRef.current.isQueuing = next;
    currentStatusRef.current.joinedAt = next ? Date.now() : 0;
    enqueue(() => trackPresence());
  };

  return {
    isQueuing,
    setIsQueuing,
    onlineUsers,
    setOnlineUsers,
    challengeStack,
    setChallengeStack,
    isWaitingForResponse,
    setIsWaitingForResponse,
    presenceChannelRef,
    currentStatusRef,
    enqueue,
    trackPresence,
    sendDuelRequest,
    cancelDuelRequest,
    toggleQueue
  };
}