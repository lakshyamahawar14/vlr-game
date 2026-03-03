"use client";

import { memo } from "react";
import { PresenceUser } from "@/app/hooks/useLobby";
import { Button } from "src/components/ui/Button";
import { getStoredUser } from "@/lib/auth";

interface Props {
  onlineUsers: PresenceUser[];
  isWaitingForResponse: string | null;
  onSendDuel: (id: string) => void;
  onCancelDuel: () => void;
}

const UserCard = memo(({ 
  user, 
  isMe, 
  isWaiting, 
  onSendDuel, 
  onCancelDuel 
}: { 
  user: PresenceUser; 
  isMe: boolean; 
  isWaiting: boolean; 
  onSendDuel: (id: string) => void; 
  onCancelDuel: () => void;
}) => {
  return (
    <div className={`group p-4 border-2 border-black transition-all ${isMe ? "bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}`}>
      <div className="flex justify-between items-center">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-3 shrink-0 ${user.isQueuing ? "bg-neutral-400" : "bg-[#0DA643]"}`} />
            <span className="text-sm font-black uppercase tracking-tighter truncate pr-2 text-black">
              {user.name}
            </span>
          </div>
          <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${user.isQueuing ? "text-neutral-500" : "text-[#0DA643]"}`}>
            {user.isQueuing ? "In Queue" : "Available"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isMe ? (
            <span className="text-[10px] bg-black text-white px-2 py-1 font-black italic">YOU</span>
          ) : (
            <Button 
              onClick={() => isWaiting ? onCancelDuel() : onSendDuel(user.id)} 
              className={`!h-8 !px-3 !text-[10px] !font-black !border-2 !border-black transition-none ${
                isWaiting 
                ? "!bg-red-600 !text-white" 
                : "!bg-black !text-white hover:!bg-white hover:!text-black" 
              }`}
            >
              {isWaiting ? "CANCEL" : "INVITE"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

UserCard.displayName = "UserCard";

export default function PlayerLists({ 
  onlineUsers, isWaitingForResponse, onSendDuel, onCancelDuel 
}: Props) {
  const { id: myId } = getStoredUser();
  const queueCount = onlineUsers.filter(u => u.isQueuing).length;

  return (
    <aside className="w-full lg:w-80 h-full lg:h-screen flex flex-col bg-white border-t-4 lg:border-t-0 lg:border-l-4 border-black font-sans overflow-x-hidden">
      <div className="p-4 border-b-4 border-black bg-[#0DA643] shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black uppercase text-white italic tracking-tighter">
            Online Players
          </h2>
          <div className="font-black text-xs border-2 border-black bg-white text-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000]">
            {onlineUsers.length}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-neutral-50 scrollbar-hide">
        {onlineUsers.length === 0 ? (
          <div className="p-4 border-2 border-dashed border-black bg-white h-[72px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest animate-pulse">
              Finding Players...
            </p>
          </div>
        ) : (
          onlineUsers.map((user) => (
            <UserCard 
              key={user.id}
              user={user}
              isMe={user.id === myId}
              isWaiting={isWaitingForResponse === user.id}
              onSendDuel={onSendDuel}
              onCancelDuel={onCancelDuel}
            />
          ))
        )}
      </div>

      <div className="p-4 border-t-4 border-black bg-black shrink-0">
        <div className="flex items-center gap-3 text-[#0DA643]">
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <p className="text-[9px] font-black uppercase tracking-widest">
            Live Queue: {queueCount}
          </p>
        </div>
      </div>
    </aside>
  );
}