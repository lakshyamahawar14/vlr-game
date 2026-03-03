"use client";

import { useEffect, useState } from "react";

interface ArenaLoadingProps {
  hasPool?: boolean;
  isEnded?: boolean;
  isFetching?: boolean;
  externalTimer?: number;
}

export default function ArenaLoading({ hasPool, isEnded, isFetching, externalTimer }: ArenaLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    return () => clearInterval(progressInterval);
  }, []);

  const getStatusText = () => {
    if (isFetching) return "Fetching Duel Data...";
    if (isEnded) return "Duel Concluded. Finalizing Stats...";
    if (hasPool) return "Waiting for Opponent to Join...";
    return "Preparing Player Pool...";
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#F2F2F2] flex flex-col items-center justify-center font-sans overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none flex flex-col items-center justify-center">
        <span className="text-[20vw] font-black uppercase leading-none tracking-tighter text-black">ARENA</span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full px-6">
        <div className="flex flex-col items-center w-full max-w-2xl">
          <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-black whitespace-nowrap">
            LOADING <span className="text-indigo-600">ARENA</span>
          </h2>
          <div className="w-full max-w-md h-1.5 bg-black/10 mt-6 overflow-hidden">
             <div 
               className="h-full bg-indigo-600 transition-all duration-75 ease-linear" 
               style={{ width: `${progress}%` }} 
             />
          </div>
        </div>

        <div className="text-center h-20">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-neutral-500">
              {getStatusText()}
            </p>
            
            {hasPool && !isEnded && !isFetching && externalTimer !== undefined && (
              <div className="bg-red-600/10 px-3 py-1 border border-red-600/20 mt-2">
                <p className="text-[10px] font-black text-red-600 animate-pulse uppercase tabular-nums">
                  JOIN TIMEOUT: {externalTimer}s
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-black" />
      <div className="absolute top-8 right-8 w-2 h-2 bg-red-600" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-black" />
      <div className="absolute bottom-8 left-8 w-2 h-2 bg-black" />
    </div>
  );
}