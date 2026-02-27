"use client";

import { useMemo } from "react";
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
  const queueMembers = useMemo(() => onlineUsers.filter((u) => u.isQueuing), [onlineUsers]);

  const UserCard = ({ user, showDuelBtn = false, isQueuing = false }: { user: PresenceUser; showDuelBtn?: boolean; isQueuing?: boolean }) => {
    const isMe = user.id === myId;
    
    return (
      <div className={`relative p-4 border-2 border-black transition-all duration-75 ${
        isMe ? "bg-emerald-100" : "bg-white"
      }`}>
        <div className="flex justify-between items-start mb-1">
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase italic truncate max-w-[120px]">
              {user.name}
            </span>
            <div className="flex items-center gap-1">
               <div className={`w-1.5 h-1.5 rounded-full ${isQueuing ? "bg-yellow-500 animate-pulse" : "bg-emerald-500"}`} />
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                 {isQueuing ? "In Queue" : "Available"}
               </p>
            </div>
          </div>

          {isMe ? (
            <span className="text-[9px] bg-black text-white px-1.5 py-0.5 font-black italic tracking-tighter">YOU</span>
          ) : (
            showDuelBtn && (
              <button 
                onClick={() => isWaitingForResponse === user.id ? onCancelDuel() : onSendDuel(user.id)} 
                className={`text-[10px] px-3 py-1 font-black uppercase border-2 border-black transition-all ${
                  isWaitingForResponse === user.id 
                  ? "bg-red-600 text-white animate-pulse" 
                  : "bg-white text-black hover:bg-black hover:text-white"
                }`}
              >
                {isWaitingForResponse === user.id ? "CANCEL" : "DUEL"}
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col h-full bg-gray-50">
      <div className="flex-1 flex flex-col min-h-[300px] border-b-4 border-black">
        <div className="p-6 pb-4 bg-white">
          <div className="flex justify-between items-center border-b-4 border-emerald-500 pb-1">
            <h2 className="text-xl font-black uppercase italic flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 inline-block" />
              Online Players
            </h2>
            <div className="font-black text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              {onlineUsers.length}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {onlineUsers.map((user) => (
            <UserCard 
              key={`${user.id}-${user.name}`}
              user={user} 
              showDuelBtn={true} 
              isQueuing={user.isQueuing}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[300px] bg-white relative">
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center border-b-4 border-yellow-400 pb-1">
            <h2 className="text-xl font-black uppercase italic flex items-center gap-2">
              <span className="w-2 h-6 bg-yellow-400 inline-block animate-pulse" />
              Live Queue
            </h2>
            <div className="font-black text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full">
              {queueMembers.length}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar bg-yellow-50/30">
          {queueMembers.length === 0 ? (
            <div className="border-4 border-dashed border-gray-200 p-8 text-center flex flex-col items-center justify-center h-32">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Scanning for Live Queues...
              </p>
            </div>
          ) : (
            queueMembers.map((player) => (
              <UserCard key={player.id} user={player} isQueuing={true} />
            ))
          )}
        </div>

        {queueMembers.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400/20 animate-pulse" />
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-left: 2px solid black; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}