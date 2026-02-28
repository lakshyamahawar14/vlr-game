import { memo } from "react";

const ProtocolList = memo(function ProtocolList() {
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
    <aside className="w-full lg:w-80 h-full lg:h-screen flex flex-col bg-white border-r-4 border-black">
      <div className="p-4 border-b-4 border-black bg-indigo-600">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black uppercase text-white leading-none tracking-tight">
            Game Instructions
          </h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        <ul className="space-y-3">
          {protocols.map((p) => (
            <li key={p.id} className="p-4 border-2 border-black bg-white flex gap-4">
              <span className="font-black text-xl text-indigo-600 leading-none">
                {p.id}
              </span>
              <p className="text-sm font-bold uppercase tracking-tight leading-tight text-black">
                {p.rule}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
});

export default ProtocolList;