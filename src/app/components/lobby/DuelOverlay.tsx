"use client";

import { useState, memo } from "react";

interface Props {
  challengeStack: { id: string; name: string }[];
  onAccept: (challenger: { id: string; name: string }) => void;
  onDecline: (challengerId: string) => void;
}

const DuelOverlay = memo(function DuelOverlay({ challengeStack, onAccept, onDecline }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const currentChallenge = challengeStack[0];

  if (!currentChallenge || isProcessing) return null;

  const handleAction = (action: "accept" | "decline") => {
    setIsProcessing(true);
    if (action === "accept") {
      onAccept(currentChallenge);
    } else {
      onDecline(currentChallenge.id);
    }
  };

  return (
    <div className="fixed z-[999] top-0 left-0 w-full lg:left-auto lg:right-6 lg:top-6 lg:w-96 bg-black border-b-4 lg:border-4 border-red-600 shadow-2xl">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col items-start gap-1">
          <div className="inline-block px-2 py-1 bg-red-600 text-black text-[10px] font-black uppercase tracking-widest mb-1">
            Incoming Duel
          </div>
          
          <h3 className="text-2xl lg:text-3xl font-black uppercase italic text-white leading-tight truncate w-full">
            {currentChallenge.name}
          </h3>
          
          <p className="text-[10px] font-mono text-white uppercase font-bold">
            USER ID: {currentChallenge.id.slice(0, 8)}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button 
            onClick={() => handleAction("accept")} 
            className="flex-1 bg-emerald-400 text-black h-14 text-sm font-black uppercase hover:bg-emerald-500 active:scale-95 transition-all"
          >
            Accept
          </button>
          
          <button 
            onClick={() => handleAction("decline")} 
            className="flex-1 bg-transparent text-white border-2 border-white/20 h-14 text-sm font-black uppercase hover:border-red-600 hover:text-red-600 transition-all active:scale-95"
          >
            Decline
          </button>
        </div>

        {challengeStack.length > 1 && (
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest pt-1 border-t border-white/10">
            + {challengeStack.length - 1} Other Pending Invites
          </p>
        )}
      </div>
    </div>
  );
});

export default DuelOverlay;