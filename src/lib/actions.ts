"use server";

import { supabase } from "./supabase";

export type PingResponse = {
  myPing: number;
  oppPing: number;
} | null;

export async function updateMyPing(roomId: string, userId: string): Promise<PingResponse> {
  const start = Date.now();
  try {
    const { data: room, error: fetchError } = await supabase
      .from("room")
      .select("p1_id, p2_id, p1_ping, p2_ping")
      .eq("id", roomId)
      .single();

    if (fetchError || !room) {
      console.log("Room not found or error:", fetchError?.message);
      return null;
    }

    const latency = Date.now() - start;
    const isP1 = userId === room.p1_id;
    const updateColumn = isP1 ? "p1_ping" : "p2_ping";

    const { error: updateError } = await supabase
      .from("room")
      .update({ [updateColumn]: latency })
      .eq("id", roomId);

    if (updateError) {
      console.error("Update failed:", updateError.message);
      return null;
    }

    return {
      myPing: latency,
      oppPing: isP1 ? (room.p2_ping || 0) : (room.p1_ping || 0)
    };
  } catch (e) {
    console.error("Ping update exception:", e);
    return null;
  }
}