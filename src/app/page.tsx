"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLobby } from "@/app/hooks/useLobby";
import ProtocolList from "@/app/components/lobby/ProtocolList";
import PlayerLists from "@/app/components/lobby/PlayerLists";
import DuelOverlay from "@/app/components/lobby/DuelOverlay";
import MainHero from "@/app/components/lobby/MainHero";

export default function Home() {
  const {
    myId,
    username,
    setUsername,
    isMounted,
    isQueuing,
    setIsQueuing,
    onlineUsers,
    challengeStack,
    setChallengeStack,
    isWaitingForResponse,
    setIsWaitingForResponse,
    presenceChannelRef,
    matchmakingLockRef,
    enqueue,
    trackPresence,
  } = useLobby();

  const [isEditingName, setIsEditingName] = useState(false);

  const sendDuelRequest = (targetId: string) => {
    setIsWaitingForResponse(targetId);
    enqueue(() =>
      trackPresence({ name: username, challenging: targetId, isQueuing })
    );
  };

  const cancelDuelRequest = () => {
    setIsWaitingForResponse(null);
    enqueue(() =>
      trackPresence({ name: username, challenging: null, isQueuing })
    );
  };

  const acceptDuel = () => {
    if (challengeStack.length === 0) return;
    const challenger = challengeStack[0];
    setChallengeStack([]);
    const roomId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    enqueue(async () => {
      const { error } = await supabase.from("room").insert([
        {
          id: roomId,
          p1_id: challenger.id,
          p2_id: myId,
          status: "DRAFTING",
          p1_name: challenger.name,
          p2_name: username,
        },
      ]);

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
          type: "broadcast",
          event: "duel_declined",
          payload: { challengerId },
        });
      }
    });
  };

  const handleSaveName = () => {
    let clean = username.trim() || "Unknown";
    if (clean.length > 12) clean = clean.slice(0, 12);
    setUsername(clean);
    localStorage.setItem("vlr_duel_username", clean);
    setIsEditingName(false);
    enqueue(() =>
      trackPresence({ name: clean, challenging: isWaitingForResponse, isQueuing })
    );
  };

  const handleQueueAction = () => {
    const next = !isQueuing;
    setIsQueuing(next);
    matchmakingLockRef.current = false;
    enqueue(() =>
      trackPresence({ name: username, challenging: isWaitingForResponse, isQueuing: next })
    );
  };

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-black font-mono">
      <ProtocolList />

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="mb-8 flex flex-col items-center gap-2">
          <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Your Username</p>
          <div className="flex items-center gap-3 border-b-2 border-black pb-2">
            {isEditingName ? (
              <input value={username} onChange={(e) => setUsername(e.target.value)} onBlur={handleSaveName} onKeyDown={(e) => e.key === "Enter" && handleSaveName()} autoFocus maxLength={12} className="text-2xl font-black uppercase outline-none w-48 bg-yellow-50" />
            ) : (
              <span className="text-2xl font-black uppercase italic">{username}</span>
            )}
            <button onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)} className="text-xs bg-black text-white px-3 py-1 font-bold uppercase hover:bg-red-600">
              {isEditingName ? "CONFIRM" : "RENAME"}
            </button>
          </div>
          <p className="text-[10px] font-black uppercase text-gray-300">{`UID: ${myId.slice(0, 8)}`}</p>
        </div>

        <MainHero isQueuing={isQueuing} onQueueAction={handleQueueAction} />
      </div>

      <div className="w-full lg:w-80 border-t-4 lg:border-t-0 lg:border-l-4 border-black bg-gray-50 flex flex-col overflow-hidden relative">
        <DuelOverlay 
          challengeStack={challengeStack} 
          onAccept={acceptDuel} 
          onDecline={declineDuel} 
        />
        <PlayerLists 
          onlineUsers={onlineUsers} 
          myId={myId} 
          isWaitingForResponse={isWaitingForResponse} 
          onSendDuel={sendDuelRequest} 
          onCancelDuel={cancelDuelRequest} 
        />
      </div>
    </div>
  );
}