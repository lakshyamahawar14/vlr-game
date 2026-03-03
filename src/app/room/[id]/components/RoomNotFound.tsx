"use client";

import { useRouter } from "next/navigation";
import { Button } from "src/components/ui/Button";

interface Props {
  roomId: string;
}

export default function RoomNotFound({ roomId }: Props) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#F2F2F2] overflow-hidden font-sans">
      <div 
        className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #4f46e5 1px, transparent 1px),
            linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
          `, 
          backgroundSize: '32px 32px' 
        }} 
      />

      <div className="w-full max-w-xl border-4 border-black p-6 md:p-8 text-center bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
        
        <div className="mb-4">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-black">
            ROOM <span className="text-red-600">EXPIRED</span>
          </h2>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest leading-none">
            Inactivity timeout, invalid session, or decommissioned.
          </p>
          
          <div className="bg-[#F2F2F2] py-2 px-4 border-2 border-black relative group">
            <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter">
              Room ID
            </div>
            <p className="text-[10px] md:text-xs font-mono font-black break-all uppercase text-black">
              {roomId}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <Button
            onClick={() => router.push("/")}
            className="!bg-yellow-400 hover:!bg-yellow-300 !text-black border-2 !border-black italic font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 px-6 py-2 text-sm transition-colors min-w-[180px]"
          >
            Return to Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}