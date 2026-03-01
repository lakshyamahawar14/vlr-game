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

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-opacity duration-500 ${
        team.length >= 5 || isWaiting
          ? "opacity-40 grayscale pointer-events-none"
          : "opacity-100"
      }`}
    >
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

                const isDisabled =
                  isWaiting ||
                  isPicked ||
                  isOpponentPicked ||
                  !canAfford ||
                  team.length >= 5;

                return (
                  <button
                    key={p}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) onPick(p, costNum);
                    }}
                    className={`
                      relative w-full text-left px-3 py-[10px] font-black uppercase transition-colors border
                      ${
                        isWaiting
                          ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                          : isPicked
                          ? "bg-emerald-400 border-black"
                          : isOpponentPicked
                          ? "bg-red-500 border-black text-white opacity-100 cursor-not-allowed"
                          : !canAfford
                          ? "bg-white border-dashed border-gray-200 text-gray-300 cursor-not-allowed"
                          : "bg-white border-black hover:bg-yellow-300"
                      }
                    `}
                  >
                    <div className="flex justify-between items-center relative z-10 h-3">
                      <span className="text-sm tracking-tighter leading-none">{p}</span>

                      {isWaiting ? (
                        <div className="text-[8px] text-gray-400 font-black leading-none">
                          WAITING
                        </div>
                      ) : isOpponentPicked ? (
                        <div className="bg-black text-white text-[8px] px-1.5 py-0.5 border border-black leading-none">
                          TAKEN
                        </div>
                      ) : isPicked ? (
                        <div className="bg-black text-white text-[8px] px-1.5 py-0.5 border border-black leading-none">
                          PICKED
                        </div>
                      ) : !canAfford ? (
                        <div className="text-[8px] text-red-600 font-black leading-none">
                          LOW BUDGET
                        </div>
                      ) : null}
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