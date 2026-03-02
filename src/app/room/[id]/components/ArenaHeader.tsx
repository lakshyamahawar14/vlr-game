"use client";

interface Props {
  budget?: number;
  status: string | null;
  timer: number;
  oppLeft?: boolean;
}

export default function ArenaHeader({ budget, status, timer, oppLeft }: Props) {
  const isEnded = status === "ENDED";
  const isDrafting = status === "DRAFTING";
  const isUrgent = isDrafting && timer <= 10;

  const getTimerBg = () => {
    if (isEnded) return "bg-indigo-600";
    if (!isDrafting) return "bg-neutral-100";
    if (isUrgent) return timer % 2 === 0 ? "bg-red-600" : "bg-yellow-400";
    return "bg-white";
  };

  const getTimerTextColor = () => {
    if (isEnded) return "text-white";
    if (isUrgent && timer % 2 === 0) return "text-white";
    return "text-black";
  };

  return (
    <div className="w-full">
      <div
        className={`
          flex flex-col md:grid border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          ${isEnded ? "grid-cols-1" : "md:grid-cols-3"}
        `}
      >
        {!isEnded && (
          <>
            <div className="p-4 border-b-[4px] md:border-b-0 md:border-r-[4px] border-black bg-indigo-600">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/70">
                Budget Remaining
              </p>
              <div className="text-4xl font-black tracking-tighter text-white leading-none">
                ${(budget ?? 0).toLocaleString()}
              </div>
            </div>

            <div
              className={`
                p-4 flex flex-col items-center justify-center
                border-b-[4px] md:border-b-0 md:border-r-[4px] border-black
                transition-colors duration-200
                ${getTimerBg()}
              `}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isUrgent && timer % 2 === 0 ? "text-white/70" : "text-black/50"}`}>
                {isDrafting ? "Time Remaining" : "Status"}
              </p>
              <div className={`text-4xl font-black tabular-nums tracking-tighter leading-none text-center ${getTimerTextColor()}`}>
                {isDrafting ? `${timer}s` : "WAITING"}
              </div>
            </div>

            <div className="p-4 bg-black flex flex-col md:items-end justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/50">
                Current Phase
              </p>
              <div className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                {status || "STANDBY"}
              </div>
            </div>
          </>
        )}

        {isEnded && (
          <div className="p-6 flex flex-col items-center justify-center bg-indigo-600">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 text-white/70">
              Match Results
            </p>
            <div className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-none text-center">
              FINISHED {oppLeft && <span className="text-red-400 opacity-90 block md:inline md:ml-4">(OPPONENT LEFT)</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}