"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, AlertCircle } from "lucide-react";
import { useChat } from "@/app/hooks/useChat";
import { getStoredUser } from "@/lib/auth";

export default function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { name: username } = getStoredUser();
  const { messages, sendMessage, myId, unreadCount } = useChat(username, isOpen);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      document.body.style.overflow = isOpen ? "hidden" : "unset";
    }
  }, [messages, isOpen]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const text = newMessage;
    setNewMessage("");
    await sendMessage(text);
  };

  return (
    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-[1000] font-sans text-black">
      {isOpen && (
        <div className="fixed inset-0 bg-white z-[2000] flex flex-col sm:absolute sm:inset-auto sm:bottom-20 sm:right-0 sm:w-[380px] sm:h-[500px] sm:border-4 sm:border-black sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-black text-white p-5 sm:p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0DA643] rounded-full animate-pulse" />
              <span className="font-black uppercase tracking-tighter italic text-lg sm:text-sm">Lobby Chat</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="cursor-pointer outline-none border-none bg-transparent p-1 flex items-center justify-center">
              <X size={28} strokeWidth={3} className="sm:w-6 sm:h-6 text-white" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F2F2F2]">
            {messages.map((msg) => {
              const isMe = msg.sender_id === myId;
              const isError = msg.status === "error";
              const isSending = msg.status === "sending";

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] sm:text-[9px] font-black uppercase text-neutral-500 mb-1 px-1 tracking-widest">
                    {msg.sender_name}
                  </span>
                  <div className={`
                    relative max-w-[85%] px-4 py-2 sm:px-3 sm:py-2 border-2 border-black font-bold text-base sm:text-sm transition-opacity flex flex-col
                    ${isMe ? "bg-indigo-600 text-white shadow-[-3px_3px_0px_0px_rgba(0,0,0,1)]" : "bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"}
                    ${isSending ? "opacity-70 italic" : "opacity-100"}
                    ${isError ? "!border-red-500 !shadow-none opacity-100 text-red-600" : ""}
                  `}>
                    {msg.message}
                    <span className={`text-[9px] mt-1 self-end font-black opacity-60`}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  {isError && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 font-black uppercase text-[10px] italic">
                      <AlertCircle size={10} strokeWidth={4} />
                      Message not sent
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-3 border-t-4 border-black bg-white flex gap-2 pb-10 sm:pb-3 shrink-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 border-2 border-black p-3 sm:p-2 font-bold focus:outline-none focus:bg-neutral-50 text-black placeholder:text-neutral-400 text-base sm:text-sm min-w-0"
            />
            <button type="submit" className="bg-[#A3E635] border-2 border-black px-4 sm:p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer outline-none flex items-center justify-center">
              <Send size={22} strokeWidth={3} className="text-black sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-4 rounded-full border-4 border-black transition-all outline-none cursor-pointer flex items-center justify-center
          ${isOpen ? "hidden sm:flex bg-[#FF4655] text-white" : "bg-[#FACC15] text-black shadow-[0_0_20px_rgba(0,0,0,0.3)]"}
          hover:-translate-y-1 active:translate-y-0.5
        `}
      >
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-[#FF4655] text-white text-[10px] font-black w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce z-10">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
        < MessageSquare size={28} strokeWidth={3} />
      </button>
    </div>
  );
}