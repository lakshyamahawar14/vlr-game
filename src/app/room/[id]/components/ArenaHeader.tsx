interface Props {
  budget: number;
  status: string | null;
  timer: number;
}

export default function ArenaHeader({ budget, status, timer }: Props) {
  return (
    <>
      <style>{`
        @keyframes strobe-bg { 0%, 49% { background-color: #dc2626; color: white; } 50%, 100% { background-color: #fff; color: #dc2626; } }
        .animate-strobe-fast { animation: strobe-bg 1s steps(1) infinite; }
      `}</style>

      <div className="flex flex-col md:grid md:grid-cols-3 border-4 border-black p-4 md:p-5 mb-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] items-center gap-4">
        <div className="text-center md:text-left w-full">
          <p className="text-[10px] font-black text-gray-400 uppercase italic">Budget</p>
          <p className="text-4xl md:text-5xl font-black">${budget}</p>
        </div>
        <div className="flex justify-center w-full">
          <div className={`text-3xl md:text-5xl font-black italic px-6 py-2 border-[4px] border-black transition-all flex items-center justify-center w-full md:w-auto min-w-[150px] ${status === "DRAFTING" && timer <= 10 ? 'animate-strobe-fast' : 'bg-black text-white'}`}>
            {status === "DRAFTING" ? `${timer}S` : "FINISH"}
          </div>
        </div>
        <div className="text-center md:text-right w-full">
          <p className="text-[10px] font-black text-gray-400 uppercase italic">Status</p>
          <p className="text-2xl md:text-3xl font-black uppercase italic">{status}</p>
        </div>
      </div>
    </>
  );
}