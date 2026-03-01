"use client";

export default function ArenaLoading({ hasPool }: { hasPool?: boolean }) {
  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center font-mono">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none flex flex-col items-center justify-center">
        <span className="text-[20vw] font-black uppercase leading-none">ARENA</span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
          Loading <span className="text-red-600">Arena</span>
        </h2>

        <div className="text-center">
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-500">
            {hasPool ? "Opponent connecting..." : "Preparing for the duel..."}
          </p>
          {hasPool && (
            <p className="text-[9px] font-bold text-red-600 animate-pulse uppercase mt-2">
              Join timeout active: 15 seconds
            </p>
          )}
        </div>
      </div>

      <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-black" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-black" />
    </div>
  );
}