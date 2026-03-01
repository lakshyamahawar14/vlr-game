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
    oppLeft,
    results
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
          {results ? (
            <ResultScreen
              myName={myName}
              oppName={oppName}
              myTeam={team}
              oppTeam={oppTeam}
              rawStats={rawStats}
              results={results}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-10 h-10 border-4 border-black border-t-yellow-400 rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-black uppercase italic">Calculating Results...</h2>
            </div>
          )}
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