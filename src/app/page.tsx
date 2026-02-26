"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [myId, setMyId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);
    let userId = localStorage.getItem("vlr_duel_id");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("vlr_duel_id", userId);
    }
    setMyId(userId);

    let storedName = localStorage.getItem("vlr_duel_username");
    if (!storedName) {
      const inputName = prompt("Enter Your Username") || `Player_${userId.slice(0, 4)}`;
      localStorage.setItem("vlr_duel_username", inputName);
      storedName = inputName;
    }
    setUsername(storedName);

    const fetchInitialCount = async () => {
      const { count } = await supabase.from("queue").select("*", { count: 'exact', head: true });
      setOnlinePlayers(count || 0);
    };
    fetchInitialCount();

    const queueChannel = supabase.channel("global_queue_count")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, async () => {
        const { count } = await supabase.from("queue").select("*", { count: 'exact', head: true });
        setOnlinePlayers(count || 0);
      })
      .subscribe();

    return () => { supabase.removeChannel(queueChannel); };
  }, []);

  const handleSaveName = () => {
    localStorage.setItem("vlr_duel_username", username);
    setIsEditingName(false);
  };

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
      await supabase.from("queue").upsert([{ user_id: myId, user_name: username }], { onConflict: 'user_id' });
    }
  };

  useEffect(() => {
    if (!myId) return;
    const roomChannel = supabase.channel(`lobby_watcher_${myId}`)
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "room",
        filter: `p1_id=eq.${myId}`
      }, (payload) => router.push(`/room/${payload.new.id}`))
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "room",
        filter: `p2_id=eq.${myId}`
      }, (payload) => router.push(`/room/${payload.new.id}`))
      .subscribe();

    return () => { supabase.removeChannel(roomChannel); };
  }, [myId, router]);

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-black font-mono">
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 order-2 lg:order-1">
        <div className="mb-8 flex flex-col items-center gap-2">
          <p className="text-xs font-black uppercase text-gray-400">Your Identity</p>
          <div className="flex items-center gap-3 border-b-4 border-black pb-1">
            {isEditingName ? (
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleSaveName}
                autoFocus
                className="text-xl font-black uppercase outline-none bg-yellow-50 w-40"
              />
            ) : (
              <span className="text-xl md:text-2xl font-black uppercase italic">{username}</span>
            )}
            <button 
              onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)}
              className="text-xs bg-black text-white px-2 py-1 font-bold hover:bg-gray-800 transition-colors uppercase"
            >
              {isEditingName ? "SAVE" : "EDIT"}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase">ID: {myId.slice(0,8)}</p>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-2 italic text-center">VLR DUEL</h1>
        <p className="mb-8 lg:mb-12 text-gray-500 font-bold tracking-widest uppercase text-center text-xs md:text-sm">The Ultimate Pro-Draft Experience</p>
        
        <button
          onClick={handleQueueAction}
          className={`w-full max-w-xs md:max-w-sm py-6 text-xl md:text-2xl font-black uppercase transition-all border-4 border-black
            ${isQueuing ? "bg-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]" : "bg-white text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-4px] translate-y-[-4px] hover:translate-x-0 hover:translate-y-0"}`}
        >
          {isQueuing ? "CANCEL QUEUE" : "FIND MATCH"}
        </button>

        <div className="mt-6 flex flex-col items-center">
          <div className="text-lg md:text-xl font-black uppercase text-black flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            LIVE QUEUE: {onlinePlayers}
          </div>
          {isQueuing && (
            <div className="mt-4 flex items-center gap-2 text-sm md:text-base font-black uppercase">
              <span className="animate-pulse">Waiting for challenger...</span>
            </div>
          )}
        </div>
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