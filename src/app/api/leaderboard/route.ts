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

    const leaderboard = data.map((player, index) => {
      const wins = Number(player.wins) || 0;
      const loses = Number(player.loses) || 0;
      const draws = Number(player.draws) || 0;
      const avgScore = Number(player.avgScore) || 0;
      const winRate = Number(player.winRate) || 0;
      
      return {
        rank: rangeStart + index + 1,
        userId: player.userId,
        username: player.username || "Unknown Player",
        matches: wins + loses + draws,
        wins: wins,
        loses: loses,
        draws: draws,
        avgScore: avgScore,
        winRate: winRate
      };
    });

    return NextResponse.json(leaderboard);

  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}