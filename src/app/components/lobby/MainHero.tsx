"use client";

import { memo } from "react";
import UserProfile from "./UserProfile";
import Link from "next/link";

interface MainHeroProps {
  myId: string;
  username: string;
  setUsername: (name: string) => void;
  isQueuing: boolean;
  onQueueAction: () => void;
  onSaveName: (newName: string) => void;
}

const MainHero = memo(function MainHero({
  myId,
  username,
  setUsername,
  isQueuing,
  onQueueAction,
  onSaveName
}: MainHeroProps) {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-white min-h-screen w-full overflow-hidden">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <Link
          href="/leaderboard"
          className="block px-4 py-2 bg-violet-600 text-white font-black uppercase text-[10px] md:text-xs border-2 border-black hover:bg-violet-700 transition-colors"
        >
          Leaderboard
        </Link>
      </div>

      <UserProfile
        myId={myId}
        username={username}
        setUsername={setUsername}
        onSaveName={onSaveName}
      />

      <div className="flex flex-col items-center">
        <div className="relative mb-6 px-6 py-2">
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-8 border-l-8 border-black" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-8 border-r-8 border-black" />

          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-center leading-none">
            NOT <span className="text-indigo-600">WORKING</span>
          </h1>
          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-center leading-none">
            IN <span className="text-indigo-600">MAINTENANCE</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 mb-16">
          <div className="h-1 w-8 bg-black" />
          <p className="text-black font-black tracking-widest uppercase text-center text-[10px] md:text-xs">
            Realtime Roster Drafting 1v1 Duel Game
          </p>
          <div className="h-1 w-8 bg-black" />
        </div>

        <div className="w-full max-w-xs flex flex-col items-center">
          <button
            onClick={onQueueAction}
            className={`w-full py-8 text-4xl font-black uppercase border-4 border-black outline-none select-none transition-colors ${
              isQueuing
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-emerald-400 text-black hover:bg-emerald-500"
            }`}
          >
            {isQueuing ? "ABORT" : "FIND MATCH"}
          </button>

          <div className="h-8 mt-6">
            {isQueuing && (
              <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-red-600">
                Searching for queue...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default MainHero;