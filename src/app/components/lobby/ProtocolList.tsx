import { memo } from "react";

const ProtocolList = memo(function ProtocolList() {
  // Logic removed as requested. System status defaults to Active.
  const isOnline = true; 

  const protocols = [
    { id: "01", rule: "Join the match by either Queuing up or sending/accepting duel requests to online players." },
    { id: "02", rule: "Five categories of players are available, each with a different cost. Build your roster within the $100 budget." },
    { id: "03", rule: "One player can only be picked by one person. So if your opponent picks a player, you can no longer pick them for your roster." },
    { id: "04", rule: "After 30 seconds, rosters lock and the duel is decided by the average rating of the roster." },
    { id: "05", rule: "The rating of a player is the R score they have on VLR.gg website stats page for VCT 2026." },
    { id: "06", rule: "FAIR PLAY: PLEASE TRY NOT TO CHEAT DURING THE GAME. Let's see if you know the BALL." },
    { id: "07", rule: "If you get stuck on loading screen, just RELOAD the website or queue in another match." },
  ];

  return (
    <aside className="w-full lg:w-80 h-full lg:h-screen flex flex-col bg-white border-r-4 border-black font-sans">
      <div className="p-4 border-b-4 border-black bg-indigo-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-8 h-full bg-black/10 -skew-x-12 -translate-x-4" />
        <h2 className="text-2xl font-black uppercase text-white leading-none tracking-tighter italic relative z-10">
          Protocols
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white scrollbar-hide">
        {protocols.map((p) => (
          <div key={p.id} className="group flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#0DA643] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-[10px] font-black bg-black text-white px-1.5 py-0.5 border border-black shadow-[2px_2px_0px_0px_#0DA643]">
                {p.id}
              </span>
              <div className="h-[2px] flex-1 bg-black/10" />
            </div>
            
            <p className="text-xs font-black uppercase tracking-tight leading-snug text-black/80 pl-3">
              {p.rule}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t-4 border-black bg-black">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#0DA643]" />
            <div className="absolute w-2 h-2 bg-[#0DA643] rounded-full animate-ping opacity-75" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] leading-none text-[#0DA643]">
            Server: Oceania (Sydney)
          </p>
        </div>
      </div>
    </aside>
  );
});

export default ProtocolList;