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
    <div className={`lg:col-span-1 border-4 border-black p-4 ${isPlayer ? 'bg-blue-50' : 'bg-red-50'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
      <h2 className={`text-xl md:text-2xl font-black uppercase mb-2 border-b-2 border-black italic pb-1 flex flex-col ${isPlayer ? 'items-start' : 'items-end'}`}>
        <span className={`truncate w-full ${!isPlayer && 'text-right'}`}>{name}</span>
        <span className={`${isPlayer ? 'text-blue-600' : 'text-red-600'} text-lg md:text-xl italic`}>${value}</span>
      </h2>
      <div className={`w-full text-xs font-black uppercase text-black mb-3 px-2 py-0.5 border border-black text-center flex items-center justify-center min-h-[24px] ${isPlayer ? 'bg-yellow-300' : 'bg-red-200'}`}>
        Drafted: {team.length}/5
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-12 border-2 flex items-center justify-between px-3 font-black text-sm md:text-base uppercase italic ${team[i] ? "bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent border-dashed border-gray-300 text-gray-300"}`}>
            {team[i] ? (
              <>
                <span className="truncate">{team[i].name}</span>
                <span>${team[i].cost}</span>
              </>
            ) : (
              <span>---</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}