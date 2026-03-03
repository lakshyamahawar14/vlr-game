"use client";

import { useRoom } from "./hooks/useRoom";
import { useGame } from "./hooks/useGame";
import Arena from "./components/Arena";
import ResultScreen from "./components/ResultScreen";
import RoomNotFound from "./components/RoomNotFound";
import ArenaLoading from "./components/ArenaLoading";

export default function RoomPage() {
  const roomProps = useRoom();
  const gameProps = useGame(roomProps);

  if (!roomProps.isMounted || !roomProps.hasChecked) {
    return <ArenaLoading isFetching />;
  }

  if (!roomProps.roomExists) {
    return <RoomNotFound roomId={roomProps.params?.id as string} />;
  }

  if (roomProps.status === "ENDED") {
    return gameProps.results ? (
      <ResultScreen 
        oppName={roomProps.oppName} 
        myTeam={gameProps.team} 
        oppTeam={gameProps.oppTeam} 
        rawStats={gameProps.rawStats} 
        results={gameProps.results} 
      />
    ) : <ArenaLoading isEnded />;
  }

  if (roomProps.status === "WAITING" || roomProps.status === "READY") {
    return <ArenaLoading hasPool={!!gameProps.categories} externalTimer={roomProps.timer} />;
  }

  return (
    <Arena
      oppName={roomProps.oppName}
      team={gameProps.team}
      oppTeam={gameProps.oppTeam}
      budget={gameProps.budget}
      timer={roomProps.timer}
      status={roomProps.status}
      handlePick={gameProps.handlePick}
      categories={gameProps.categories}
      oppLeft={gameProps.oppLeft}
      myValue={gameProps.myValue}
      oppValue={gameProps.oppValue}
    />
  );
}