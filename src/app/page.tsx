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
  const [queueList, setQueueList] = useState<{ user_id: string; user_name: string }[]>([]);

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

    const fetchQueue = async () => {
      const { data } = await supabase.from("queue").select("user_id, user_name").order("created_at", { ascending: true });
      setQueueList(data || []);
    };
    fetchQueue();

    const queueChannel = supabase.channel("live_queue_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, () => {
        fetchQueue();
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
    const { data: queue } = await supabase.from("queue").select("user_id").order("created_at", { ascending: true }).limit(1);

    if (queue && queue.length > 0 && queue[0].user_id !== myId) {
      const oppId = queue[0].user_id;
      const roomId = [myId, oppId].sort().join("_");
      const { error } = await supabase.from("room").upsert([{ id: roomId, p1_id: myId, p2_id: oppId, status: "DRAFTING" }], { onConflict: 'id' });
      if (!error) {
        await supabase.from("queue").delete().in("user_id", [myId, oppId]);
        router.push(`/room/${roomId}`);
      }
    } else {
      await supabase.from("queue").upsert([{ user_id: myId, user_name: username }], { onConflict: 'user_id' });
    }
  };

  useEffect(() => {
    if (!myId) return;
    const roomChannel = supabase.channel(`lobby_${myId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "room" }, (payload) => {
        if (payload.new.p1_id === myId || payload.new.p2_id === myId) router.push(`/room/${payload.new.id}`);
      })
      .subscribe();
    return () => { supabase.removeChannel(roomChannel); };
  }, [myId, router]);

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-black font-mono">
      {/* LEFT: RULES */}
      <div className="w-full lg:w-80 border-b-4 lg:border-b-0 lg:border-r-4 border-black p-6 flex flex-col bg-gray-50">
        <h2 className="text-xl font-black uppercase mb-6 border-b-2 border-black pb-1 italic">DRAFT PROTOCOL</h2>
        <ul className="space-y-6">
          <li className="flex gap-4">
            <span className="font-black text-xl">01</span>
            <div>
              <p className="text-[11px] font-black uppercase text-red-500 mb-0.5">Financials</p>
              <p className="text-[13px] font-black uppercase leading-tight text-gray-700">You are granted a $100 budget. Every pick deducts from this total. Zero credit is allowed.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-black text-xl">02</span>
            <div>
              <p className="text-[11px] font-black uppercase text-red-500 mb-0.5">Roster</p>
              <p className="text-[13px] font-black uppercase leading-tight text-gray-700">You must draft exactly 5 pro players. Incomplete rosters will result in an automatic score calculation.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-black text-xl">03</span>
            <div>
              <p className="text-[11px] font-black uppercase text-red-500 mb-0.5">Simultaneity</p>
              <p className="text-[13px] font-black uppercase leading-tight text-gray-700">Both managers pick from the same pool. Speed is essential to secure high-value assets first.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-black text-xl">04</span>
            <div>
              <p className="text-[11px] font-black uppercase text-red-500 mb-0.5">The Clock</p>
              <p className="text-[13px] font-black uppercase leading-tight text-gray-700">A strict 30-second window is enforced. If the timer hits zero, scores are tallied immediately.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-black text-xl">05</span>
            <div>
              <p className="text-[11px] font-black uppercase text-red-500 mb-0.5">Objective</p>
              <p className="text-[13px] font-black uppercase leading-tight text-gray-700">The manager with the highest combined roster value claims the victory. Spend strategically.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* CENTER: HERO */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="mb-8 flex flex-col items-center gap-2">
          <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Your Username</p>
          <div className="flex items-center gap-3 border-b-2 border-black pb-2">
            {isEditingName ? (
              <input value={username} onChange={(e) => setUsername(e.target.value)} onBlur={handleSaveName} autoFocus className="text-2xl font-black uppercase outline-none bg-yellow-50 w-48" />
            ) : (
              <span className="text-2xl font-black uppercase italic">{username}</span>
            )}
            <button onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)} className="text-xs bg-black text-white px-3 py-1 font-bold uppercase hover:bg-red-600 transition-colors">
              {isEditingName ? "CONFIRM" : "RENAME"}
            </button>
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase">UID: {myId.slice(0, 8)}</p>
        </div>

        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-1 italic text-center">VLR DUEL</h1>
        <p className="mb-12 text-gray-400 font-bold tracking-[0.4em] uppercase text-center text-[10px]">High-Stakes Tactical Drafting</p>
        
        <button
          onClick={handleQueueAction}
          className={`w-full max-w-xs py-6 text-2xl font-black uppercase transition-all border-4 border-black
            ${isQueuing ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]" : "bg-white text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"}`}
        >
          {isQueuing ? "ABORT" : "FIND MATCH"}
        </button>
      </div>

      {/* RIGHT: LIVE QUEUE */}
      <div className="w-full lg:w-80 border-t-4 lg:border-t-0 lg:border-l-4 border-black p-6 bg-gray-50 flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-1">
          <h2 className="text-xl font-black uppercase italic">LIVE QUEUE</h2>
          <div className="flex items-center gap-2 font-black text-sm">{queueList.length} ACTIVE</div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] lg:max-h-full scrollbar-hide">
          {queueList.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 p-6 text-center">
              <p className="text-xs font-black text-gray-400 uppercase italic">Awaiting Players...</p>
            </div>
          ) : (
            queueList.map((player) => (
              <div key={player.user_id} className={`p-4 border-2 border-black transition-colors ${player.user_id === myId ? "bg-yellow-300" : "bg-white"}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-black uppercase italic truncate pr-2">{player.user_name}</span>
                  {player.user_id === myId && <span className="text-[9px] bg-black text-white px-1.5 py-0.5 font-black">YOU</span>}
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {player.user_id.slice(0, 8)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}