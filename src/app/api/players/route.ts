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

    const shuffled = [...allPlayers].sort(() => 0.5 - Math.random());

    const pool = {
      30: shuffled.slice(0, 3).map(p => p.name),
      25: shuffled.slice(3, 6).map(p => p.name),
      20: shuffled.slice(6, 9).map(p => p.name),
      15: shuffled.slice(9, 12).map(p => p.name),
      10: shuffled.slice(12, 15).map(p => p.name)
    };

    const rawStats = allPlayers.reduce((acc, p) => {
      acc[p.name.toLowerCase()] = p.rating;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ pool, rawStats });

  } catch (err) {
    const getUniqueFallback = () => {
      const allNames = Object.values(DEFAULT_POOL.pool).flat();
      const shuffledNames = [...allNames].sort(() => 0.5 - Math.random());
      
      return {
        30: shuffledNames.slice(0, 3),
        25: shuffledNames.slice(3, 6),
        20: shuffledNames.slice(6, 9),
        15: shuffledNames.slice(9, 12),
        10: shuffledNames.slice(12, 15)
      };
    };

    return NextResponse.json({ 
      pool: getUniqueFallback(), 
      rawStats: DEFAULT_POOL.rawStats 
    });
  }
}