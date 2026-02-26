"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

const CATEGORIES = {
  50: ["aspas", "TenZ", "ZywOo"],
  40: ["Derke", "Leo", "Chronicle"],
  30: ["Boaster", "Saadhak", "FNS"],
  20: ["Less", "Mazino", "Klaus"],
  10: ["BuZz", "Rb", "Zest"]
};

type Player = { name: string; cost: number };

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  
  const [roomId, setRoomId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [team, setTeam] = useState<Player[]>([]);
  const [oppTeam, setOppTeam] = useState<Player[]>([]);
  const [budget, setBudget] = useState(100);
  const [timer, setTimer] = useState(30);
  const [gameEnded, setGameEnded] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const channelRef = useRef<any>(null);

  useEffect(() => {
    setHasMounted(true);
    const storedId = localStorage.getItem("vlr_user_id");
    setMyId(storedId);

    const idFromParams = params?.roomId as string;
    if (idFromParams) {
      setRoomId(idFromParams);
    } else {
      const pathParts = window.location.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== "room") setRoomId(lastPart);
    }
  }, [params]);

  useEffect(() => {
    if (!hasMounted || !myId || !roomId) return;

    const channel = supabase.channel(`room_${roomId}`, {
      config: { presence: { key: myId } },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setIsDisconnected(Object.keys(state).length < 2);
      })
      .on("broadcast", { event: "pick" }, (payload) => {
        if (payload.payload.sender !== myId) {
          setOppTeam(payload.payload.team);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [hasMounted, myId, roomId]);

  const handlePick = async (name: string, cost: number) => {
    if (team.length >= 5 || budget < cost || gameEnded) return;
    if (team.some(p => p.name === name) || oppTeam.some(p => p.name === name)) return;

    const newTeam = [...team, { name, cost }];
    setTeam(newTeam);
    setBudget(prev => prev - cost);

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "pick",
        payload: { sender: myId, team: newTeam }
      });
    }
  };

  if (!hasMounted) return null;

  if (!roomId || !myId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen font-mono bg-gray-100 p-10 text-black">
        <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-bold mb-4">INITIALIZATION ERROR</h2>
          <p className="text-sm mb-2">Room ID: <span className="text-red-500 font-bold">{roomId || "MISSING"}</span></p>
          <p className="text-sm mb-6">User ID: <span className="text-green-600 font-bold">{myId || "MISSING"}</span></p>
          <button 
            onClick={() => router.push("/")} 
            className="w-full bg-black text-white font-bold py-2 hover:bg-gray-800"
          >
            RETURN TO LOBBY
          </button>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black font-mono p-4">
        <h1 className="text-4xl font-black mb-8 border-b-4 border-black">DRAFT COMPLETE</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mb-8">
           <div className="border-2 border-black p-4">
              <p className="font-bold uppercase mb-4 text-center bg-black text-white">Your Team</p>
              {team.length > 0 ? team.map(p => (
                <div key={p.name} className="py-1 border-b border-gray-200">{p.name}</div>
              )) : <p className="text-gray-400 italic">No players selected</p>}
           </div>
           <div className="border-2 border-black p-4 opacity-60">
              <p className="font-bold uppercase mb-4 text-center bg-gray-400 text-white">Opponent</p>
              {oppTeam.length > 0 ? oppTeam.map(p => (
                <div key={p.name} className="py-1 border-b border-gray-200">{p.name}</div>
              )) : <p className="text-gray-400 italic">No players selected</p>}
           </div>
        </div>
        <button onClick={() => router.push("/")} className="border-2 border-black px-12 py-4 font-bold hover:bg-black hover:text-white transition-all">
          PLAY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto font-mono text-black">
      {isDisconnected && (
        <div className="bg-red-600 text-white p-2 mb-4 text-center font-bold animate-pulse border-2 border-black">
          OPPONENT DISCONNECTED
        </div>
      )}

      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        <div>
          <p className="text-xl">Budget: <span className="font-bold">${budget}</span></p>
          <p className="font-bold uppercase text-sm">Roster: {team.length}/5</p>
        </div>
        <div className="text-5xl font-black tabular-nums">{timer}s</div>
        <div className="text-right">
          <p className="text-sm">Opponent</p>
          <p className="text-xl font-bold">{oppTeam.length}/5</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
        {Object.entries(CATEGORIES).sort((a,b) => Number(b[0]) - Number(a[0])).map(([cost, players]) => (
          <div key={cost} className="border border-black p-2 bg-gray-50">
            <div className="bg-black text-white text-center mb-2 font-bold">${cost}</div>
            {players.map((p) => {
              const pickedMe = team.some(tp => tp.name === p);
              const pickedOpp = oppTeam.some(op => op.name === p);
              return (
                <button
                  key={p}
                  onClick={() => handlePick(p, parseInt(cost))}
                  disabled={budget < parseInt(cost) || team.length >= 5 || pickedMe || pickedOpp}
                  className={`w-full text-left mb-1 p-1 font-bold text-xs sm:text-sm border
                    ${pickedMe ? 'bg-black text-white border-black' : 'border-transparent'}
                    ${pickedOpp ? 'opacity-20 cursor-not-allowed line-through' : 'hover:bg-gray-200'}
                  `}
                >
                  {p}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="border-t-4 border-black pt-6">
        <h2 className="text-xl font-black uppercase mb-4 italic underline">Your Squad:</h2>
        <div className="flex flex-wrap gap-3">
          {team.map((p) => (
            <div key={p.name} className="border-2 border-black px-4 py-2 font-bold bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              {p.name} <span className="text-[10px] ml-2 opacity-70">${p.cost}</span>
            </div>
          ))}
          {Array.from({ length: 5 - team.length }).map((_, i) => (
            <div key={i} className="border-2 border-dashed border-gray-400 px-4 py-2 text-gray-400 font-bold">
              SLOT {team.length + i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}