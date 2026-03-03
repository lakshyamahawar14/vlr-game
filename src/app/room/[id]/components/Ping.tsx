"use client";

import { useEffect, useState } from "react";
import { updateMyPing } from "@/lib/actions";
import { supabase } from "@/lib/supabase";

interface Props {
  roomId: string;
  userId: string;
  isOpponent: boolean;
}

export default function Ping({ roomId, userId, isOpponent }: Props) {
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    if (isOpponent) {
      const channel = supabase
        .channel(`room_ping_${roomId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "room", filter: `id=eq.${roomId}` },
          (payload: any) => {
            const room = payload.new;
            const oppPing = userId === room.p1_id ? room.p2_ping : room.p1_ping;
            setLatency(oppPing);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } else {
      const tick = async () => {
        const result = await updateMyPing(roomId, userId);
        const ms = typeof result === 'object' && result !== null ? result.myPing : result;
        setLatency(ms);
      };
      tick();
      const interval = setInterval(tick, 3000);
      return () => clearInterval(interval);
    }
  }, [roomId, userId, isOpponent]);

  const getStatusColor = () => {
    if (!latency || latency === 0) return "text-neutral-500";
    if (latency < 100) return "text-green-400";
    if (latency < 250) return "text-yellow-400";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-black rounded-sm border border-white/10 shadow-sm self-start">
      <div className={`flex items-baseline gap-0.5 font-black tabular-nums tracking-tighter leading-none ${getStatusColor()}`}>
        <span className="text-[18px]">
          {latency && latency > 0 ? latency : "-"}
        </span>
        <span className="text-[11px] uppercase opacity-80">
          ms
        </span>
      </div>
    </div>
  );
}