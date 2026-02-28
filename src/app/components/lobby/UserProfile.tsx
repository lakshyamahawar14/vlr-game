"use client";

import { useState, memo } from "react";

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

  const handleConfirm = () => {
    onSaveName(username);
    setIsEditingName(false);
  };

  return (
    <div className="mb-12 border-4 border-black bg-white p-6 flex flex-col items-center gap-4 w-full max-w-sm">
      <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
        User Profile
      </p>
      
      <div className="flex items-center gap-3 w-full border-b-4 border-black pb-2">
        {isEditingName ? (
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            onBlur={handleConfirm} 
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()} 
            autoFocus 
            maxLength={12} 
            className="text-2xl font-black uppercase outline-none w-full bg-yellow-100" 
          />
        ) : (
          <span className="text-2xl font-black uppercase truncate flex-1">
            {username}
          </span>
        )}
        <button 
          onClick={() => isEditingName ? handleConfirm() : setIsEditingName(true)} 
          className="text-xs bg-black text-white px-4 py-2 font-black uppercase border-2 border-black transition-none hover:bg-indigo-600"
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