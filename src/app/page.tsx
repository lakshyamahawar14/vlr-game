"use client";

import { useLobby } from "@/app/hooks/useLobby";
import ProtocolList from "@/app/components/lobby/ProtocolList";
import PlayerLists from "@/app/components/lobby/PlayerLists";
import DuelOverlay from "@/app/components/lobby/DuelOverlay";
import MainHero from "@/app/components/lobby/MainHero";

export default function Home() {
  const {
    myId, username, setUsername, isMounted, isQueuing,
    onlineUsers, challengeStack, isWaitingForResponse,
    sendDuelRequest, cancelDuelRequest, acceptDuel, declineDuel, 
    toggleQueue, trackPresence, enqueue, currentStatusRef
  } = useLobby();

  const handleSaveName = (newName: string) => {
    let clean = newName.trim() || "Unknown";
    if (clean.length > 12) clean = clean.slice(0, 12);
    
    setUsername(clean);
    localStorage.setItem("vlr_duel_username", clean);
    currentStatusRef.current.name = clean;
    
    enqueue(() => trackPresence());
  };

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-black font-mono overflow-x-hidden">
      <DuelOverlay 
        key={challengeStack[0]?.id || "empty"} 
        challengeStack={challengeStack} 
        onAccept={acceptDuel} 
        onDecline={declineDuel} 
      />
      
      <div className="order-3 lg:order-1 w-full lg:w-80 lg:sticky lg:top-0 lg:h-screen flex flex-col">
        <ProtocolList />
      </div>

      <div className="order-1 lg:order-2 flex-1 flex flex-col min-h-screen lg:min-h-0">
        <MainHero 
          myId={myId}
          username={username}
          setUsername={setUsername}
          isQueuing={isQueuing} 
          onQueueAction={toggleQueue} 
          onSaveName={handleSaveName}
        />
      </div>

      <div className="order-2 lg:order-3 w-full lg:w-80 lg:sticky lg:top-0 lg:h-screen flex flex-col bg-white">
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