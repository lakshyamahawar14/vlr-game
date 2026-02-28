"use client";

import { useRoom } from "./hooks/useRoom";
import Arena from "./components/Arena";
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
    handlePick,
    categories,
    rawStats,
    oppLeft
  } = useRoom();

  if (!isMounted || (isLoading && !team.length && !oppTeam.length) || !status) {
    return <ArenaLoading />;
  }

  if (!roomExists) {
    return <RoomNotFound roomId={params.id as string} />;
  }

  if (status === "ENDED") {
    return (
      <div className="min-h-screen bg-white p-4 font-mono text-black flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl">
          <ResultScreen
            myName={myName}
            oppName={oppName}
            myTeam={team}
            oppTeam={oppTeam}
            rawStats={rawStats}
          />
        </div>
      </div>
    );
  }

  if (status === "DRAFTING" && categories) {
    return (
      <div className="min-h-screen bg-white p-4 font-mono text-black flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl">
          <Arena
            myName={myName}
            oppName={oppName}
            team={team}
            oppTeam={oppTeam}
            budget={budget}
            timer={timer}
            status={status}
            handlePick={handlePick}
            categories={categories as any}
            oppLeft={oppLeft}
          />
        </div>
      </div>
    );
  }

  return <ArenaLoading />;
}