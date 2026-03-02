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

  if (!isMounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <ArenaLoading />
      </div>
    );
  }

  if (!roomExists) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center">
        <RoomNotFound roomId={params.id as string} />
      </main>
    );
  }

  if (isLoading || status === "WAITING") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <ArenaLoading hasPool={!!categories} />
      </div>
    );
  }

  if (status === "ENDED") {
    return (
      <main className="min-h-screen w-full flex items-center justify-center">
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
          <div className="flex flex-col items-center justify-center p-12 border-[4px] border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 border-4 border-black border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-black">Synchronizing Data...</h2>
            <p className="text-[10px] font-black uppercase text-neutral-400 mt-2 tracking-[0.2em]">Calculating Final Ratings</p>
          </div>
        )}
      </main>
    );
  }

  if (status === "DRAFTING" && categories) {
    return (
      <main className="min-h-screen w-full flex flex-col">
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
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <ArenaLoading />
    </div>
  );
}