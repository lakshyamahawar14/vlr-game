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

  return (
    <div className="bg-black text-white p-6 md:p-10 text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-4xl md:text-6xl font-black italic mb-1 uppercase tracking-tighter underline decoration-yellow-400 decoration-4 underline-offset-4">Result</h2>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 my-6 border-y border-white/20 py-6">
        <div className="text-center w-full md:w-1/3">
          <p className="text-gray-400 font-black uppercase text-[10px] mb-1">{myName}</p>
          <p className="text-4xl md:text-6xl font-black">${myValue}</p>
        </div>
        <div className="text-2xl font-black text-gray-500 italic">VS</div>
        <div className="text-center w-full md:w-1/3">
          <p className="text-gray-400 font-black uppercase text-[10px] mb-1">{oppName}</p>
          <p className="text-4xl md:text-6xl font-black">${oppValue}</p>
        </div>
      </div>
      <div className="mb-8">
        <p className="text-xs font-black uppercase text-red-500 tracking-widest mb-1">Victor Assigned</p>
        <div className="text-3xl md:text-5xl font-black uppercase italic bg-white text-black py-2 px-4 inline-block border-2 border-white shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]">
          {winnerName}
        </div>
      </div>
      <button 
        onClick={() => router.push("/")} 
        className="w-full md:w-auto bg-white text-black px-10 py-3 font-black uppercase border-2 border-white hover:bg-yellow-400 transition-colors"
      >
        Lobby
      </button>
    </div>
  );
}