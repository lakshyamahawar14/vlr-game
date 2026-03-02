"use client";

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
  status: "WAITING" | "DRAFTING" | "ENDED";
}

export default function DraftBoard({
  team,
  oppTeam,
  budget,
  onPick,
  categories,
  status,
}: Props) {
  if (!categories || categories.length === 0) return null;

  const isWaiting = status === "WAITING";
  const isFull = team.length >= 5;

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-all duration-300 ${
        isFull || isWaiting ? "opacity-40 pointer-events-none" : "opacity-100"
      }`}
    >
      {categories.map(({ cost, players }) => {
        const costNum = Number(cost);

        return (
          <div key={cost} className="border-[3px] border-black bg-white flex flex-col shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black text-white px-3 py-1 flex justify-between items-center shrink-0">
              <span className="text-[9px] font-black tracking-[0.2em] uppercase">Tier</span>
              <span className="text-xl font-black italic">${costNum}</span>
            </div>
            
            <div className="p-1.5 space-y-1.5 flex-1">
              {players.map((p) => {
                const isPicked = team.some((tp) => tp.name === p);
                const isOpponentPicked = oppTeam.some((tp) => tp.name === p);
                const canAfford = budget >= costNum;

                const isDisabled =
                  isWaiting ||
                  isPicked ||
                  isOpponentPicked ||
                  !canAfford ||
                  isFull;

                return (
                  <button
                    key={p}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) onPick(p, costNum);
                    }}
                    className={`
                      relative w-full text-left px-2 py-1 font-black uppercase transition-all border-2 h-[34px] flex items-center
                      ${
                        isWaiting
                          ? "bg-neutral-50 border-neutral-200 text-neutral-300 cursor-not-allowed"
                          : isPicked
                          ? "bg-[#A3E635] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : isOpponentPicked
                          ? "bg-red-600 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-not-allowed"
                          : !canAfford
                          ? "bg-neutral-50 border-neutral-200 text-neutral-300 border-dashed cursor-not-allowed"
                          : "bg-white border-black hover:bg-indigo-600 hover:text-white hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      }
                    `}
                  >
                    <div className="flex justify-between items-center w-full relative z-10">
                      <span className="text-[13px] tracking-tighter leading-none truncate pr-2">{p}</span>

                      <div className="flex items-center shrink-0 h-4">
                        {isWaiting ? (
                          <span className="text-[7px] opacity-40">LOCKED</span>
                        ) : isOpponentPicked ? (
                          <span className="bg-black text-white text-[7px] px-1 py-0.5 font-black">TAKEN</span>
                        ) : isPicked ? (
                          <span className="bg-black text-white text-[7px] px-1 py-0.5 font-black">OWNED</span>
                        ) : !canAfford ? (
                          <span className="text-[7px] text-red-600">LOW $</span>
                        ) : null}
                      </div>
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