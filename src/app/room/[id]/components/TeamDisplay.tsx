"use client";

type Player = { name: string; cost: number };

interface Props {
  name: string;
  value: number;
  team: Player[];
  variant: "player" | "opponent";
}

export default function TeamDisplay({ name, value, team, variant }: Props) {
  const isPlayer = variant === "player";

  return (
    <div className={`lg:col-span-1 border-[4px] border-black flex flex-col ${isPlayer ? 'bg-white' : 'bg-zinc-50'}`}>
      <div className={`p-4 border-b-[4px] border-black ${isPlayer ? 'text-left' : 'text-right'}`}>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-1">
          {isPlayer ? "Your Roster" : "Opponent Roster"}
        </p>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter truncate leading-tight mb-2">
          {name}
        </h2>
        <div className={`inline-flex items-baseline gap-1 px-3 py-1 border-2 border-black ${isPlayer ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
          <span className="text-xs font-bold">$</span>
          <span className="text-2xl font-black tabular-nums leading-none">{value}</span>
        </div>
      </div>

      <div className={`flex items-center justify-between px-4 py-2 border-b-2 border-black ${isPlayer ? 'bg-yellow-300' : 'bg-zinc-200'}`}>
        <span className="text-[10px] font-black uppercase tracking-widest">Roster Status</span>
        <span className="text-sm font-black italic">{team.length} / 5</span>
      </div>

      <div className="p-3 space-y-2 flex-1">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`
              h-12 border-2 transition-all flex items-center justify-between px-3 
              ${team[i] 
                ? "bg-white border-black" 
                : "bg-transparent border-dashed border-zinc-200 text-zinc-300"
              }
            `}
          >
            {team[i] ? (
              <>
                <div className="flex flex-col">
                  <span className="font-black uppercase italic tracking-tight truncate max-w-[120px]">
                    {team[i].name}
                  </span>
                </div>
                <div className={`text-sm font-black italic ${isPlayer ? 'text-blue-600' : 'text-red-600'}`}>
                  ${team[i].cost}
                </div>
              </>
            ) : (
              <div className="w-full flex justify-between items-center opacity-30">
                <span className="text-[10px] font-black tracking-widest uppercase">Slot {i + 1}</span>
                <div className="w-4 h-[1px] bg-zinc-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}