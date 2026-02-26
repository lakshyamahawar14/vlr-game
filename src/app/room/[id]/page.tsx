"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(true);
  const [team, setTeam] = useState<Player[]>([]);
  const [oppTeam, setOppTeam] = useState<Player[]>([]);
  const [budget, setBudget] = useState(100);
  const [timer, setTimer] = useState(30);
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<"p1" | "p2" | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setMyId(localStorage.getItem("vlr_duel_id"));
  }, []);

  useEffect(() => {
    if (!isMounted || !myId || !params?.id) return;
    const roomId = params.id as string;

    const syncStates = (data: any) => {
      if (data.id !== roomId) return;
      const isP1 = data.p1_id === myId;
      setRole(isP1 ? "p1" : "p2");
      setStatus(data.status || "DRAFTING");
      const myT = isP1 ? data.p1_team || [] : data.p2_team || [];
      const enemyT = isP1 ? data.p2_team || [] : data.p1_team || [];
      setTeam(myT);
      setOppTeam(enemyT);
      setBudget(100 - myT.reduce((acc: number, p: Player) => acc + p.cost, 0));
      setIsLoading(false);
    };

    const fetchInitial = async () => {
      const { data } = await supabase.from("room").select("*").eq("id", roomId).maybeSingle();
      if (data) {
        setRoomExists(true);
        syncStates(data);
      } else {
        setRoomExists(false);
        setIsLoading(false);
      }
    };
    fetchInitial();

    const channel = supabase.channel(`room_${roomId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "room" }, (payload) => {
        syncStates(payload.new);
      })
      .subscribe();

    const interval = setInterval(() => {
      if (status !== "DRAFTING") {
        clearInterval(interval);
        return;
      }
      setTimer((p) => {
        if (p <= 1) {
          supabase.from("room").update({ status: "ENDED" }).eq("id", roomId).select().then(({ data }) => {
            if (data?.[0]) syncStates(data[0]);
          });
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => { 
      clearInterval(interval); 
      supabase.removeChannel(channel); 
    };
  }, [isMounted, myId, params?.id, status]);

  const handlePick = async (name: string, cost: number) => {
    if (!params?.id || !role || status !== "DRAFTING" || team.length >= 5 || budget < cost) return;
    if (team.some(p => p.name === name)) return;
    const newTeam = [...team, { name, cost }];
    setTeam(newTeam);
    setBudget(prev => prev - cost);
    await supabase.from("room").update(
      role === "p1" ? { p1_team: newTeam, p1_pick_count: newTeam.length } : { p2_team: newTeam, p2_pick_count: newTeam.length }
    ).eq("id", params.id);
  };

  const myValue = useMemo(() => team.reduce((acc, p) => acc + p.cost, 0), [team]);
  const oppValue = useMemo(() => oppTeam.reduce((acc, p) => acc + p.cost, 0), [oppTeam]);

  if (!isMounted || isLoading) return <div className="min-h-screen bg-white flex items-center justify-center font-mono text-2xl font-black animate-pulse uppercase italic">Initializing Arena...</div>;

  if (!roomExists) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 font-mono">
        <div className="bg-black text-white p-8 md:p-16 text-center border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full">
          <h2 className="text-4xl md:text-7xl font-black italic mb-8 uppercase tracking-tighter underline decoration-red-500 decoration-8 underline-offset-8">Room Not Found</h2>
          <button onClick={() => router.push("/")} className="w-full md:w-auto bg-white text-black px-12 py-4 font-black uppercase text-xl hover:bg-yellow-400 transition-colors border-4 border-white">Back to Lobby</button>
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

      <div className="flex flex-col md:grid md:grid-cols-3 border-4 border-black p-4 md:p-6 mb-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] items-center gap-6">
        <div className="text-center md:text-left w-full">
          <p className="text-sm font-black text-gray-400 uppercase italic tracking-widest">Budget</p>
          <p className="text-5xl md:text-6xl lg:text-7xl font-black">${budget}</p>
        </div>
        <div className="flex justify-center w-full">
          <div className={`text-4xl md:text-5xl lg:text-7xl font-black italic px-8 py-3 md:px-12 md:py-4 border-[6px] border-black transition-all flex items-center justify-center w-full md:w-auto min-w-[200px]
            ${status === "DRAFTING" && timer <= 10 ? 'animate-strobe-fast' : 'bg-black text-white'}`}>
            {status === "DRAFTING" ? `${timer}S` : "FINISHED"}
          </div>
        </div>
        <div className="text-center md:text-right w-full">
          <p className="text-sm font-black text-gray-400 uppercase italic tracking-widest">Global Status</p>
          <p className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic">{status}</p>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 border-4 border-black p-5 bg-blue-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] order-2 lg:order-1">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 border-b-4 border-black italic pb-2 flex justify-between items-end">
            <span>You</span>
            <span className="text-blue-600 text-lg md:text-2xl italic">${myValue}</span>
          </h2>
          <div className="text-sm md:text-lg font-black uppercase text-black mb-4 tracking-tighter">Players Selected: {team.length}/5</div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-14 border-2 flex items-center justify-between px-3 font-black text-base md:text-lg uppercase italic transition-all ${team[i] ? "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent border-dashed border-gray-300 text-gray-300"}`}>
                {team[i] ? <><span className="truncate">{team[i].name}</span><span>${team[i].cost}</span></> : <span>Slot {i+1}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          {status === "DRAFTING" ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${team.length >= 5 ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
              {Object.entries(CATEGORIES).sort((a, b) => Number(b[0]) - Number(a[0])).map(([cost, players]) => (
                <div key={cost} className="border-4 border-black p-3 bg-white">
                  <div className="bg-black text-white text-center mb-4 font-black italic uppercase py-2 text-xl md:text-2xl">${cost}</div>
                  <div className="space-y-2">
                    {players.map((p) => {
                      const isPicked = team.some(tp => tp.name === p);
                      return (
                        <button key={p} onClick={() => handlePick(p, parseInt(cost))} disabled={budget < parseInt(cost) || team.length >= 5 || isPicked}
                          className={`w-full text-left p-4 font-black text-sm md:text-base border-2 uppercase transition-all ${isPicked ? 'bg-green-400 border-black cursor-default' : 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'}`}>{p}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black text-white p-8 md:p-16 text-center border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-5xl md:text-7xl font-black italic mb-2 uppercase tracking-tighter underline decoration-yellow-400 decoration-8 underline-offset-8">Result</h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 my-10 border-y border-white/20 py-8">
                <div><p className="text-gray-400 font-black uppercase text-sm mb-1">Your Score</p><p className="text-5xl md:text-7xl font-black">${myValue}</p></div>
                <div className="text-3xl md:text-5xl font-black text-gray-500 italic">VS</div>
                <div><p className="text-gray-400 font-black uppercase text-sm mb-1">Enemy Score</p><p className="text-5xl md:text-7xl font-black">${oppValue}</p></div>
              </div>
              <div className="text-4xl md:text-6xl font-black mb-10 uppercase italic tracking-widest">{myValue > oppValue ? "Victory" : myValue < oppValue ? "Defeat" : "Draw"}</div>
              <button onClick={() => router.push("/")} className="w-full md:w-auto bg-white text-black px-12 py-4 font-black uppercase text-xl hover:bg-yellow-400 transition-colors border-4 border-white">Lobby</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 border-4 border-black p-5 bg-red-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] order-3 lg:order-3">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 border-b-4 border-black italic pb-2 flex justify-between items-end">
            <span>Enemy</span>
            <span className="text-red-600 text-lg md:text-2xl italic">${oppValue}</span>
          </h2>
          <div className="text-sm md:text-lg font-black uppercase text-black mb-4 tracking-tighter text-right">Players Selected: {oppTeam.length}/5</div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-14 border-2 flex items-center justify-between px-3 font-black text-base md:text-lg uppercase italic transition-all ${oppTeam[i] ? "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent border-dashed border-gray-300 text-gray-300"}`}>
                {oppTeam[i] ? <><span className="truncate">{oppTeam[i].name}</span><span>${oppTeam[i].cost}</span></> : <span>Slot {i+1}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}