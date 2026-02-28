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
    if (isEnded) return "bg-[#A855F7]";
    if (!isDrafting) return "bg-gray-100";
    if (isUrgent) return timer % 2 === 0 ? "bg-[#FF5757]" : "bg-[#FFDE59]";
    return "bg-white";
  };

  return (
    <div className="">
      <div
        className={`
          flex flex-col md:grid border-[4px] border-black bg-white
          ${isEnded ? "grid-cols-1" : "md:grid-cols-3"}
        `}
      >
        {!isEnded && (
          <>
            <div className="p-4 border-b-[4px] md:border-b-0 md:border-r-[4px] border-black bg-[#5271FF]">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/80">
                Budget
              </p>
              <div className="text-3xl font-black tracking-tight text-white leading-none">
                ${(budget ?? 0).toLocaleString()}
              </div>
            </div>

            <div
              className={`
                p-4 flex flex-col items-center justify-center
                border-b-[4px] md:border-b-0 md:border-r-[4px] border-black
                ${getTimerBg()}
              `}
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-black/60">
                {isDrafting ? "Timer" : "Status"}
              </p>
              <div className="text-3xl font-black tabular-nums tracking-tighter leading-none text-center">
                {isDrafting ? `${timer}s` : "WAITING"}
              </div>
            </div>

            <div className="p-4 bg-[#A855F7] flex flex-col md:items-end justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/80">
                Phase
              </p>
              <div className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                {status || "STANDBY"}
              </div>
            </div>
          </>
        )}

        {isEnded && (
          <div className="p-4 flex flex-col items-center justify-center bg-[#A855F7]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 text-white/90">
              Match Status
            </p>
            <div className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none text-center">
              FINISHED {oppLeft && "(OPPONENT LEFT)"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}