"use client";

import { useState, memo, useRef } from "react";

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

  return (
    <div 
      ref={containerRef}
      className="mb-12 border-4 border-black bg-white p-6 flex flex-col items-center gap-4 w-full max-w-sm"
    >
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
        User Profile
      </p>
      
      <div className="flex items-center gap-3 w-full border-b-4 border-black pb-2">
        {isEditingName ? (
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            onKeyDown={handleKeyDown} 
            onBlur={handleBlur}
            autoFocus 
            maxLength={12} 
            className="text-2xl font-black uppercase outline-none w-full bg-yellow-100 px-1" 
          />
        ) : (
          <span className="text-2xl font-black uppercase truncate flex-1">
            {username}
          </span>
        )}
        
        <button 
          onClick={() => isEditingName ? triggerSave() : setIsEditingName(true)} 
          className="text-xs bg-black text-white px-4 py-2 font-black uppercase border-2 border-black transition-none hover:bg-indigo-600 active:bg-emerald-500"
        >
          {isEditingName ? "CONFIRM" : "RENAME"}
        </button>
      </div>
      
      <p className="text-[10px] font-black uppercase text-black self-start">
        {`ID: ${myId.slice(0, 8)}`}
      </p>
    </div>
  );
});

export default UserProfile;