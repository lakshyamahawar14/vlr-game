"use client";

export default function ArenaLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none flex flex-col items-center justify-center">
        <span className="text-[20vw] font-black uppercase leading-none">LOADING</span>
        <span className="text-[20vw] font-black uppercase leading-none">LOADING</span>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-64 h-1 bg-gray-100 mb-8 overflow-hidden relative border border-black/5">
          <div className="absolute inset-0 bg-red-600 animate-loading-scan" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
            Arena <span className="text-red-600">Sync</span>
          </h2>
          
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-black rounded-full animate-bounce" />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-4 animate-pulse">
            Establishing Protocol...
          </p>
        </div>
      </div>

      <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-black" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-black" />

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-scan {
          animation: scan 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}