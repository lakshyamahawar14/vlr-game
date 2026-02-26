"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [myId, setMyId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string; challenging?: string; isQueuing?: boolean }[]>([]);
  const [challengeStack, setChallengeStack] = useState<{ id: string; name: string }[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<string | null>(null);
  const presenceChannelRef = useRef<any>(null);

  const syncPresence = async (queuing: boolean, currentName: string, challengingId: string | null) => {
    if (presenceChannelRef.current) {
      await presenceChannelRef.current.track({ 
        name: currentName, 
        challenging: challengingId, 
        isQueuing: queuing 
      });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const userId = localStorage.getItem("vlr_duel_id") || crypto.randomUUID();
    localStorage.setItem("vlr_duel_id", userId);
    setMyId(userId);

    const storedName = localStorage.getItem("vlr_duel_username") || `Player_${userId.slice(0, 4)}`;
    setUsername(storedName);

    presenceChannelRef.current = supabase.channel("global_lobby", {
      config: { 
        presence: { key: userId },
        broadcast: { self: true } 
      }
    });

    const handleSync = () => {
      const state = presenceChannelRef.current.presenceState();
      const users = Object.keys(state).map((key) => ({
        id: key,
        name: (state[key][0] as any)?.name || "Unknown",
        challenging: (state[key][0] as any)?.challenging,
        isQueuing: (state[key][0] as any)?.isQueuing
      }));

      setOnlineUsers(users);
      const me = users.find(u => u.id === userId);
      if (me) {
        setIsQueuing(!!me.isQueuing);
        setIsWaitingForResponse(me.challenging || null);
      }
      setChallengeStack(users.filter(u => u.challenging === userId).map(c => ({ id: c.id, name: c.name })));
    };

    presenceChannelRef.current
      .on("presence", { event: "sync" }, handleSync)
      .on("presence", { event: "join" }, handleSync)
      .on("presence", { event: "leave" }, handleSync)
      .on("broadcast", { event: "duel_declined" }, (payload: any) => {
        if (payload.payload.challengerId === userId) {
          syncPresence(isQueuing, username, null);
        }
      })
      .on("broadcast", { event: "duel_started" }, (payload: any) => {
        if (payload.payload.targetId === userId || payload.payload.challengerId === userId) {
          router.push(`/room/${payload.payload.roomId}`);
        }
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await syncPresence(false, storedName, null);
        }
      });

    return () => { supabase.removeChannel(presenceChannelRef.current); };
  }, [router, myId]);

  useEffect(() => {
    if (isQueuing) {
      const otherQueuer = onlineUsers.find(u => u.isQueuing && u.id !== myId);
      if (otherQueuer && myId < otherQueuer.id) {
        const roomId = `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        supabase.from("room").insert([
          { id: roomId, p1_id: myId, p2_id: otherQueuer.id, status: "DRAFTING", p1_name: username, p2_name: otherQueuer.name }
        ]).then(({ error }) => {
          if (!error) {
            presenceChannelRef.current.send({
              type: "broadcast",
              event: "duel_started",
              payload: { roomId, challengerId: myId, targetId: otherQueuer.id },
            });
          }
        });
      }
    }
  }, [isQueuing, onlineUsers, myId, username]);

  const sendDuelRequest = async (targetId: string) => {
    await syncPresence(isQueuing, username, targetId);
  };

  const cancelDuelRequest = async () => {
    await syncPresence(isQueuing, username, null);
  };

  const acceptDuel = async () => {
    if (challengeStack.length === 0) return;
    const challenger = challengeStack[0];
    const roomId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const { error } = await supabase.from("room").insert([
      { id: roomId, p1_id: challenger.id, p2_id: myId, status: "DRAFTING", p1_name: challenger.name, p2_name: username }
    ]);
    
    if (!error) {
      await presenceChannelRef.current.send({
        type: "broadcast",
        event: "duel_started",
        payload: { roomId, challengerId: challenger.id, targetId: myId },
      });
    }
  };

  const declineDuel = async () => {
    if (challengeStack.length === 0) return;
    const challengerId = challengeStack[0].id;
    await presenceChannelRef.current.send({ type: "broadcast", event: "duel_declined", payload: { challengerId } });
  };

  const handleSaveName = async () => {
    let cleanName = username.trim() || "Unknown";
    if (cleanName.length > 12) cleanName = cleanName.slice(0, 12);
    setUsername(cleanName);
    localStorage.setItem("vlr_duel_username", cleanName);
    setIsEditingName(false);
    await syncPresence(isQueuing, cleanName, isWaitingForResponse);
  };

  const handleQueueAction = async () => {
    await syncPresence(!isQueuing, username, isWaitingForResponse);
  };

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  const queueMembers = onlineUsers.filter(u => u.isQueuing);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-black font-mono">
      <div className="w-full lg:w-80 border-b-4 lg:border-b-0 lg:border-r-4 border-black p-6 flex flex-col bg-gray-50">
        <h2 className="text-xl font-black uppercase mb-6 border-b-2 border-black pb-1 italic">DRAFT PROTOCOL</h2>
        <ul className="space-y-6">
          <li className="flex gap-4"><span className="font-black text-xl">01</span><div><p className="text-[11px] font-black uppercase text-red-500 mb-0.5">Budgeting</p><p className="text-[13px] font-black uppercase leading-tight text-gray-700">Players are capped at a $100 spending limit.</p></div></li>
          <li className="flex gap-4"><span className="font-black text-xl">02</span><div><p className="text-[11px] font-black uppercase text-red-500 mb-0.5">Selection</p><p className="text-[13px] font-black uppercase leading-tight text-gray-700">You must draft a complete roster of five players.</p></div></li>
          <li className="flex gap-4"><span className="font-black text-xl">03</span><div><p className="text-[11px] font-black uppercase text-red-500 mb-0.5">Global Pool</p><p className="text-[13px] font-black uppercase leading-tight text-gray-700">Both users pick from the same live player pool.</p></div></li>
          <li className="flex gap-4"><span className="font-black text-xl">04</span><div><p className="text-[11px] font-black uppercase text-red-500 mb-0.5">The Sniped</p><p className="text-[13px] font-black uppercase leading-tight text-gray-700">If your opponent picks a player first, you lose them.</p></div></li>
          <li className="flex gap-4"><span className="font-black text-xl">05</span><div><p className="text-[11px] font-black uppercase text-red-500 mb-0.5">Victory</p><p className="text-[13px] font-black uppercase leading-tight text-gray-700">The manager with the highest total roster value wins.</p></div></li>
        </ul>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="mb-8 flex flex-col items-center gap-2">
          <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Your Username</p>
          <div className="flex items-center gap-3 border-b-2 border-black pb-2">
            {isEditingName ? (
              <input value={username} onChange={(e) => setUsername(e.target.value)} onBlur={handleSaveName} onKeyDown={(e) => e.key === "Enter" && handleSaveName()} autoFocus maxLength={12} className="text-2xl font-black uppercase outline-none w-48 bg-yellow-50" />
            ) : (
              <span className="text-2xl font-black uppercase italic">{username}</span>
            )}
            <button onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)} className="text-xs bg-black text-white px-3 py-1 font-bold uppercase hover:bg-red-600">
              {isEditingName ? "CONFIRM" : "RENAME"}
            </button>
          </div>
          <p className="text-[10px] font-black uppercase text-gray-300">{`UID: ${myId.slice(0, 8)}`}</p>
        </div>
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-1 italic text-center">VLR DUEL</h1>
        <p className="mb-12 text-gray-400 font-bold tracking-[0.4em] uppercase text-center text-[10px]">High-Stakes Tactical Drafting</p>
        <button onClick={handleQueueAction} className={`w-full max-w-xs py-6 text-2xl font-black uppercase transition-all border-4 border-black bg-white text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${isQueuing ? "!bg-black !text-white !shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]" : ""}`}>
          {isQueuing ? "ABORT" : "FIND MATCH"}
        </button>
      </div>
      <div className="w-full lg:w-80 border-t-4 lg:border-t-0 lg:border-l-4 border-black bg-gray-50 flex flex-col overflow-hidden relative">
        {challengeStack.length > 0 && (
          <div className="absolute inset-0 z-50 bg-black text-white p-6 flex flex-col justify-center items-center text-center">
            <p className="text-xs font-black uppercase text-red-500 mb-2">Incoming Duel ({challengeStack.length})</p>
            <h3 className="text-xl font-black uppercase italic mb-6 truncate w-full">{challengeStack[0].name}</h3>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={acceptDuel} className="bg-white text-black py-3 font-black uppercase hover:bg-green-400">Accept</button>
              <button onClick={declineDuel} className="border-2 border-white py-2 font-black uppercase hover:bg-red-600">Decline</button>
            </div>
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-1">
            <h2 className="text-xl font-black uppercase italic">ONLINE PLAYERS</h2>
            <div className="font-black text-sm text-green-600">{onlineUsers.length}</div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
            {onlineUsers.map((user) => (
              <div key={user.id} className={`p-4 border-2 border-black transition-colors ${user.id === myId ? "bg-yellow-300" : "bg-white hover:bg-gray-100"}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-black uppercase italic truncate max-w-[100px]">{user.name}</span>
                  {user.id === myId ? (
                     <span className="text-[9px] bg-black text-white px-1 font-black tracking-tighter">YOU</span>
                  ) : (
                    <button onClick={() => isWaitingForResponse === user.id ? cancelDuelRequest() : sendDuelRequest(user.id)} className={`text-[10px] px-2 py-0.5 font-black uppercase border-2 border-black transition-all ${isWaitingForResponse === user.id ? 'bg-black text-white animate-pulse' : 'bg-white text-black'}`}>
                      {isWaitingForResponse === user.id ? "WAITING" : "DUEL"}
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {user.id.slice(0, 8)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t-4 border-black bg-white flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-1">
            <h2 className="text-xl font-black uppercase italic">LIVE QUEUE</h2>
            <div className="font-black text-sm text-green-600">{queueMembers.length}</div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
            {queueMembers.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 p-4 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase">Awaiting Players...</p>
              </div>
            ) : (
              queueMembers.map((player) => (
                <div key={player.id} className={`p-4 border-2 border-black ${player.id === myId ? "bg-yellow-300" : "bg-white"}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-black uppercase italic truncate">{player.name}</span>
                    {player.id === myId && <span className="text-[9px] bg-black text-white px-1 font-black tracking-tighter">YOU</span>}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {player.id.slice(0, 8)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}