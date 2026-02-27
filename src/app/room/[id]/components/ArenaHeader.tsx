interface Props {
  budget?: number;
  status: string | null;
  timer: number;
}

export default function ArenaHeader({ budget, status, timer }: Props) {
  const isEnded = status === "ENDED";
  const isUrgent = status === "DRAFTING" && timer <= 10;

  const getTimerBg = () => {
    if (isEnded) return "bg-[#FF5757]";
    if (status !== "DRAFTING") return "bg-[#E0E0E0]";
    if (isUrgent) return timer % 2 === 0 ? "bg-[#FF5757]" : "bg-[#FFDE59]";
    return timer % 2 === 0 ? "bg-[#FFDE59]" : "bg-white";
  };

  return (
    <div className="m-4 md:m-5">
      <div className={`
        flex flex-col md:grid border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        ${isEnded ? 'grid-cols-1' : 'md:grid-cols-3'}
      `}>
        
        {!isEnded && (
          <>
            <div className="p-4 border-b-[4px] md:border-b-0 md:border-r-[4px] border-black bg-[#5271FF]">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/80">
                Available Budget
              </p>
              <div className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                ${(budget ?? 0).toLocaleString()}
              </div>
            </div>

            <div className={`
              p-4 flex flex-col items-center justify-center border-b-[4px] md:border-b-0 md:border-r-[4px] border-black 
              transition-colors duration-200 ${getTimerBg()}
            `}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-black/60">
                {status === "DRAFTING" ? "Timer" : "Status"}
              </p>
              <div className="text-3xl md:text-4xl font-black tabular-nums tracking-tighter leading-none text-center">
                {status === "DRAFTING" ? `${timer}s` : "LOCKED"}
              </div>
            </div>

            <div className="p-4 bg-[#A855F7] flex flex-col md:items-end justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/80">
                Match Status
              </p>
              <div className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                {status || "Standby"}
              </div>
            </div>
          </>
        )}

        {isEnded && (
          <div className="p-3 flex flex-col items-center justify-center bg-[#FF5757] animate-in fade-in duration-500">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-0.5 text-white/90">
              Match Status
            </p>
            <div className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
              FINISHED
            </div>
          </div>
        )}

      </div>
    </div>
  );
}