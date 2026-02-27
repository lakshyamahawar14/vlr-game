export default function ProtocolList() {
  const serverId = "Oceania (Sydney) ap-southeast-2"

  const protocols = [
    { 
      id: "01", 
      rule: "Join the match by either Queuing up or sending/accepting duel requests to online players."
    },
    { 
      id: "02", 
      rule: "Five categories of players are available, each with a different cost. Build your roster within the $100 budget."
    },
    { 
      id: "03", 
      rule: "One player can only be picked by one person. So if your opponent picks a player, you can no longer pick them for your roster."
    },
    { 
      id: "04", 
      rule: "After 30 seconds, yours and your opponent's roster will be locked in and result of the duel will be decided by the average rating of the roster."
    },
    { 
      id: "05", 
      rule: "The rating of a player is the R score they have on VLR.gg website stats page for VCT 2026."
    },
    { 
      id: "06", 
      rule: "FAIR PLAY PROTOCOL: PLEASE TRY NOT TO CHEAT DURING THE GAME. Let's see if you know the BALL."
    },
    { 
      id: "07", 
      rule: "If you gets stuck while joining a match, or data is not visible, just Reload the website or queue in another match."
    },
  ];

  return (
    <aside className="w-full lg:w-80 h-full lg:h-screen lg:sticky lg:top-0 border-b-4 lg:border-b-0 lg:border-r-4 border-black flex flex-col bg-[#FFF5F7] overflow-hidden">
      <div className="p-6 pb-4 bg-transparent">
        <div className="flex justify-between items-center border-b-4 border-indigo-600 pb-1">
          <h2 className="text-xl font-black uppercase italic flex items-center gap-2 text-black">
            <span className="w-2 h-6 bg-indigo-600 inline-block animate-pulse" />
            Game Instructions
          </h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 pt-0 
        scrollbar-thin 
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-[#FFE4E9]
        [&::-webkit-scrollbar-thumb]:bg-[#FDA4AF]
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:border-2
        [&::-webkit-scrollbar-thumb]:border-[#FFE4E9]">
        
        <ul className="space-y-8">
          {protocols.map((p) => (
            <li key={p.id} className="flex gap-4 group">
              <span className="font-black text-2xl leading-none text-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity">
                {p.id}
              </span>
              <div className="relative">
                <p className="text-[14px] font-black uppercase leading-snug text-slate-700">
                  {p.rule}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 pt-4 mt-auto">
        <div className="border-2 border-black p-2 bg-[#1E293B] text-white text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-black tracking-widest uppercase leading-tight">
            SERVER : {serverId}
          </p>
        </div>
      </div>
    </aside>
  );
}