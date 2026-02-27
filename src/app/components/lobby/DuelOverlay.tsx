"use client";

interface Props {
  challengeStack: { id: string; name: string }[];
  onAccept: () => void;
  onDecline: () => void;
}

export default function DuelOverlay({ challengeStack, onAccept, onDecline }: Props) {
  if (challengeStack.length === 0) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
      
      <div className="relative mb-8 text-center">
        <div className="inline-block px-3 py-1 bg-red-600 text-black text-[10px] font-black uppercase mb-4 tracking-[0.2em] animate-bounce">
          System Intrusion
        </div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
          Inbound Challenge ({challengeStack.length})
        </p>
        <h3 className="text-4xl md:text-5xl font-black uppercase italic text-white tracking-tighter leading-none break-all">
          {challengeStack[0].name}
        </h3>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs relative">
        <button 
          onClick={onAccept} 
          className="relative group bg-white text-black py-5 text-xl font-black uppercase transition-all hover:-translate-y-1 hover:bg-emerald-400 active:translate-y-0"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Accept Duel
          </span>
          <div className="absolute inset-0 border-2 border-white translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all -z-10" />
        </button>

        <button 
          onClick={onDecline} 
          className="py-3 text-sm font-black uppercase text-white border-2 border-white/20 hover:border-red-600 hover:text-red-600 transition-colors"
        >
          Decline
        </button>
      </div>

      <div className="mt-12 opacity-10 flex gap-4 pointer-events-none">
        <span className="text-6xl font-black uppercase">DUEL</span>
        <span className="text-6xl font-black uppercase outline-text">DUEL</span>
      </div>

      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1px white;
          color: transparent;
        }
      `}</style>
    </div>
  );
}