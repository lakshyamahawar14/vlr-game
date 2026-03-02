"use client";

import { useRouter } from "next/navigation";
import { Button } from "src/components/ui/Button";

interface Props {
  roomId: string;
}

export default function RoomNotFound({ roomId }: Props) {
  const router = useRouter();

  const handleReload = () => {
    window.location.reload();
  };

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

      <div className="w-full max-w-xl border-4 border-black p-8 md:p-12 text-center bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
        
        <div className="mb-8">
          <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-black">
            ROOM <span className="text-red-600">EXPIRED</span>
          </h2>
        </div>

        <div className="mb-10 space-y-6">
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
            Inactivity timeout, invalid session ID, or the duel has been decommissioned.
          </p>
          
          <div className="bg-[#F2F2F2] p-6 border-2 border-black relative group">
            <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter">
              Room ID
            </div>
            <p className="text-sm md:text-base font-mono font-black break-all uppercase text-black">
              {roomId}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/")}
            className="!bg-black !text-white border-2 !border-black hover:!bg-white hover:!text-black transition-all font-black uppercase tracking-tighter px-8 py-4 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]"
          >
            Back to Lobby
          </Button>

          <Button
            onClick={handleReload}
            className="!bg-white !text-black border-2 !border-black hover:!bg-neutral-100 transition-all font-black uppercase tracking-tighter px-8 py-4"
          >
            Reload Room
          </Button>
        </div>

        <div className="absolute bottom-4 right-4 opacity-10">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H40V40H0V0ZM2 2V38H38V2H2Z" fill="black"/>
            <rect x="18" y="10" width="4" height="12" fill="black"/>
            <rect x="18" y="26" width="4" height="4" fill="black"/>
          </svg>
        </div>
      </div>
    </div>
  );
}