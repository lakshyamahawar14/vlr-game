export default function ProtocolList() {
  const serverId = "Oceania (Sydney) ap-southeast-2";

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
      rule: "FAIR PLAY: PLEASE TRY NOT TO CHEAT DURING THE GAME. Let's see if you know the BALL."
    },
    { 
      id: "07", 
      rule: "If you gets stuck while joining a match, or data is not visible, just RELOAD the website or queue in another match."
    },
  ];

  return (
    <aside className="w-full lg:w-80 h-full lg:h-screen flex flex-col bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-4 border-b-4 border-black bg-indigo-600">
        <h2 className="text-xl font-black uppercase italic text-white">
          Game Instructions
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        <ul className="space-y-8">
          {protocols.map((p) => (
            <li key={p.id} className="flex gap-4">
              <span className="font-black text-2xl text-indigo-600">
                {p.id}
              </span>
              <p className="text-sm font-bold uppercase leading-tight text-black">
                {p.rule}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t-4 border-black bg-yellow-400">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-black">Server Status</span>
          <p className="text-[11px] font-black text-black truncate">
            {serverId}
          </p>
        </div>
      </div>
    </aside>
  );
}