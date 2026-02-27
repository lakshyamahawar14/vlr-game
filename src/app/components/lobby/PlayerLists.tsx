import { PresenceUser } from "@/app/hooks/useLobby";

interface Props {
  onlineUsers: PresenceUser[];
  myId: string;
  isWaitingForResponse: string | null;
  onSendDuel: (id: string) => void;
  onCancelDuel: () => void;
}

export default function PlayerLists({ 
  onlineUsers, 
  myId, 
  isWaitingForResponse, 
  onSendDuel, 
  onCancelDuel 
}: Props) {
  const queueMembers = onlineUsers.filter((u) => u.isQueuing);

  const UserCard = ({ user, showDuelBtn = false }: { user: PresenceUser; showDuelBtn?: boolean }) => (
    <div className={`p-4 border-2 border-black transition-colors ${user.id === myId ? "bg-yellow-300" : "bg-white hover:bg-gray-100"}`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-black uppercase italic truncate max-w-[120px]">{user.name}</span>
        {user.id === myId ? (
          <span className="text-[9px] bg-black text-white px-1 font-black tracking-tighter">YOU</span>
        ) : (
          showDuelBtn && (
            <button 
              onClick={() => isWaitingForResponse === user.id ? onCancelDuel() : onSendDuel(user.id)} 
              className={`text-[10px] px-2 py-0.5 font-black uppercase border-2 border-black transition-all ${isWaitingForResponse === user.id ? "bg-black text-white animate-pulse" : "bg-white text-black hover:bg-black hover:text-white"}`}
            >
              {isWaitingForResponse === user.id ? "WAITING" : "DUEL"}
            </button>
          )
        )}
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {user.id.slice(0, 8)}</p>
    </div>
  );

  return (
    <div className="w-full lg:w-80 border-t-4 lg:border-t-0 lg:border-l-4 border-black bg-gray-50 flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0 border-b-4 border-black">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-1">
            <h2 className="text-xl font-black uppercase italic">ONLINE PLAYERS</h2>
            <div className="font-black text-sm text-green-600">{onlineUsers.length}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
          {onlineUsers.map((user) => (
            <UserCard key={user.id} user={user} showDuelBtn={true} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-white">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-1">
            <h2 className="text-xl font-black uppercase italic">LIVE QUEUE</h2>
            <div className="font-black text-sm text-green-600">{queueMembers.length}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
          {queueMembers.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">Awaiting Players...</p>
            </div>
          ) : (
            queueMembers.map((player) => (
              <UserCard key={player.id} user={player} />
            ))
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
        }
      `}</style>
    </div>
  );
}