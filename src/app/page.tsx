"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [myId, setMyId] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    let userId = localStorage.getItem("vlr_duel_id");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("vlr_duel_id", userId);
    }
    setMyId(userId);
  }, []);

  const handleQueueAction = async () => {
    if (isQueuing) {
      setIsQueuing(false);
      await supabase.from("queue").delete().eq("user_id", myId);
      return;
    }

    setIsQueuing(true);

    const { data: activeRoom } = await supabase
      .from("room")
      .select("id")
      .or(`p1_id.eq.${myId},p2_id.eq.${myId}`)
      .eq("status", "DRAFTING")
      .maybeSingle();

    if (activeRoom) {
      router.push(`/room/${activeRoom.id}`);
      return;
    }

    const { data: queue } = await supabase
      .from("queue")
      .select("user_id")
      .order("created_at", { ascending: true })
      .limit(1);

    if (queue && queue.length > 0 && queue[0].user_id !== myId) {
      const oppId = queue[0].user_id;
      const roomId = [myId, oppId].sort().join("_");
      
      const { error: roomError } = await supabase
        .from("room")
        .upsert([{ id: roomId, p1_id: myId, p2_id: oppId, status: "DRAFTING" }], { onConflict: 'id' });
      
      if (!roomError) {
        await supabase.from("queue").delete().in("user_id", [myId, oppId]);
        router.push(`/room/${roomId}`);
      }
    } else {
      await supabase.from("queue").upsert([{ user_id: myId }], { onConflict: 'user_id' });
    }
  };

  useEffect(() => {
    if (!myId) return;
    const channel = supabase.channel("queue_listener");
    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "room" }, (payload) => {
      if (payload.new.p1_id === myId || payload.new.p2_id === myId) {
        router.push(`/room/${payload.new.id}`);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [myId, router]);

  useEffect(() => {
    const channel = supabase.channel("queue_count");
    const updateCount = async () => {
      const { data } = await supabase.from("queue").select("user_id");
      setOnlinePlayers(data ? data.length : 0);
    };
    updateCount();
    channel.on("postgres_changes", { event: "*", schema: "public", table: "queue" }, () => updateCount()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-black font-mono">
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 order-2 lg:order-1">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-2 italic text-center">VLR DUEL</h1>
        <p className="mb-8 lg:mb-12 text-gray-500 font-bold tracking-widest uppercase text-center text-xs md:text-sm">The Ultimate Pro-Draft Experience</p>
        <button
          onClick={handleQueueAction}
          className={`w-full max-w-xs md:max-w-sm py-6 text-xl md:text-2xl font-black uppercase transition-all border-4 border-black
            ${isQueuing ? "bg-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]" : "bg-white text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-4px] translate-y-[-4px] hover:translate-x-0 hover:translate-y-0"}`}
        >
          {isQueuing ? "CANCEL QUEUE" : "FIND MATCH"}
        </button>
        <div className="mt-4 text-base md:text-lg font-black uppercase text-black">
          Players in Queue: {onlinePlayers === null ? "..." : onlinePlayers}
        </div>
        {isQueuing && (
          <div className="mt-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-black rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="ml-2 font-black uppercase text-sm md:text-base">Searching...</span>
          </div>
        )}
      </div>
      <div className="w-full lg:w-96 border-b-4 lg:border-b-0 lg:border-l-4 border-black p-6 lg:p-8 flex flex-col bg-gray-50 order-1 lg:order-2">
        <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-2 italic">RULES</h2>
        <ul className="space-y-6">
          <li className="flex gap-4"><span className="font-black text-2xl">01</span><p className="text-sm md:text-base font-black uppercase leading-tight">Build your team with a $100 budget.</p></li>
          <li className="flex gap-4"><span className="font-black text-2xl">02</span><p className="text-sm md:text-base font-black uppercase leading-tight">Draft exactly 5 pro players to complete your roster.</p></li>
          <li className="flex gap-4"><span className="font-black text-2xl">03</span><p className="text-sm md:text-base font-black uppercase leading-tight">Players can be picked by both teams simultaneously.</p></li>
          <li className="flex gap-4"><span className="font-black text-2xl">04</span><p className="text-sm md:text-base font-black uppercase leading-tight">You have 30 seconds to finish your draft.</p></li>
          <li className="flex gap-4"><span className="font-black text-2xl">05</span><p className="text-sm md:text-base font-black uppercase leading-tight">The team with the highest total player value wins.</p></li>
        </ul>
      </div>
    </div>
  );
}