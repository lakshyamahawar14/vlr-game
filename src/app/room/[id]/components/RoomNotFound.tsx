"use client";

import { useRouter } from "next/navigation";

interface Props {
  roomId: string;
}

export default function RoomNotFound({ roomId }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-mono relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none flex flex-col items-center justify-center">
        <span className="text-[25vw] font-black uppercase leading-none">404</span>
      </div>

      <div className="relative z-10 bg-black text-white w-full max-w-2xl border-4 border-black shadow-[16px_16px_0px_0px_rgba(220,38,38,1)] p-8 md:p-16 text-center">
        <div className="mb-8 relative inline-block">
          <div className="absolute -inset-4 border-2 border-red-600 animate-pulse opacity-50" />
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            SIGNAL <span className="text-red-600">LOST</span>
          </h2>
        </div>

        <div className="mb-10 space-y-4">
          <p className="text-gray-400 text-sm font-black uppercase tracking-widest">
            The requested arena protocol does not exist or has been terminated.
          </p>
          
          <div className="bg-zinc-900 p-4 border-l-4 border-red-600 inline-block w-full">
            <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-[0.2em]">Invalid_Room_Signature</p>
            <p className="text-xs md:text-sm text-red-500 break-all font-black">
              {roomId}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="group relative bg-white text-black px-12 py-4 font-black uppercase text-xl transition-all hover:bg-yellow-400 active:translate-y-1 w-full md:w-auto"
          >
            <span className="relative z-10">Return to HQ</span>
            <div className="absolute inset-0 border-2 border-white translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all -z-10" />
          </button>

          <div className="flex gap-4">
            <span className="w-3 h-3 bg-red-600 animate-ping" />
            <span className="w-3 h-3 bg-zinc-700" />
            <span className="w-3 h-3 bg-zinc-700" />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between opacity-20 text-[8px] font-black uppercase tracking-[0.3em]">
          <span>ERR_CODE: NULL_VOX</span>
          <span>STT: DISCONNECTED</span>
        </div>
      </div>
    </div>
  );
}