"use client";

import { getStoredUser } from "@/lib/auth";
import ArenaHeader from "./ArenaHeader";
import TeamDisplay from "./TeamDisplay";
import DraftBoard from "./DraftBoard";
import { Player } from "../hooks/useRoom";

interface Props {
  roomId: string;
  userId: string;
  oppName: string;
  team: Player[];
  oppTeam: Player[];
  budget: number;
  timer: number;
  status: string | null;
  handlePick: (name: string, cost: number) => void;
  categories: any; 
  oppLeft?: boolean;
  myValue: number;
  oppValue: number;
}

export default function Arena({
  roomId,
  userId,
  oppName,
  team,
  oppTeam,
  budget,
  timer,
  status,
  handlePick,
  categories,
  oppLeft,
  myValue,
  oppValue
}: Props) {
  const { name: myName } = getStoredUser();
  const isWaiting = status === "WAITING" || status === "READY";
  const isDrafting = status === "DRAFTING";

  const formattedCategories = categories && !Array.isArray(categories) 
    ? Object.entries(categories).map(([cost, players]) => ({
        cost: Number(cost),
        players: players as string[]
      })).sort((a, b) => b.cost - a.cost)
    : categories;

  return (
    <div className="relative min-h-screen w-full bg-[#F2F2F2] overflow-x-hidden font-sans">
      <div 
        className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #4f46e5 1px, transparent 1px),
            linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
          `, 
          backgroundSize: '32px 32px' 
        }} 
      />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6">
        <ArenaHeader budget={budget} status={status} timer={timer} oppLeft={oppLeft} />

        {isWaiting && (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black animate-pulse">
              Waiting for <span className="text-indigo-600">Opponent</span>
            </h2>
          </div>
        )}

        {isDrafting && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 order-2 lg:order-1">
              <TeamDisplay
                name={myName}
                value={myValue}
                team={team}
                variant="player"
                roomId={roomId}
                userId={userId}
              />
            </div>

            <div className="flex-[2] order-1 lg:order-2">
              <DraftBoard
                team={team}
                oppTeam={oppTeam}
                budget={budget}
                onPick={handlePick}
                categories={formattedCategories}
                status={status as "DRAFTING"}
              />
            </div>

            <div className="flex-1 order-3 lg:order-3">
              <TeamDisplay
                name={oppName}
                value={oppValue}
                team={oppTeam}
                variant="opponent"
                roomId={roomId}
                userId={userId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}