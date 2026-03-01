"use client";

import ArenaHeader from "./ArenaHeader";
import TeamDisplay from "./TeamDisplay";
import DraftBoard from "./DraftBoard";
import { Player } from "../hooks/useRoom";

interface Category {
  cost: number;
  players: string[];
}

interface Props {
  myName: string;
  oppName: string;
  team: Player[];
  oppTeam: Player[];
  budget: number;
  timer: number;
  status: string | null;
  handlePick: (name: string, cost: number) => void;
  categories: Category[];
  oppLeft?: boolean;
}

export default function Arena({
  myName,
  oppName,
  team,
  oppTeam,
  budget,
  timer,
  status,
  handlePick,
  categories,
  oppLeft
}: Props) {
  const isWaiting = status === "WAITING";
  const isDrafting = status === "DRAFTING";

  return (
    <div className="flex flex-col gap-6">
      <ArenaHeader budget={budget} status={status} timer={timer} oppLeft={oppLeft} />

      {isWaiting && (
        <div className="flex flex-col items-center justify-center py-12 font-black uppercase text-2xl italic tracking-tighter">
          <div className="animate-pulse">Waiting for opponent...</div>
        </div>
      )}

      {isDrafting && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 order-2 lg:order-1">
            <TeamDisplay
              name={myName}
              value={team.reduce((a, p) => a + p.cost, 0)}
              team={team}
              variant="player"
            />
          </div>

          <div className="flex-[2] order-1 lg:order-2">
            <DraftBoard
              team={team}
              oppTeam={oppTeam}
              budget={budget}
              onPick={handlePick}
              categories={categories}
              status={status!}
            />
          </div>

          <div className="flex-1 order-3 lg:order-3">
            <TeamDisplay
              name={oppName}
              value={oppTeam.reduce((a, p) => a + p.cost, 0)}
              team={oppTeam}
              variant="opponent"
            />
          </div>
        </div>
      )}
    </div>
  );
}