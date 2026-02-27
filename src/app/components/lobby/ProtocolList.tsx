export default function ProtocolList() {
  const serverId = "Oceania (Sydney) ap-southeast-2"

  const protocols = [
    { 
      id: "01", 
      rule: "Join the match by either Queuing up or sending/accepting duel requests to online players.",
      color: "text-blue-600"
    },
    { 
      id: "02", 
      rule: "Five catagories of players are available, each with a different cost. Build your roster within the $100 budget.",
      color: "text-emerald-600"
    },
    { 
      id: "03", 
      rule: "One player can only be picked by one person. So if your opponent picks a player, you can no longer pick them for your roster.",
      color: "text-amber-600"
    },
    { 
      id: "04", 
      rule: "After 30 seconds, yours and your opponent's roster will be locked in and result of the duel will be decided by the average rating of the roster.",
      color: "text-purple-600"
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
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <div className="border-2 border-black p-2 bg-black text-white text-center">
          <p className="text-[10px] font-black tracking-widest uppercase">
            SERVER : {serverId}
          </p>
        </div>
      </div>
    </div>
  );
}