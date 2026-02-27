"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

type Player = { name: string; cost: number };

interface Props {
  myName: string;
  oppName: string;
  myTeam: Player[];
  oppTeam: Player[];
  rawStats: Record<string, number>;
}

export default function ResultScreen({ myName, oppName, myTeam, oppTeam, rawStats }: Props) {
  const router = useRouter();

  const myAvg = useMemo(() => {
    const total = myTeam.reduce((acc, p) => acc + (rawStats[p.name.toLowerCase()] || 0), 0);
    return myTeam.length ? (total / myTeam.length).toFixed(2) : "0.00";
  }, [myTeam, rawStats]);

  const oppAvg = useMemo(() => {
    const total = oppTeam.reduce((acc, p) => acc + (rawStats[p.name.toLowerCase()] || 0), 0);
    return oppTeam.length ? (total / oppTeam.length).toFixed(2) : "0.00";
  }, [oppTeam, rawStats]);

  const winnerName = useMemo(() => {
    if (parseFloat(myAvg) > parseFloat(oppAvg)) return myName;
    if (parseFloat(oppAvg) > parseFloat(myAvg)) return oppName;
    return "DRAW";
  }, [myAvg, oppAvg, myName, oppName]);

  return (
    <div className="relative bg-black text-white p-8 md:p-12 border-4 border-black overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600" />
      
      <div className="flex justify-between items-start mb-8">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Operation_Status</p>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            {winnerName === "DRAW" ? "STALEMATE" : "DEBRIEF"}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className={`p-6 border-2 ${winnerName === myName ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10'}`}>
          <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
            <p className="text-xs font-black uppercase text-gray-400">{myName}</p>
            <p className="text-4xl font-black italic">{myAvg}</p>
          </div>
          <div className="space-y-2">
            {myTeam.map(p => (
              <div key={p.name} className="flex justify-between text-[10px] font-mono opacity-70">
                <span>{p.name.toUpperCase()}</span>
                <span className="text-emerald-400">R_{rawStats[p.name.toLowerCase()]?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 border-2 ${winnerName === oppName ? 'border-red-600 bg-red-600/5' : 'border-white/10'}`}>
          <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
            <p className="text-xs font-black uppercase text-gray-400">{oppName}</p>
            <p className="text-4xl font-black italic">{oppAvg}</p>
          </div>
          <div className="space-y-2">
            {oppTeam.map(p => (
              <div key={p.name} className="flex justify-between text-[10px] font-mono opacity-70">
                <span>{p.name.toUpperCase()}</span>
                <span className="text-red-500">R_{rawStats[p.name.toLowerCase()]?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mb-12 py-8 bg-zinc-900 border-x-4 border-yellow-400 text-center">
        <p className="text-xs font-black uppercase text-yellow-400 tracking-[0.5em] mb-3">Dominant Performance Detected</p>
        <div className="text-4xl md:text-6xl font-black uppercase italic tracking-tight">
          {winnerName}
        </div>
      </div>

      <button 
        onClick={() => router.push("/")} 
        className="group relative w-full bg-white text-black py-4 font-black uppercase text-xl transition-all hover:bg-yellow-400 active:translate-y-1"
      >
        <span className="relative z-10">Return to Lobby</span>
        <div className="absolute inset-0 border-2 border-white translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all -z-10" />
      </button>

      <div className="mt-8 text-center text-[10px] font-black uppercase text-gray-600 tracking-tighter">
        TIMESTAMP: {new Date().toLocaleTimeString()} // PROTOCOL_VLR_FINAL
      </div>
    </div>
  );
}