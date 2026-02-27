import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); 

  try {
    const response = await fetch("https://www.vlr.gg/stats/?event_group_id=all&timespan=60d", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("BLOCKED");

    const html = await response.text();
    const $ = cheerio.load(html);
    const allPlayers: { name: string; rating: number }[] = [];

    $(".wf-table tbody tr").each((_, el) => {
      const name = $(el).find("div.text-of").first().text().trim();
      const rating = parseFloat($(el).find("td.mod-color-sq").first().text().trim());
      if (name && !isNaN(rating)) allPlayers.push({ name, rating });
    });

    if (allPlayers.length < 50) throw new Error("PARSING_ERR");

    const getSample = (start: number, count: number) => {
      return allPlayers.slice(start, start + 20).sort(() => 0.5 - Math.random()).slice(0, count).map(p => p.name);
    };

    const pool = {
      30: getSample(0, 3),
      25: getSample(20, 3),
      20: getSample(40, 3),
      15: getSample(60, 3),
      10: getSample(80, 3)
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