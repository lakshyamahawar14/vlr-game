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
    const myVal = parseFloat(myAvg);
    const oppVal = parseFloat(oppAvg);
    if (myVal > oppVal) return myName;
    if (oppVal > myVal) return oppName;
    return "DRAW";
  }, [myAvg, oppAvg, myName, oppName]);

  return (
    <div className="w-full bg-white border-4 border-black font-mono shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
      <div className="bg-yellow-400 border-b-4 border-black p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight">Post-Match_Report</h1>
          <p className="text-[10px] font-bold opacity-70">STATUS: {winnerName === "DRAW" ? "STALEMATE" : "DECISIVE_VICTORY"}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-black/60">Winner</p>
          <p className="text-xl md:text-2xl font-black uppercase underline decoration-black decoration-2">{winnerName}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
        <div className="flex-1 p-4 md:p-6 bg-emerald-50/30">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2">
            <h2 className="text-lg font-black uppercase tracking-tighter">{myName}</h2>
            <div className="text-right">
              <span className="text-[10px] block font-black text-emerald-600">AVG_RATING</span>
              <span className="text-3xl font-black italic leading-none">{myAvg}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {myTeam.map((p) => (
              <div key={p.name} className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase">{p.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 leading-none">${p.cost}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black bg-black text-white px-2 py-0.5">{(rawStats[p.name.toLowerCase()] || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 bg-red-50/30">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2">
            <h2 className="text-lg font-black uppercase tracking-tighter">{oppName}</h2>
            <div className="text-right">
              <span className="text-[10px] block font-black text-red-600">AVG_RATING</span>
              <span className="text-3xl font-black italic leading-none">{oppAvg}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {oppTeam.map((p) => (
              <div key={p.name} className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase">{p.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 leading-none">${p.cost}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black border-2 border-black px-2 py-0.5">{(rawStats[p.name.toLowerCase()] || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t-4 border-black bg-gray-50">
        <button 
          onClick={() => router.push("/")}
          className="w-full md:w-auto md:px-12 block mx-auto bg-black text-white py-4 font-black uppercase text-xl transition-all hover:bg-yellow-400 hover:text-black border-2 border-black active:translate-y-1"
        >
          Return_to_Lobby
        </button>
      </div>
    </div>
  );
}