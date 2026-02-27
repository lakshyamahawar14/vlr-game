"use client";

import { useMemo, useState, useEffect } from "react";

type Player = { name: string; cost: number };

interface Props {
  team: Player[];
  oppTeam: Player[];
  budget: number;
  onPick: (name: string, cost: number) => void;
  categories: Record<string | number, string[]>;
}

export default function DraftBoard({ team, oppTeam, budget, onPick, categories }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  const sortedCategories = useMemo(() => {
    const entries = Object.entries(categories || {});
    return entries.sort(([costA], [costB]) => Number(costB) - Number(costA));
  }, [categories]);

  useEffect(() => {
    const hasData = Object.keys(categories || {}).length > 0;
    
    if (hasData) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [categories]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 border-4 border-black bg-yellow-300">
        <div className="text-4xl font-black italic animate-bounce mb-4 text-black">
          LOADING...
        </div>
        <p className="font-black uppercase text-xs tracking-tighter">
          Initialising Draft Sequence
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-500 ${team.length >= 5 ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
      {sortedCategories.map(([cost, players]) => {
        const costNum = Number(cost);
        
        return (
          <div key={cost} className="border-4 border-black bg-gray-50 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1">
              <div className="w-1.5 h-1.5 bg-black rotate-45" />
            </div>
            
            <div className="bg-black text-white px-4 py-2 flex justify-between items-center">
              <span className="text-xs font-black tracking-[0.3em]">Pick Category</span>
              <span className="text-2xl font-black italic">${costNum}</span>
            </div>

            <div className="p-3 space-y-2">
              {players.map((p) => {
                const isPicked = team.some(tp => tp.name === p);
                const isOpponentPicked = oppTeam.some(tp => tp.name === p);
                const canAfford = budget >= costNum;
                const isRosterFull = team.length >= 5;
                const isDisabled = isPicked || isOpponentPicked || !canAfford || isRosterFull;

                return (
                  <button 
                    key={p} 
                    onClick={() => onPick(p, costNum)} 
                    disabled={isDisabled} 
                    className={`
                      group relative w-full text-left p-4 font-black uppercase transition-all border-2 
                      ${isPicked 
                        ? 'bg-emerald-400 border-black translate-x-1 translate-y-1 shadow-none' 
                        : isOpponentPicked 
                        ? 'bg-gray-200 border-black/20 opacity-60 cursor-not-allowed grayscale' 
                        : !canAfford 
                        ? 'bg-white border-dashed border-gray-300 text-gray-300 cursor-not-allowed' 
                        : 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-black tracking-widest leading-none mb-1">AGENT</span>
                        <span className="text-lg leading-none tracking-tighter">{p}</span>
                      </div>

                      {isOpponentPicked ? (
                        <div className="bg-red-600 text-white text-[10px] px-2 py-1 rotate-12 border border-black">
                          ALREADY TAKEN
                        </div>
                      ) : isPicked ? (
                        <div className="bg-black text-white text-[10px] px-2 py-1 border border-black">
                          PICKED
                        </div>
                      ) : !canAfford && (
                        <div className="text-[10px] text-red-600 font-black animate-pulse">
                          LOW BUDGET
                        </div>
                      )}
                    </div>
                    
                    {!isDisabled && (
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-black" />
                      </div>
                    )}
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