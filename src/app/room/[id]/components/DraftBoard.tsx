"use client";

import { useMemo } from "react";

type Player = { name: string; cost: number };

interface Category {
  cost: number;
  players: string[];
}

interface Props {
  team: Player[];
  oppTeam: Player[];
  budget: number;
  onPick: (name: string, cost: number) => void;
  categories: Category[];
}

export default function DraftBoard({ team, oppTeam, budget, onPick, categories }: Props) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-opacity duration-500 ${team.length >= 5 ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
      {categories.map(({ cost, players }) => {
        const costNum = Number(cost);
        return (
          <div key={cost} className="border-2 border-black bg-white flex flex-col">
            <div className="bg-black text-white px-3 py-1.5 flex justify-between items-center">
              <span className="text-[10px] font-black tracking-[0.3em]">Category</span>
              <span className="text-xl font-black italic">${costNum}</span>
            </div>

            <div className="p-2 space-y-1">
              {players.map((p) => {
                const isPicked = team.some(tp => tp.name === p);
                const isOpponentPicked = oppTeam.some(tp => tp.name === p);
                const canAfford = budget >= costNum;
                const isDisabled = isPicked || isOpponentPicked || !canAfford || team.length >= 5;

                return (
                  <button 
                    key={p} 
                    onClick={() => onPick(p, costNum)} 
                    disabled={isDisabled} 
                    className={`
                      relative w-full text-left px-3 py-[10px] font-black uppercase transition-colors border
                      ${isPicked 
                        ? 'bg-emerald-400 border-black' 
                        : isOpponentPicked 
                        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed grayscale' 
                        : !canAfford 
                        ? 'bg-white border-dashed border-gray-200 text-gray-300 cursor-not-allowed' 
                        : 'bg-white border-black hover:bg-yellow-300'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center relative z-10 h-3">
                      <span className="text-sm tracking-tighter leading-none">{p}</span>
                      {isOpponentPicked ? (
                        <div className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 border border-black leading-none">TAKEN</div>
                      ) : isPicked ? (
                        <div className="bg-black text-white text-[8px] px-1.5 py-0.5 border border-black leading-none">PICKED</div>
                      ) : !canAfford && (
                        <div className="text-[8px] text-red-600 font-black leading-none">LOW BUDGET</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}