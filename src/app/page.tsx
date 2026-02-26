"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [myId, setMyId] = useState<string | null>(null);
  const [isQueuing, setIsQueuing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let storedId = localStorage.getItem("vlr_user_id");
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem("vlr_user_id", storedId);
    }
    setMyId(storedId);
  }, []);

  const handleQueueAction = async () => {
    if (!myId) return;

    if (isQueuing) {
      await supabase.from("queue").delete().eq("user_id", myId);
      setIsQueuing(false);
    } else {
      setIsQueuing(true);
      try {
        const { data: queue } = await supabase
          .from("queue")
          .select("user_id")
          .order("created_at", { ascending: true })
          .limit(1);

        if (queue && queue.length > 0 && queue[0].user_id !== myId) {
          const oppId = queue[0].user_id;
          const roomId = [myId, oppId].sort().join("_");
          await supabase.from("room").insert([{ id: roomId, p1_id: myId, p2_id: oppId }]);
          await supabase.from("queue").delete().in("user_id", [myId, oppId]);
        } else {
          await supabase.from("queue").upsert([{ user_id: myId }]);
        }
      } catch (error) {
        console.error(error);
        setIsQueuing(false);
      }
    }
  };

  useEffect(() => {
    if (!myId) return;
    const channel = supabase.channel("queue_listener")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "room" }, 
      (payload) => {
        const room = payload.new;
        if (room.p1_id === myId || room.p2_id === myId) {
          router.push(`/room/${room.id}`);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [myId, router]);

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen bg-white text-black font-mono">
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <h1 className="text-8xl font-black uppercase tracking-tighter mb-2 italic">VLR DUEL</h1>
        <p className="mb-12 text-gray-500 font-bold tracking-widest uppercase">The Ultimate Pro-Draft Experience</p>
        
        <button
          onClick={handleQueueAction}
          className={`
            w-64 py-6 text-2xl font-black uppercase transition-all border-4 border-black
            ${isQueuing 
              ? "bg-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none" 
              : "bg-white text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-4px] translate-y-[-4px] hover:translate-x-0 hover:translate-y-0"
            }
          `}
        >
          {isQueuing ? "CANCEL QUEUE" : "FIND MATCH"}
        </button>

        {isQueuing && (
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="ml-2 font-bold uppercase text-xs">Searching for opponent...</span>
          </div>
        )}
      </div>

      <div className="w-80 border-l-4 border-black p-8 flex flex-col bg-gray-50">
        <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">RULES</h2>
        <ul className="space-y-6">
          <li className="flex gap-4">
            <span className="font-black text-xl">01</span>
            <p className="text-sm font-bold uppercase leading-tight">Start with a $100 budget to build your pro team.</p>
          </li>
          <li className="flex gap-4">
            <span className="font-black text-xl">02</span>
            <p className="text-sm font-bold uppercase leading-tight">You must select exactly 5 players before time runs out.</p>
          </li>
          <li className="flex gap-4">
            <span className="font-black text-xl">03</span>
            <p className="text-sm font-bold uppercase leading-tight">Players are unique. If your opponent picks them first, they are gone.</p>
          </li>
          <li className="flex gap-4">
            <span className="font-black text-xl">04</span>
            <p className="text-sm font-bold uppercase leading-tight">You have 30 seconds to complete your roster.</p>
          </li>
          <li className="flex gap-4">
            <span className="font-black text-xl">05</span>
            <p className="text-sm font-bold uppercase leading-tight">Disconnecting results in an automatic forfeit.</p>
          </li>
        </ul>

        <div className="mt-auto pt-8 border-t-2 border-dashed border-black">
          <p className="text-[10px] font-bold text-gray-400 uppercase italic">Version 1.0.4-beta</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase italic">Powered by VLR API & Supabase</p>
        </div>
      </div>
    </div>
  );
}