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
        <ArenaLoading isFetching />
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

  if (isLoading && !status) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <ArenaLoading isFetching />
      </div>
    );
  }

  if (status === "WAITING" || status === "READY") {
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
          <ArenaLoading isEnded />
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
      <ArenaLoading isFetching />
    </div>
  );
}