interface Props {
  budget: number;
  status: string | null;
  timer: number;
}

export default function ArenaHeader({ budget, status, timer }: Props) {
  const isUrgent = status === "DRAFTING" && timer <= 10;

  return (
    <>
      <style>{`
        @keyframes strobe-bg { 
          0%, 49% { background-color: #dc2626; color: white; border-color: #000; } 
          50%, 100% { background-color: #fff; color: #dc2626; border-color: #dc2626; } 
        }
        .animate-strobe-fast { animation: strobe-bg 0.4s steps(1) infinite; }
        .scanline {
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.05) 50%);
          background-size: 100% 4px;
        }
      `}</style>

      <div className="relative flex flex-col md:grid md:grid-cols-3 border-4 border-black mb-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-black flex">
          <div className="h-full w-1/3 bg-red-600" />
          <div className="h-full w-1/12 bg-yellow-400" />
        </div>

        <div className="p-4 md:p-6 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${status === "DRAFTING" ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Available Capital</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-red-600">$</span>
            <p className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              {budget.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="scanline absolute inset-0 pointer-events-none opacity-20" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 z-10">
            {status === "DRAFTING" ? "Decision Window" : "System Status"}
          </p>
          <div className={`
            relative z-10 text-4xl md:text-6xl font-black italic px-8 py-3 border-4 border-black transition-all flex items-center justify-center w-full min-w-[180px]
            ${isUrgent ? 'animate-strobe-fast scale-105' : 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'}
          `}>
            {status === "DRAFTING" ? (
              <span className="tabular-nums">{timer}<span className="text-2xl not-italic ml-1">S</span></span>
            ) : (
              "LOCKED"
            )}
          </div>
        </div>

        <div className="p-4 md:p-6 flex flex-col justify-center md:items-end">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Current Protocol</p>
          <div className="flex items-center gap-3">
            <p className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">
              {status || "Initializing"}
            </p>
            <div className="hidden md:block w-8 h-8 border-2 border-black rotate-45 flex-shrink-0 bg-yellow-400" />
          </div>
        </div>
      </div>
    </>
  );
}