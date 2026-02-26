"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  const [myId, setMyId] = useState<string | null>(null);
  const [myName, setMyName] = useState<string>("YOU");
  const [oppName, setOppName] = useState<string>("ENEMY");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(true);
  const [team, setTeam] = useState<Player[]>([]);
  const [oppTeam, setOppTeam] = useState<Player[]>([]);
  const [budget, setBudget] = useState(100);
  const [timer, setTimer] = useState(30);
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<"p1" | "p2" | null>(null);
  
  const teamRef = useRef<Player[]>([]);
  const statusRef = useRef<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setMyId(localStorage.getItem("vlr_duel_id"));
    setMyName(localStorage.getItem("vlr_duel_username") || "YOU");
  }, []);

  useEffect(() => {
    if (!isMounted || !myId || !params?.id) return;
    const roomId = params.id as string;

    const syncStates = async (data: any) => {
      if (!data) return;
      const isP1 = data.p1_id === myId;
      setRole(isP1 ? "p1" : "p2");
      setStatus(data.status || "DRAFTING");
      statusRef.current = data.status || "DRAFTING";
      
      if (isP1) {
        if (!data.p1_name) await supabase.from("room").update({ p1_name: myName }).eq("id", roomId);
        setOppName(data.p2_name || "WAITING...");
      } else {
        if (!data.p2_name) await supabase.from("room").update({ p2_name: myName }).eq("id", roomId);
        setOppName(data.p1_name || "WAITING...");
      }
      
      const incomingMyTeam = isP1 ? data.p1_team || [] : data.p2_team || [];
      const incomingOppTeam = isP1 ? data.p2_team || [] : data.p1_team || [];
      
      setTeam(incomingMyTeam);
      teamRef.current = incomingMyTeam;
      setOppTeam(incomingOppTeam);
      
      const currentCost = incomingMyTeam.reduce((acc: number, p: Player) => acc + p.cost, 0);
      setBudget(100 - currentCost);

      if (data.created_at && data.status === "DRAFTING") {
        const startTime = new Date(data.created_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setTimer(Math.max(0, 30 - elapsed));
      }

      setIsLoading(false);
    };

    const fetchInitial = async () => {
      const { data, error } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
      if (data) {
        setRoomExists(true);
        syncStates(data);
      } else if (!error) {
        setRoomExists(false);
        setIsLoading(false);
      }
    };
    fetchInitial();

    const channel = supabase.channel(`room_sync_${roomId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "room", filter: `id=eq.${roomId}` }, (payload) => {
        syncStates(payload.new);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "room", filter: `id=eq.${roomId}` }, () => {
        setRoomExists(false);
      })
      .subscribe();

    const interval = setInterval(() => {
      setTimer((p) => {
        if (statusRef.current !== "DRAFTING") return p;
        if (p <= 1) {
          if (role === "p1") {
            supabase.from("room").update({ status: "ENDED" }).eq("id", roomId).then();
          }
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => { 
      clearInterval(interval); 
      supabase.removeChannel(channel); 
    };
  }, [isMounted, myId, params?.id, role, myName]);

  const handlePick = async (name: string, cost: number) => {
    if (!params?.id || !role || status !== "DRAFTING" || teamRef.current.length >= 5 || budget < cost) return;
    if (teamRef.current.some(p => p.name === name)) return;
    if (oppTeam.some(p => p.name === name)) return;

    const newTeam = [...teamRef.current, { name, cost }];
    
    setTeam(newTeam);
    teamRef.current = newTeam;
    setBudget(prev => prev - cost);

    const updatePayload = role === "p1" 
      ? { p1_team: newTeam, p1_pick_count: newTeam.length, p1_name: myName } 
      : { p2_team: newTeam, p2_pick_count: newTeam.length, p2_name: myName };

    await supabase.from("room").update(updatePayload).eq("id", params.id);
  };

  const myValue = useMemo(() => team.reduce((acc, p) => acc + p.cost, 0), [team]);
  const oppValue = useMemo(() => oppTeam.reduce((acc, p) => acc + p.cost, 0), [oppTeam]);

  if (!isMounted || isLoading) return <div className="min-h-screen bg-white flex items-center justify-center font-mono text-xl font-black animate-pulse uppercase italic">Initializing Arena...</div>;

  if (!roomExists) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 font-mono">
        <div className="bg-black text-white p-6 md:p-12 text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full">
          <h2 className="text-3xl md:text-5xl font-black italic mb-6 uppercase tracking-tighter underline decoration-red-500 decoration-4 underline-offset-4">Room Not Found</h2>
          <button onClick={() => router.push("/")} className="w-full md:w-auto bg-white text-black px-8 py-3 font-black uppercase text-lg hover:bg-yellow-400 transition-colors border-2 border-white">Back to Lobby</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 max-w-7xl mx-auto font-mono text-black">
      <style>{`
        @keyframes strobe-bg {
          0%, 49% { background-color: #dc2626; color: white; }
          50%, 100% { background-color: #fff; color: #dc2626; }
        }
        .animate-strobe-fast { animation: strobe-bg 1s steps(1) infinite; }
      `}</style>

      <div className="flex flex-col md:grid md:grid-cols-3 border-4 border-black p-4 md:p-5 mb-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] items-center gap-4">
        <div className="text-center md:text-left w-full">
          <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Budget</p>
          <p className="text-4xl md:text-5xl font-black">${budget}</p>
        </div>
        <div className="flex justify-center w-full">
          <div className={`text-3xl md:text-5xl font-black italic px-6 py-2 border-[4px] border-black transition-all flex items-center justify-center w-full md:w-auto min-w-[150px]
            ${status === "DRAFTING" && timer <= 10 ? 'animate-strobe-fast' : 'bg-black text-white'}`}>
            {status === "DRAFTING" ? `${timer}S` : "FINISH"}
          </div>
        </div>
        <div className="text-center md:text-right w-full">
          <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Game Status</p>
          <p className="text-2xl md:text-3xl font-black uppercase italic">{status}</p>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 border-4 border-black p-4 bg-blue-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] order-2 lg:order-1">
          <h2 className="text-xl md:text-2xl font-black uppercase mb-2 border-b-2 border-black italic pb-1 flex flex-col items-start">
            <span className="whitespace-normal break-words w-full">{myName}</span>
            <span className="text-blue-600 text-lg md:text-xl italic">${myValue}</span>
          </h2>
          <div className="text-xs md:text-sm font-black uppercase text-black mb-3 tracking-tighter bg-yellow-300 inline-block px-2">Drafted: {team.length}/5</div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-12 border-2 flex items-center justify-between px-3 font-black text-sm md:text-base uppercase italic transition-all ${team[i] ? "bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent border-dashed border-gray-300 text-gray-300"}`}>
                {team[i] ? <><span className="truncate">{team[i].name}</span><span>${team[i].cost}</span></> : <span>---</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          {status === "DRAFTING" ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-opacity duration-300 ${team.length >= 5 ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
              {Object.entries(CATEGORIES).sort((a, b) => Number(b[0]) - Number(a[0])).map(([cost, players]) => (
                <div key={cost} className="border-2 border-black p-2 bg-white">
                  <div className="bg-black text-white text-center mb-3 font-black italic uppercase py-1 text-lg md:text-xl">${cost}</div>
                  <div className="space-y-1.5">
                    {players.map((p) => {
                      const costNum = parseInt(cost);
                      const isPicked = team.some(tp => tp.name === p);
                      const isOpponentPicked = oppTeam.some(tp => tp.name === p);
                      const cannotAfford = budget < costNum;
                      return (
                        <button 
                          key={p} 
                          onClick={() => handlePick(p, costNum)} 
                          disabled={cannotAfford || team.length >= 5 || isPicked || isOpponentPicked}
                          className={`w-full text-left p-3 font-black text-sm border-2 uppercase transition-all 
                            ${isPicked ? 'bg-green-400 border-black cursor-default translate-x-1 translate-y-1' : 
                              isOpponentPicked ? 'bg-red-400 border-black opacity-50 cursor-not-allowed' :
                              cannotAfford ? 'bg-gray-100 border-gray-300 text-gray-300 cursor-not-allowed' :
                              'bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'}`}>
                          {p} {isOpponentPicked && "(TAKEN)"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black text-white p-6 md:p-10 text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-4xl md:text-6xl font-black italic mb-1 uppercase tracking-tighter underline decoration-yellow-400 decoration-4 underline-offset-4">Result</h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 my-6 border-y border-white/20 py-6">
                <div className="text-center w-full md:w-1/3">
                  <p className="text-gray-400 font-black uppercase text-[10px] mb-1 whitespace-normal break-words">{myName}</p>
                  <p className="text-4xl md:text-6xl font-black">${myValue}</p>
                </div>
                <div className="text-2xl md:text-4xl font-black text-gray-500 italic">VS</div>
                <div className="text-center w-full md:w-1/3">
                  <p className="text-gray-400 font-black uppercase text-[10px] mb-1 whitespace-normal break-words">{oppName}</p>
                  <p className="text-4xl md:text-6xl font-black">${oppValue}</p>
                </div>
              </div>
              <div className="text-3xl md:text-5xl font-black mb-6 uppercase italic tracking-widest">
                {myValue > oppValue ? "Victory" : myValue < oppValue ? "Defeat" : "Draw"}
              </div>
              <button onClick={() => router.push("/")} className="w-full md:w-auto bg-white text-black px-10 py-3 font-black uppercase text-lg hover:bg-yellow-400 transition-colors border-2 border-white">Lobby</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 border-4 border-black p-4 bg-red-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] order-3 lg:order-3">
          <h2 className="text-xl md:text-2xl font-black uppercase mb-2 border-b-2 border-black italic pb-1 flex flex-col items-end">
            <span className="whitespace-normal break-words w-full text-right">{oppName}</span>
            <span className="text-red-600 text-lg md:text-xl italic">${oppValue}</span>
          </h2>
          <div className="text-xs md:text-sm font-black uppercase text-black mb-3 tracking-tighter text-right bg-red-200 inline-block w-full px-2">Drafted: {oppTeam.length}/5</div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-12 border-2 flex items-center justify-between px-3 font-black text-sm md:text-base uppercase italic transition-all ${oppTeam[i] ? "bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent border-dashed border-gray-300 text-gray-300"}`}>
                {oppTeam[i] ? <><span className="truncate">{oppTeam[i].name}</span><span>${oppTeam[i].cost}</span></> : <span>---</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}