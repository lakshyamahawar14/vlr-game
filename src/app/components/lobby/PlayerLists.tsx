"use client";

import { PresenceUser } from "@/app/hooks/useLobby";

interface Props {
  onlineUsers: PresenceUser[];
  myId: string;
  isWaitingForResponse: string | null;
  onSendDuel: (id: string) => void;
  onCancelDuel: () => void;
}

export default function PlayerLists({ 
  onlineUsers, myId, isWaitingForResponse, onSendDuel, onCancelDuel 
}: Props) {
  
  const UserCard = ({ user }: { user: PresenceUser }) => {
    const isMe = user.id === myId;
    const isQueuing = user.isQueuing;
    const isWaiting = isWaitingForResponse === user.id;
    
    return (
      <div className="p-4 border-2 border-black bg-white">
        <div className="flex justify-between items-center">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black uppercase tracking-tight truncate pr-2 text-black">
              {user.name}
            </span>
            <div className="flex items-center gap-1.5">
               <div className={`w-2 h-2 border border-black ${isQueuing ? "bg-yellow-400" : "bg-emerald-500"}`} />
               <p className="text-[10px] font-bold text-black uppercase">
                 {isQueuing ? "In Queue" : "Available"}
               </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMe ? (
              <span className="text-[10px] bg-black text-white px-2 py-1 font-black">YOU</span>
            ) : (
              <button 
                onClick={() => isWaiting ? onCancelDuel() : onSendDuel(user.id)} 
                className={`text-[10px] px-4 py-1.5 font-black uppercase border-2 border-black transition-colors ${
                  isWaiting 
                  ? "bg-red-500 text-white" 
                  : "bg-white text-black hover:bg-black hover:text-white"
                }`}
              >
                {isWaiting ? "CANCEL" : "INVITE"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-80 h-full lg:h-screen flex flex-col bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-4 border-b-4 border-black bg-emerald-400">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black uppercase italic text-black leading-none">
            Online Players
          </h2>
          <div className="font-black text-xs border-2 border-black bg-white text-black px-2 py-0.5">
            {onlineUsers.length}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {onlineUsers.length === 0 ? (
          <div className="border-2 border-dashed border-black p-8 text-center">
            <p className="text-[10px] font-black text-black uppercase">
              No players online
            </p>
          </div>
        ) : (
          onlineUsers.map((user) => (
            <UserCard 
              key={user.id}
              user={user} 
            />
          ))
        )}
      </div>
    </aside>
  );
}