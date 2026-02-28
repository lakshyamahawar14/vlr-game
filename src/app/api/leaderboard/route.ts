import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 25;
    const rangeStart = (page - 1) * limit;
    const rangeEnd = rangeStart + limit - 1;

    const { data, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .range(rangeStart, rangeEnd);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || !Array.isArray(data)) {
      return NextResponse.json([]);
    }

    const leaderboard = data.map((player, index) => ({
      rank: rangeStart + index + 1,
      userId: player.userId,
      username: player.username || "Unknown Player",
      matches: player.matches || 0,
      wins: player.wins || 0,
      loses: player.loses || 0,
      winRate: player.winRate || 0
    }));

    return NextResponse.json(leaderboard);

  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}