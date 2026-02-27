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
    <div className={`lg:col-span-1 border-4 border-black relative overflow-hidden flex flex-col ${isPlayer ? 'bg-white' : 'bg-zinc-50'} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
      <div className={`absolute top-0 ${isPlayer ? 'left-0' : 'right-0'} w-16 h-16 opacity-10 pointer-events-none`}>
        <div className={`w-full h-full ${isPlayer ? 'bg-blue-600' : 'bg-red-600'} rotate-45 translate-y-[-50%] translate-x-[${isPlayer ? '-50%' : '50%'}]`} />
      </div>

      <div className={`p-4 border-b-4 border-black relative z-10 ${isPlayer ? 'text-left' : 'text-right'}`}>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-1">
          {isPlayer ? "COMMANDER_NAME" : "HOSTILE_ID"}
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
        <span className="text-[10px] font-black uppercase tracking-widest">Roster_Status</span>
        <span className="text-sm font-black italic">{team.length} / 5</span>
      </div>

      <div className="p-3 space-y-2 flex-1">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`
              relative h-14 border-2 transition-all flex items-center justify-between px-4 
              ${team[i] 
                ? "bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                : "bg-transparent border-dashed border-zinc-300 text-zinc-300"
              }
            `}
          >
            {team[i] ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 tracking-tighter">SLOT_0{i + 1}</span>
                  <span className="font-black uppercase italic tracking-tight truncate max-w-[100px] md:max-w-none">
                    {team[i].name}
                  </span>
                </div>
                <div className={`text-sm font-black italic p-1 border-l-2 border-black ml-2 ${isPlayer ? 'text-blue-600' : 'text-red-600'}`}>
                  ${team[i].cost}
                </div>
              </>
            ) : (
              <div className="w-full flex justify-between items-center opacity-40">
                <span className="text-[10px] font-black tracking-widest uppercase">Empty_Slot</span>
                <div className="w-4 h-[2px] bg-zinc-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`h-2 w-full ${isPlayer ? 'bg-blue-600' : 'bg-red-600'} opacity-20`} />
    </div>
  );
}