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
  const [team, setTeam] = useState<Player[]>([]);
  const [oppTeam, setOppTeam] = useState<Player[]>([]);
  const [budget, setBudget] = useState(100);
  const [timer, setTimer] = useState(30);
  const [status, setStatus] = useState<string | null>(null);
  const [role, setRole] = useState<"p1" | "p2" | null>(null);
  const [isOpponentOnline, setIsOpponentOnline] = useState(true);

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
      const { data } = await supabase.from("room").select("*").eq("id", roomId).single();
      if (data) syncStates(data);
      else setIsLoading(false);
    };
    fetchInitial();

    const channel = supabase.channel(`room_${roomId}`, { config: { presence: { key: myId } } });
    channel
      .on("presence", { event: "sync" }, () => {
        setIsOpponentOnline(Object.keys(channel.presenceState()).length > 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "room" }, (payload) => {
        syncStates(payload.new);
      })
      .subscribe(async (s) => {
        if (s === "SUBSCRIBED") await channel.track({ online_at: new Date().toISOString() });
      });

    const interval = setInterval(() => {
      if (status !== "DRAFTING") {
        clearInterval(interval);
        return;
      }
      setTimer((p) => {
        if (p <= 1) {
          supabase.from("room").update({ status: "ENDED" }).eq("id", roomId).select().then(({ data }) => {
             if(data?.[0]) syncStates(data[0]);
          });
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => { clearInterval(interval); supabase.removeChannel(channel); };
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

  if (!isMounted || isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-mono">
      <div className="text-2xl font-black animate-pulse uppercase tracking-tighter italic">Initializing Arena...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-4 max-w-7xl mx-auto font-mono text-black selection:bg-black selection:text-white">
      <style>{`
        @keyframes timer-strobe {
          0%, 100% { background-color: #dc2626; color: white; transform: scale(1); }
          50% { background-color: #fff; color: #dc2626; transform: scale(1.05); }
        }
        .animate-strobe { animation: timer-strobe 0.5s step-end infinite; }
      `}</style>

      {!isOpponentOnline && status === "DRAFTING" && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-yellow-400 border-[10px] border-black p-10 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full">
            <h2 className="text-5xl font-black italic mb-6 uppercase tracking-tighter">Opponent Left</h2>
            <button onClick={() => router.push("/")} className="w-full bg-black text-white py-5 font-black uppercase text-xl hover:bg-white hover:text-black border-4 border-black transition-all">Back to Lobby</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 border-4 border-black p-6 mb-8 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] items-center">
        <div className="text-left">
          <p className="text-xs font-black text-gray-400 uppercase italic tracking-widest">Budget</p>
          <p className="text-6xl font-black">${budget}</p>
        </div>
        <div className="flex justify-center">
          <div className={`text-7xl font-black italic px-12 py-4 border-[6px] border-black transition-all flex items-center justify-center min-w-[220px]
            ${timer <= 10 && status === "DRAFTING" ? 'animate-strobe' : 'bg-black text-white'}`}>
            {timer}S
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-gray-400 uppercase italic tracking-widest">Slots</p>
          <p className="text-6xl font-black">{team.length}/5</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-1 border-4 border-black p-5 bg-blue-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black italic pb-2 flex justify-between items-end">
            <span>You</span>
            <span className="text-blue-600 text-sm italic">${myValue}</span>
          </h2>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-12 border-2 flex items-center justify-between px-3 font-black text-sm uppercase italic transition-all
                ${team[i] ? "bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent border-dashed border-gray-300 text-gray-300 shadow-none"}`}>
                {team[i] ? (
                  <><span>{team[i].name}</span><span>${team[i].cost}</span></>
                ) : (
                  <span>Empty Slot</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          {status === "DRAFTING" ? (
            <div className="grid grid-cols-2 gap-5">
              {Object.entries(CATEGORIES).sort((a, b) => Number(b[0]) - Number(a[0])).map(([cost, players]) => (
                <div key={cost} className="border-4 border-black p-3 bg-white">
                  <div className="bg-black text-white text-center mb-4 font-black italic uppercase py-1 text-lg">${cost}</div>
                  <div className="space-y-2">
                    {players.map((p) => {
                      const isPicked = team.some(tp => tp.name === p);
                      return (
                        <button key={p} onClick={() => handlePick(p, parseInt(cost))} disabled={budget < parseInt(cost) || team.length >= 5 || isPicked}
                          className={`w-full text-left p-3 font-black text-xs border-2 uppercase transition-all
                            ${isPicked ? 'bg-green-400 border-black cursor-default translate-x-1 translate-y-1' : 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:bg-gray-100'}`}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black text-white p-16 text-center border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-7xl font-black italic mb-2 uppercase tracking-tighter underline decoration-yellow-400 decoration-8 underline-offset-8">Draft Result</h2>
              <div className="flex justify-center gap-12 my-10 border-y border-white/20 py-8">
                <div><p className="text-gray-400 font-bold uppercase text-xs mb-1">Your Score</p><p className="text-6xl font-black">${myValue}</p></div>
                <div className="text-5xl font-black self-center text-gray-500 italic">VS</div>
                <div><p className="text-gray-400 font-bold uppercase text-xs mb-1">Enemy Score</p><p className="text-6xl font-black">${oppValue}</p></div>
              </div>
              <div className="text-5xl font-black mb-10 uppercase italic tracking-widest">
                {myValue > oppValue ? "Victory" : myValue < oppValue ? "Defeat" : "Draw"}
              </div>
              <button onClick={() => router.push("/")} className="bg-white text-black px-12 py-4 font-black uppercase text-xl hover:bg-yellow-400 transition-colors border-4 border-white">Lobby</button>
            </div>
          )}
        </div>

        <div className="col-span-1 border-4 border-black p-5 bg-red-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black italic pb-2 flex justify-between items-end">
            <span>Enemy</span>
            <span className="text-red-600 text-sm italic">${oppValue}</span>
          </h2>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-12 border-2 flex items-center justify-between px-3 font-black text-sm uppercase italic transition-all
                ${oppTeam[i] ? "bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] opacity-90" : "bg-transparent border-dashed border-gray-300 text-gray-300 shadow-none"}`}>
                {oppTeam[i] ? (
                  <><span>{oppTeam[i].name}</span><span>${oppTeam[i].cost}</span></>
                ) : (
                  <span>Waiting...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}