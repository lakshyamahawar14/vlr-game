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
    "aspas": 1, "tenz": 1, "zywoo": 1, "chronicle": 1, "leo": 1, "sacy": 1,
    "derke": 1, "cned": 1, "alfajer": 1, "less": 1, "yay": 1, "cryocells": 1,
    "boaster": 1, "saadhak": 1, "fns": 1, "mako": 1, "p0ceit": 1, "zellsis": 1,
    "mazino": 1, "klaus": 1, "buzz": 1, "stax": 1, "scary": 1, "ardiis": 1,
    "rb": 1, "zest": 1, "benkai": 1, "foxy9": 1, "nats": 1, "redgar": 1
  }
};

export async function GET() {
  try {
    const { data: allPlayers, error } = await supabase
      .from("master_players")
      .select("name, rating");

    if (error || !allPlayers || allPlayers.length < 15) {
      throw new Error("DB_ERROR");
    }

    const getRandomThree = (arr: any[]) => {
      return [...arr]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(p => p.name);
    };

    const pool = {
      30: getRandomThree(allPlayers),
      25: getRandomThree(allPlayers),
      20: getRandomThree(allPlayers),
      15: getRandomThree(allPlayers),
      10: getRandomThree(allPlayers)
    };

    const rawStats = allPlayers.reduce((acc, p) => {
      acc[p.name.toLowerCase()] = p.rating;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ pool, rawStats });

  } catch (err) {
    const fallbackRandom = (key: keyof typeof DEFAULT_POOL.pool) => {
      return [...DEFAULT_POOL.pool[key]]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    };

    const shuffledPool = {
      30: fallbackRandom(30),
      25: fallbackRandom(25),
      20: fallbackRandom(20),
      15: fallbackRandom(15),
      10: fallbackRandom(10)
    };

    return NextResponse.json({ 
      pool: shuffledPool, 
      rawStats: DEFAULT_POOL.rawStats 
    });
  }
}