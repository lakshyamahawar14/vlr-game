"use client";

import { getStoredUser } from "@/lib/auth";
import Ping from "./Ping";

type Player = { name: string; cost: number };

interface Props {
  name: string;
  value: number;
  team: Player[];
  variant: "player" | "opponent";
  roomId: string;
  userId: string;
}

export default function TeamDisplay({ name, value, team, variant, roomId, userId }: Props) {
  const isPlayer = variant === "player";
  const { name: myStoredName } = getStoredUser();
  const displayName = isPlayer ? myStoredName : name;

  return (
    <div className={`border-4 border-black flex flex-col bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
      <div className={`p-4 border-b-4 border-black ${isPlayer ? 'bg-white' : 'bg-neutral-50'}`}>
        
        {/* Container for Label and Ping */}
        <div className="flex justify-between items-center mb-1">
          <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.3em]">
            {isPlayer ? "Your Roster" : "Enemy Roster"}
          </p>
          <Ping roomId={roomId} userId={userId} isOpponent={!isPlayer} />
        </div>

        <h2 className="text-2xl font-black uppercase italic tracking-tighter truncate leading-none mb-3">
          {displayName}
        </h2>
        
        <div className={`inline-flex items-center gap-2 px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isPlayer ? 'bg-indigo-600' : 'bg-red-600'} text-white`}>
          <span className="text-[10px] font-black uppercase">Spent:</span>
          <span className="text-xl font-black tabular-nums leading-none">${value}</span>
        </div>
      </div>

      <div className={`flex items-center justify-between px-4 py-2 border-b-2 border-black ${isPlayer ? 'bg-[#A3E635]' : 'bg-yellow-400'}`}>
        <span className="text-[10px] font-black uppercase tracking-widest">Active Slots</span>
        <span className="text-sm font-black italic">{team.length} / 5</span>
      </div>

      <div className="p-3 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`h-14 border-2 flex items-center justify-between px-3 transition-all ${team[i] ? "bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" : "bg-neutral-50 border-dashed border-neutral-200 text-neutral-300"}`}
          >
            {team[i] ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase italic tracking-tight truncate max-w-[140px]">
                    {team[i].name}
                  </span>
                  <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">Drafted Unit</span>
                </div>
                <div className={`text-base font-black italic ${isPlayer ? 'text-indigo-600' : 'text-red-600'}`}>
                  ${team[i].cost}
                </div>
              </>
            ) : (
              <div className="w-full flex justify-between items-center opacity-40">
                <span className="text-[9px] font-black tracking-widest uppercase">Empty Slot {i + 1}</span>
                <div className="w-2 h-2 border border-neutral-300 rotate-45" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}