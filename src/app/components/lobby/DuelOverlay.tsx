"use client";

import { useState, memo, useEffect } from "react";
import { Button } from "src/components/ui/Button";

interface Props {
  challengeStack: { id: string; name: string }[];
  onAccept: (challenger: { id: string; name: string }) => void;
  onDecline: (challengerId: string) => void;
}

const DuelOverlay = memo(function DuelOverlay({ challengeStack, onAccept, onDecline }: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const currentChallenge = challengeStack[0];

  useEffect(() => {
    if (currentChallenge && processingId !== currentChallenge.id) {
      setProcessingId(null);
    }
  }, [currentChallenge?.id, processingId]);

  if (!currentChallenge || processingId === currentChallenge.id) return null;

  const handleAction = (action: "accept" | "decline") => {
    setProcessingId(currentChallenge.id);
    if (action === "accept") {
      onAccept(currentChallenge);
    } else {
      onDecline(currentChallenge.id);
    }
  };

  return (
    <div className="fixed z-[999] top-0 left-0 w-full lg:left-auto lg:right-6 lg:top-6 lg:w-96 bg-white border-b-4 lg:border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col items-start gap-1">
          <div className="inline-block px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest mb-1">
            Incoming Duel
          </div>
          
          <h3 className="text-2xl lg:text-3xl font-black uppercase italic text-black leading-tight truncate w-full">
            {currentChallenge.name}
          </h3>
          
          <p className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">
            User ID: {currentChallenge.id.slice(0, 8)}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <Button 
            onClick={() => handleAction("accept")} 
            className="flex-1 !bg-[#A3E635] !text-black h-14 text-sm font-black uppercase !border-2 !border-black hover:!bg-[#82b92a] transition-all"
          >
            Accept
          </Button>
          
          <Button 
            onClick={() => handleAction("decline")} 
            className="flex-1 !bg-red-600 !text-white border-2 !border-black h-14 text-sm font-black uppercase hover:!bg-red-700 transition-all"
          >
            Decline
          </Button>
        </div>

        {challengeStack.length > 1 && (
          <div className="pt-2 border-t-2 border-black/5 flex items-center justify-between">
            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">
              Queue: {challengeStack.length - 1} Pending
            </p>
            <div className="flex gap-1">
               <div className="w-1 h-1 bg-red-600 animate-pulse" />
               <div className="w-1 h-1 bg-red-600 animate-pulse delay-75" />
               <div className="w-1 h-1 bg-red-600 animate-pulse delay-150" />
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute top-2 right-2 flex gap-1">
        <div className="w-1 h-4 bg-black/10" />
        <div className="w-1 h-4 bg-black/10" />
      </div>
    </div>
  );
});

export default DuelOverlay;