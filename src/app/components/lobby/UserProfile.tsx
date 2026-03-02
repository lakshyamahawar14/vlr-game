"use client";

import { useState, memo, useRef } from "react";
import { Button } from "../../../components/ui/Button";

interface UserProfileProps {
  myId: string;
  username: string;
  setUsername: (name: string) => void;
  onSaveName: (newName: string) => void;
}

const UserProfile = memo(function UserProfile({ 
  myId, 
  username, 
  setUsername, 
  onSaveName 
}: UserProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerSave = (finalValue?: string) => {
    const valueToSave = (finalValue !== undefined ? finalValue : username).trim() || "Unknown";
    onSaveName(valueToSave);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const targetValue = e.currentTarget.value;
      setUsername(targetValue);
      triggerSave(targetValue);
    } else if (e.key === "Escape") {
      setIsEditingName(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      triggerSave();
    }
  };

  const handleButtonClick = () => {
    if (isEditingName) {
      triggerSave();
    } else {
      setIsEditingName(true);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="mb-12 border-4 border-black bg-white p-6 flex flex-col items-center gap-4 w-full max-w-sm relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="absolute top-0 left-0 w-2 h-2 bg-indigo-600" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-black" />

      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.25em] self-start mb-1">
        User Profile
      </p>
      
      <div className="flex items-center gap-3 w-full border-b-4 border-black pb-3">
        {isEditingName ? (
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            onKeyDown={handleKeyDown} 
            onBlur={handleBlur}
            autoFocus 
            maxLength={12} 
            className="text-2xl font-black uppercase outline-none w-full bg-neutral-100 px-2 tracking-tighter" 
          />
        ) : (
          <span className="text-2xl font-black uppercase truncate flex-1 italic tracking-tighter">
            {username}
          </span>
        )}
        
        <Button 
          onClick={handleButtonClick} 
          size="md"
          className={`italic font-black border-2 !border-black transition-none ${
            isEditingName 
              ? "!bg-[#0DA643] !text-white hover:!bg-[#0D8A3A]" 
              : "!bg-black !text-white hover:!bg-white hover:!text-black"
          }`}
        >
          {isEditingName ? "SAVE" : "RENAME"}
        </Button>
      </div>
      
      <div className="w-full flex justify-between items-center mt-1">
        <p className="text-[9px] font-black uppercase text-black tracking-widest">
          {`UID: ${myId.slice(0, 8)}`}
        </p>
        <div className="flex gap-1">
          <div className="w-3 h-1 bg-black" />
          <div className="w-1 h-1 bg-black" />
        </div>
      </div>
    </div>
  );
});

export default UserProfile;