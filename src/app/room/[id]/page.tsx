"use client";

import { useRoom } from "./hooks/useRoom";
import ArenaHeader from "./components/ArenaHeader";
import TeamDisplay from "./components/TeamDisplay";
import DraftBoard from "./components/DraftBoard";
import ResultScreen from "./components/ResultScreen";
import RoomNotFound from "./components/RoomNotFound";
import ArenaLoading from "./components/ArenaLoading";

export default function RoomPage() {
  const {
    params,
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
  } = useRoom();

  if (!isMounted || isLoading) {
    return <ArenaLoading />;
  }

  if (!roomExists) {
    return <RoomNotFound roomId={params.id as string} />;
  }

  const isDrafting = status === "DRAFTING";

  return (
    <div className="min-h-screen bg-white p-4 max-w-7xl mx-auto font-mono text-black">
      <ArenaHeader 
        budget={budget} 
        status={status} 
        timer={timer} 
        oppLeft={oppLeft}
      />

      {isDrafting ? (
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
          <TeamDisplay 
            name={myName} 
            value={myValue} 
            team={team} 
            variant="player" 
          />

          <div className="lg:col-span-2">
            <DraftBoard 
              team={team} 
              oppTeam={oppTeam} 
              budget={budget} 
              onPick={handlePick} 
              categories={categories || {}}
            />
          </div>

          <TeamDisplay 
            name={oppName} 
            value={oppValue} 
            team={oppTeam} 
            variant="opponent" 
          />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <ResultScreen 
            myName={myName} 
            oppName={oppName} 
            myTeam={team}
            oppTeam={oppTeam}
            rawStats={rawStats}
          />
        </div>
      )}
    </div>
  );
}