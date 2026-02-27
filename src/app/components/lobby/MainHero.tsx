"use client";

import { useState } from "react";

interface Props {
  myId: string;
  username: string;
  setUsername: (name: string) => void;
  isQueuing: boolean;
  onQueueAction: () => void;
  onSaveName: (newName: string) => void;
}

export default function MainHero({ 
  myId, 
  username, 
  setUsername, 
  isQueuing, 
  onQueueAction,
  onSaveName 
}: Props) {
  const [isEditingName, setIsEditingName] = useState(false);

  const handleConfirm = () => {
    onSaveName(username);
    setIsEditingName(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative overflow-hidden min-h-full w-full">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none flex flex-col items-center justify-center">
        <span className="text-[30vw] font-black uppercase whitespace-nowrap leading-[0.7]">
          VLR
        </span>
        <span className="text-[30vw] font-black uppercase whitespace-nowrap leading-[0.7]">
          VLR
        </span>
      </div>

      <div className="relative z-20 mb-12 flex flex-col items-center gap-2">
        <p className="text-xs font-black uppercase text-gray-400 tracking-widest">User Profile</p>
        <div className="flex items-center gap-3 border-b-2 border-black pb-2">
          {isEditingName ? (
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              onBlur={handleConfirm} 
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()} 
              autoFocus 
              maxLength={12} 
              className="text-2xl font-black uppercase outline-none w-48 bg-yellow-50" 
            />
          ) : (
            <span className="text-2xl font-black uppercase italic">{username}</span>
          )}
          <button 
            onClick={() => isEditingName ? handleConfirm() : setIsEditingName(true)} 
            className="text-xs bg-black text-white px-3 py-1 font-bold uppercase hover:bg-red-600 transition-colors"
          >
            {isEditingName ? "CONFIRM" : "RENAME"}
          </button>
        </div>
        <p className="text-[10px] font-black uppercase text-gray-300">{`User ID: ${myId.slice(0, 8)}`}</p>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-2">
          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter italic text-center leading-none">
            VLR <span className="text-red-600">DUEL</span>
          </h1>
          <div className="absolute -right-4 -top-2 w-12 h-12 border-t-8 border-r-8 border-black hidden md:block" />
          <div className="absolute -left-4 -bottom-2 w-12 h-12 border-b-8 border-l-8 border-black hidden md:block" />
        </div>

        <div className="flex items-center gap-4 mb-12">
          <div className="h-[2px] w-8 bg-black" />
          <p className="text-gray-500 font-black tracking-[0.3em] uppercase text-center text-[10px] md:text-[12px]">
            Realtime Roster Drafting 1v1 Duel Game
          </p>
          <div className="h-[2px] w-8 bg-black" />
        </div>

        <div className="relative w-full max-w-xs group">
          {isQueuing && (
            <div className="absolute inset-0 bg-red-600 animate-ping opacity-20 blur-xl" />
          )}
          
          <button
            onClick={onQueueAction}
            className={`relative w-full py-6 text-3xl font-black uppercase transition-all border-4 border-black group-active:translate-x-0 group-active:translate-y-0 ${
              isQueuing
                ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                : "bg-yellow-300 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            }`}
          >
            {isQueuing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                ABORT
              </span>
            ) : (
              "FIND MATCH"
            )}
          </button>

          <p className={`text-center mt-4 text-[10px] font-black uppercase tracking-widest transition-opacity duration-300 ${isQueuing ? "opacity-100 animate-pulse text-red-600" : "opacity-0"}`}>
            Searching for opponent...
          </p>
        </div>
      </div>
    </div>
  );
}