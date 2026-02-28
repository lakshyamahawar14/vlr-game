import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const DEFAULT_POOL = {
  pool: [
    { cost: 30, players: ["aspas", "TenZ", "ZywOo", "Chronicle", "Leo", "Sacy"] },
    { cost: 25, players: ["Derke", "cned", "Alfajer", "Less", "Yay", "Cryocells"] },
    { cost: 20, players: ["Boaster", "Saadhak", "FNS", "MaKo", "p0ceit", "Zellsis"] },
    { cost: 15, players: ["Mazino", "Klaus", "BuZz", "stax", "Scary", "Ardiis"] },
    { cost: 10, players: ["Rb", "Zest", "Benkai", "Foxy9", "Nats", "Redgar"] }
  ],
  rawStats: {
    aspas: 1, tenz: 1, zywoo: 1, chronicle: 1, leo: 1, sacy: 1,
    derke: 1, cned: 1, alfajer: 1, less: 1, yay: 1, cryocells: 1,
    boaster: 1, saadhak: 1, fns: 1, mako: 1, p0ceit: 1, zellsis: 1,
    mazino: 1, klaus: 1, buzz: 1, stax: 1, scary: 1, ardiis: 1,
    rb: 1, zest: 1, benkai: 1, foxy9: 1, nats: 1, redgar: 1
  }
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET() {
  try {
    const { data: allPlayers, error } = await supabase
      .from("master_players")
      .select("name, rating");

    if (error || !allPlayers || allPlayers.length < 15) {
      throw new Error("DB_ERROR");
    }

    const shuffledPlayers = shuffle(allPlayers);

    const pool = shuffle([
      { cost: 30, players: shuffledPlayers.slice(0, 3).map(p => p.name) },
      { cost: 25, players: shuffledPlayers.slice(3, 6).map(p => p.name) },
      { cost: 20, players: shuffledPlayers.slice(6, 9).map(p => p.name) },
      { cost: 15, players: shuffledPlayers.slice(9, 12).map(p => p.name) },
      { cost: 10, players: shuffledPlayers.slice(12, 15).map(p => p.name) }
    ]);

    const rawStats = allPlayers.reduce((acc, p) => {
      acc[p.name.toLowerCase()] = p.rating;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ pool, rawStats });
  } catch {
    return NextResponse.json({
      pool: shuffle(DEFAULT_POOL.pool),
      rawStats: DEFAULT_POOL.rawStats
    });
  }
}