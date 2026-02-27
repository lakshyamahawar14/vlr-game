import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

const DEFAULT_POOL = {
  pool: {
    30: ["aspas", "TenZ", "ZywOo", "Chronicle", "Leo", "Sacy"],
    25: ["Derke", "cned", "Alfajer", "Less", "Yay", "Cryocells"],
    20: ["Boaster", "Saadhak", "FNS", "MaKo", "p0ceit", "Zellsis"],
    15: ["Mazino", "Klaus", "BuZz", "stax", "Scary", "Ardiis"],
    10: ["Rb", "Zest", "Benkai", "Foxy9", "Nats", "Redgar"]
  },
  rawStats: {
    "aspas": 1.35, "tenz": 1.28, "zywoo": 1.30, "chronicle": 1.25, "leo": 1.24, "sacy": 1.22,
    "derke": 1.20, "cned": 1.19, "alfajer": 1.18, "less": 1.17, "yay": 1.16, "cryocells": 1.15,
    "boaster": 1.12, "saadhak": 1.10, "fns": 1.08, "mako": 1.11, "p0ceit": 1.09, "zellsis": 1.07,
    "mazino": 1.05, "klaus": 1.03, "buzz": 1.04, "stax": 1.02, "scary": 1.01, "ardiis": 1.00,
    "rb": 0.98, "zest": 0.96, "benkai": 0.95, "foxy9": 0.94, "nats": 0.99, "redgar": 0.92
  }
};

export async function GET() {
  try {
    const { data: allPlayers, error } = await supabase
      .from("master_players")
      .select("name, rating")
      .order("rating", { ascending: false });

    if (error || !allPlayers || allPlayers.length < 10) {
      throw new Error("DB_ERROR");
    }

    const getSample = (start: number, count: number) => {
      return allPlayers
        .slice(start, start + 25)
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
        .map(p => p.name);
    };

    const pool = {
      30: getSample(0, 3),
      25: getSample(25, 3),
      20: getSample(50, 3),
      15: getSample(75, 3),
      10: getSample(100, 3)
    };

    const rawStats = allPlayers.reduce((acc, p) => {
      acc[p.name.toLowerCase()] = p.rating;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ pool, rawStats });

  } catch (err) {
    const shuffledPool = {
      30: [...DEFAULT_POOL.pool[30]].sort(() => 0.5 - Math.random()).slice(0, 3),
      25: [...DEFAULT_POOL.pool[25]].sort(() => 0.5 - Math.random()).slice(0, 3),
      20: [...DEFAULT_POOL.pool[20]].sort(() => 0.5 - Math.random()).slice(0, 3),
      15: [...DEFAULT_POOL.pool[15]].sort(() => 0.5 - Math.random()).slice(0, 3),
      10: [...DEFAULT_POOL.pool[10]].sort(() => 0.5 - Math.random()).slice(0, 3)
    };

    return NextResponse.json({ pool: shuffledPool, rawStats: DEFAULT_POOL.rawStats });
  }
}