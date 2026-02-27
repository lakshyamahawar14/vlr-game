const CATEGORIES = {
  50: ["aspas", "TenZ", "ZywOo"],
  40: ["Derke", "Leo", "Chronicle"],
  30: ["Boaster", "Saadhak", "FNS"],
  20: ["Less", "Mazino", "Klaus"],
  10: ["BuZz", "Rb", "Zest"]
};

type Player = { name: string; cost: number };

interface Props {
  team: Player[];
  oppTeam: Player[];
  budget: number;
  onPick: (name: string, cost: number) => void;
}

export default function DraftBoard({ team, oppTeam, budget, onPick }: Props) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${team.length >= 5 ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
      {Object.entries(CATEGORIES).sort((a, b) => Number(b[0]) - Number(a[0])).map(([cost, players]) => (
        <div key={cost} className="border-2 border-black p-2 bg-white">
          <div className="bg-black text-white text-center mb-3 font-black italic uppercase py-1 text-lg md:text-xl">${cost}</div>
          <div className="space-y-1.5">
            {players.map((p) => {
              const costNum = parseInt(cost);
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
                  className={`w-full text-left p-3 font-black text-sm border-2 uppercase transition-all ${isPicked ? 'bg-green-400 border-black shadow-none translate-x-0.5 translate-y-0.5' : isOpponentPicked ? 'bg-red-400 border-black opacity-50 cursor-not-allowed' : !canAfford ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60' : isRosterFull ? 'bg-white border-black opacity-50 cursor-not-allowed' : 'bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50 hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none'}`}
                >
                  <div className="flex justify-between items-center">
                    <span>{p}</span>
                    {isOpponentPicked && <span className="text-[9px] bg-black text-white px-1">TAKEN</span>}
                    {!canAfford && !isPicked && !isOpponentPicked && <span className="text-[9px] text-red-500">MAX BUDGET</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}