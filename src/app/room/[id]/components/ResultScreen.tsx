"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface Props {
  myName: string;
  oppName: string;
  myValue: number;
  oppValue: number;
}

export default function ResultScreen({ myName, oppName, myValue, oppValue }: Props) {
  const router = useRouter();

  const winnerName = useMemo(() => {
    if (myValue > oppValue) return myName;
    if (oppValue > myValue) return oppName;
    return "DRAW";
  }, [myValue, oppValue, myName, oppName]);

  const isWin = winnerName === myName;
  const isDraw = winnerName === "DRAW";

  return (
    <div className="relative bg-black text-white p-8 md:p-12 border-4 border-black overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600" />
      
      <div className="flex justify-between items-start mb-8">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Operation_Status</p>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            {isDraw ? "STALEMATE" : "DEBRIEF"}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-xs font-black border-2 border-white px-2 py-1 uppercase">
            VLR_SYS_88
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 items-center">
        <div className={`p-6 border-2 transition-all ${isWin ? 'border-green-500 bg-green-500/10' : 'border-white/10'}`}>
          <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{myName}</p>
          <p className="text-4xl md:text-5xl font-black tabular-nums">${myValue}</p>
          <p className="text-[9px] font-black mt-2 text-gray-500">TOTAL_ROSTER_VAL</p>
        </div>

        <div className="flex flex-col items-center justify-center py-4">
          <div className="h-px w-full bg-white/20 mb-2" />
          <span className="text-2xl font-black italic text-yellow-400">VS</span>
          <div className="h-px w-full bg-white/20 mt-2" />
        </div>

        <div className={`p-6 border-2 transition-all ${winnerName === oppName ? 'border-red-600 bg-red-600/10' : 'border-white/10'}`}>
          <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{oppName}</p>
          <p className="text-4xl md:text-5xl font-black tabular-nums">${oppValue}</p>
          <p className="text-[9px] font-black mt-2 text-gray-500">TOTAL_ROSTER_VAL</p>
        </div>
      </div>

      <div className="relative mb-12 py-8 bg-zinc-900 border-x-4 border-yellow-400">
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden flex items-center justify-center">
          <span className="text-6xl font-black uppercase whitespace-nowrap">MISSION_COMPLETE MISSION_COMPLETE</span>
        </div>
        
        <div className="relative z-10">
          <p className="text-xs font-black uppercase text-yellow-400 tracking-[0.5em] mb-3">Dominant Force Detected</p>
          <div className="text-4xl md:text-6xl font-black uppercase italic tracking-tight">
            {winnerName}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button 
          onClick={() => router.push("/")} 
          className="group relative flex-1 bg-white text-black py-4 font-black uppercase text-xl transition-all hover:bg-yellow-400 active:translate-y-1"
        >
          <span className="relative z-10">Return to Lobby</span>
          <div className="absolute inset-0 border-2 border-white translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all -z-10" />
        </button>
      </div>

      <div className="mt-8 flex justify-between text-[10px] font-black uppercase text-gray-600 tracking-tighter">
        <span>Terminal_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        <span>Timestamp: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}