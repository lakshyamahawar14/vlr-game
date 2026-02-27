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

  const myVal = parseFloat(myAvg);
  const oppVal = parseFloat(oppAvg);
  
  const iWon = myVal > oppVal;
  const oppWon = oppVal > myVal;

  const winnerName = useMemo(() => {
    if (iWon) return myName;
    if (oppWon) return oppName;
    return "DRAW";
  }, [iWon, oppWon, myName, oppName]);

  return (
    <div className="w-full bg-white border-[4px] border-black font-mono shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
      <div className="border-b-[4px] border-black p-6 flex flex-col items-center justify-center bg-[#FF9F43] text-black transition-colors">
        <p className="text-[12px] font-black uppercase tracking-[0.3em] mb-1 opacity-90">
          Winner
        </p>
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
          {winnerName}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row divide-y-[4px] md:divide-y-0 md:divide-x-[4px] divide-black">
        <div className={`flex-1 p-4 md:p-6 ${iWon ? "bg-emerald-50/50" : oppWon ? "bg-red-50/50" : "bg-gray-50/50"}`}>
          <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2">
            <h2 className="text-lg font-black uppercase tracking-tighter">{myName}</h2>
            <div className="text-right">
              <span className={`text-[10px] block font-black ${iWon ? "text-emerald-600" : oppWon ? "text-red-600" : "text-gray-600"}`}>AVG_RATING</span>
              <span className={`text-3xl font-black italic leading-none ${iWon ? "text-emerald-600" : oppWon ? "text-red-600" : "text-black"}`}>{myAvg}</span>
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
                  <span className={`text-xs font-black px-2 py-0.5 border-2 border-black ${iWon ? "bg-emerald-500 text-white" : oppWon ? "bg-red-500 text-white" : "bg-black text-white"}`}>
                    {(rawStats[p.name.toLowerCase()] || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`flex-1 p-4 md:p-6 ${oppWon ? "bg-emerald-50/50" : iWon ? "bg-red-50/50" : "bg-gray-50/50"}`}>
          <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2">
            <h2 className="text-lg font-black uppercase tracking-tighter">{oppName}</h2>
            <div className="text-right">
              <span className={`text-[10px] block font-black ${oppWon ? "text-emerald-600" : iWon ? "text-red-600" : "text-gray-600"}`}>AVG_RATING</span>
              <span className={`text-3xl font-black italic leading-none ${oppWon ? "text-emerald-600" : iWon ? "text-red-600" : "text-black"}`}>{oppAvg}</span>
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
                  <span className={`text-xs font-black px-2 py-0.5 border-2 border-black ${oppWon ? "bg-emerald-500 text-white" : iWon ? "bg-red-500 text-white" : "bg-black text-white"}`}>
                    {(rawStats[p.name.toLowerCase()] || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t-[4px] border-black bg-gray-50">
        <button 
          onClick={() => router.push("/")}
          className="w-full md:w-auto md:px-12 block mx-auto bg-black text-white py-4 font-black uppercase text-xl transition-all hover:bg-yellow-400 hover:text-black border-2 border-black active:translate-y-1"
        >
          Return to Lobby
        </button>
      </div>
    </div>
  );
}