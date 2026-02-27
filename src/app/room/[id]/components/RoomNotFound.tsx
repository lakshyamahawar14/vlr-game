import { useRouter } from "next/navigation";

interface Props {
  roomId: string;
}

export default function RoomNotFound({ roomId }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-mono">
      <div className="bg-black text-white p-6 md:p-12 text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-3xl font-black italic mb-2 uppercase tracking-tighter">
          Room Not Found
        </h2>
        <p className="text-[10px] text-gray-400 mb-6 break-all uppercase font-bold tracking-widest">
          ID: {roomId}
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-white text-black px-8 py-3 font-black uppercase border-2 border-white hover:bg-yellow-400 transition-colors"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
}