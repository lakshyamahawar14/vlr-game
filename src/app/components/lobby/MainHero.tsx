"use client";

import { memo } from "react";
import UserProfile from "./UserProfile";
import Link from "next/link";
import { Button } from "src/components/ui/Button";

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
    <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-[#F2F2F2] min-h-screen w-full overflow-hidden font-sans">
      
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" 
           style={{ 
             backgroundImage: `
               linear-gradient(to right, #4f46e5 1px, transparent 1px),
               linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
             `, 
             backgroundSize: '32px 32px' 
           }} 
      />

      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <Link href="/leaderboard">
          <Button 
            className="!bg-black !text-white border-2 !border-black hover:!bg-white hover:!text-black transition-all font-black uppercase tracking-tighter"
            size="md"
          >
            Leaderboard
          </Button>
        </Link>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mt-16 md:mt-0 w-full flex justify-center">
          <UserProfile
            myId={myId}
            username={username}
            setUsername={setUsername}
            onSaveName={onSaveName}
          />
        </div>

        <div className="flex flex-col items-center w-full">
          <div className="relative mb-6 px-6 py-3 md:px-10 md:py-4">
            <div className="absolute top-0 left-0 w-4 h-4 md:w-6 md:h-6 border-t-4 border-l-4 border-black" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FF4655]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 md:w-6 md:h-6 border-b-4 border-r-4 border-black" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-black" />

            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter text-center leading-none italic select-none">
              VLR<span className="text-indigo-600">DUEL</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-16 px-4">
            <div className="h-[2px] w-6 md:w-12 bg-black/20" />
            <p className="text-black font-black tracking-[0.2em] md:tracking-[0.25em] uppercase text-center text-[8px] md:text-xs">
              Realtime Roster Drafting 1v1 Duel Game
            </p>
            <div className="h-[2px] w-6 md:w-12 bg-black/20" />
          </div>

          <div className="w-[90%] sm:w-full sm:max-w-xs flex flex-col items-center">
            <Button
              onClick={onQueueAction}
              fullWidth
              size="xl"
              className={`h-16 md:h-20 text-xl md:text-2xl border-4 !border-black italic tracking-tighter transition-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
                isQueuing
                  ? "!bg-[#FF4655] !text-white hover:!bg-[#E03E4A] active:!bg-[#FF4655]"
                  : "!bg-[#0DA643] !text-white hover:!bg-[#0D8A3A] active:!bg-[#0DA643]"
              }`}
            >
              {isQueuing ? "ABORT" : "FIND MATCH"}
            </Button>

            <div className="h-12 mt-10 flex flex-col items-center">
              {isQueuing && (
                <>
                  <p className="text-center text-[11px] font-black uppercase tracking-[0.3em] text-[#FF4655] animate-pulse italic">
                    Searching for Opponent...
                  </p>
                  <div className="mt-3 flex gap-1.5">
                     <div className="w-2 h-0.5 bg-[#FF4655] animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-2 h-0.5 bg-[#FF4655] animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-2 h-0.5 bg-[#FF4655] animate-bounce" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MainHero;