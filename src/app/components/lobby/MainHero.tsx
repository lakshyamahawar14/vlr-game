interface Props {
  isQueuing: boolean;
  onQueueAction: () => void;
}

export default function MainHero({ isQueuing, onQueueAction }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-1 italic text-center">
        VLR DUEL
      </h1>
      <p className="mb-12 text-gray-400 font-bold tracking-[0.4em] uppercase text-center text-[10px]">
        High-Stakes Tactical Drafting
      </p>

      <button
        onClick={onQueueAction}
        className={`w-full max-w-xs py-6 text-2xl font-black uppercase transition-all border-4 border-black bg-white text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
          isQueuing
            ? "!bg-black !text-white !shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
            : ""
        }`}
      >
        {isQueuing ? "ABORT" : "FIND MATCH"}
      </button>
    </div>
  );
}