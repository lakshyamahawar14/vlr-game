"use client";

export default function ProtocolList() {
  const protocols = [
    { 
      id: "01", 
      rule: "Join the Live Queue or click DUEL on an online player to start a match.",
      color: "text-blue-600"
    },
    { 
      id: "02", 
      rule: "Draft exactly five players. Stay under the $100 budget to qualify.",
      color: "text-emerald-600"
    },
    { 
      id: "03", 
      rule: "You have 30 seconds. If the clock hits zero, your current roster locks.",
      color: "text-amber-600"
    },
    { 
      id: "04", 
      rule: "Picks are live. If an opponent takes a player, they are gone from the pool.",
      color: "text-purple-600"
    },
    { 
      id: "05", 
      rule: "The manager with the highest total roster value wins the duel.",
      color: "text-red-600"
    },
  ];

  return (
    <div className="w-full lg:w-80 h-full flex-1 border-b-4 lg:border-b-0 lg:border-r-4 border-black p-6 flex flex-col bg-gray-50">
      <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-1">
        <div className="w-3 h-3 bg-red-600 animate-pulse rounded-full" />
        <h2 className="text-xl font-black uppercase italic">GAME INSTRUCTIONS</h2>
      </div>
      
      <ul className="space-y-8">
        {protocols.map((p) => (
          <li key={p.id} className="flex gap-4 group">
            <span className={`font-black text-2xl leading-none ${p.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
              {p.id}
            </span>
            <div className="relative">
              <p className="text-[14px] font-black uppercase leading-snug text-gray-800">
                {p.rule}
              </p>
              <div className={`absolute -bottom-1 left-0 w-8 h-1 ${p.color.replace('text', 'bg')} opacity-40`} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <div className="border-2 border-black p-2 bg-black text-white text-center">
          <p className="text-[10px] font-black tracking-widest uppercase">Version : 1.0.0</p>
        </div>
      </div>
    </div>
  );
}