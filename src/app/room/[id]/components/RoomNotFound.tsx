"use client";

import { useRouter } from "next/navigation";

interface Props {
  roomId: string;
}

export default function RoomNotFound({ roomId }: Props) {
  const router = useRouter();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-xl border-4 border-black p-8 md:p-12 text-center bg-white">
        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
            ROOM <span className="text-red-600">NOT FOUND</span>
          </h2>
        </div>

        <div className="mb-8 space-y-4">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            ROOM DELETED DUE TO INACTIVITY OR INVALID ROOM ID
          </p>
          
          <div className="bg-gray-100 p-4 border-2 border-black text-left">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Room ID</p>
            <p className="text-xs md:text-sm font-black break-all uppercase">
              {roomId}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleReload}
            className="px-6 py-3 bg-[#A3E635] text-black font-black uppercase text-xs border-2 border-black hover:bg-[#82b92a] transition-colors"
          >
            Reload Room
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#FDE047] text-black font-black uppercase text-xs border-2 border-black hover:bg-[#e6cc40] transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}