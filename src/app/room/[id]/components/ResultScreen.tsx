"use client";

import Link from "next/link";

type Player = { name: string; cost: number };

interface Props {
  myName: string;
  oppName: string;
  myTeam: Player[];
  oppTeam: Player[];
  rawStats: Record<string, number>;
  results: {
    myScore: number;
    oppScore: number;
    winnerName: string;
    iWon: boolean;
    oppWon: boolean;
    isDraw: boolean;
  };
}

export default function ResultScreen({
  myName,
  oppName,
  myTeam,
  oppTeam,
  rawStats,
  results,
}: Props) {
  const { myScore, oppScore, winnerName, iWon, oppWon, isDraw } = results;

  const getStatBadgeClass = (side: "me" | "opp") => {
    if (isDraw) return "bg-black text-white";
    if (side === "me") {
      return iWon ? "bg-[#A3E635] text-black" : "bg-red-600 text-white";
    } else {
      return oppWon ? "bg-[#A3E635] text-black" : "bg-red-600 text-white";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4 bg-[#F2F2F2] relative overflow-hidden font-sans">
      <div 
        className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #4f46e5 1px, transparent 1px),
            linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
          `, 
          backgroundSize: '32px 32px' 
        }} 
      />
      
      <div className="w-full max-w-5xl bg-white border-4 border-black flex flex-col shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10">
        
        <div
          className={`border-b-4 border-black p-4 flex flex-col items-center justify-center text-black relative ${
            iWon ? "bg-[#A3E635]" : oppWon ? "bg-red-600" : "bg-yellow-400"
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 text-black/60">
            {isDraw ? "MATCH DRAWN" : "VICTOR IDENTIFIED"}
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-center">
            {isDraw ? "NO WINNER" : winnerName}
          </h1>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
          
          <div className="p-4">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">{myName}</h2>
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1 block">YOUR ROSTER</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] block font-black text-neutral-400 uppercase tracking-widest">FINAL SCORE</span>
                <span className={`text-3xl font-black italic leading-none ${isDraw ? "text-black" : iWon ? "text-[#A3E635]" : "text-red-600"}`}>
                  {myScore.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {myTeam.map((p) => (
                <div key={p.name} className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 transition-transform">
                  <span className="text-xs font-black uppercase tracking-tight truncate mr-2">{p.name}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-black text-neutral-300">${p.cost}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 border-2 border-black ${getStatBadgeClass("me")}`}>
                      {(rawStats[p.name.toLowerCase()] || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">{oppName}</h2>
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1 block">ENEMY ROSTER</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] block font-black text-neutral-400 uppercase tracking-widest">FINAL SCORE</span>
                <span className={`text-3xl font-black italic leading-none ${isDraw ? "text-black" : oppWon ? "text-[#A3E635]" : "text-red-600"}`}>
                  {oppScore.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {oppTeam.map((p) => (
                <div key={p.name} className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 transition-transform">
                  <span className="text-xs font-black uppercase tracking-tight truncate mr-2">{p.name}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-black text-neutral-300">${p.cost}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 border-2 border-black ${getStatBadgeClass("opp")}`}>
                      {(rawStats[p.name.toLowerCase()] || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t-4 border-black bg-neutral-50 flex justify-center">
          <Link href="/" className="group relative inline-block">
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform" />
            <div className="relative px-10 py-3 bg-yellow-400 border-2 border-black text-xs font-black uppercase tracking-[0.2em] group-active:translate-x-0.5 group-active:translate-y-0.5 transition-all text-center">
              Return to Lobby
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}