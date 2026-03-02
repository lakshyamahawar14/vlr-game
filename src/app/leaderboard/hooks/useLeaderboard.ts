import { useState, useEffect } from "react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  matches: number;
  wins: number;
  loses: number;
  draws: number;
  avgScore: number;
  winRate: number;
}

export function useLeaderboard(page: number) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const PAGE_LIMIT = 25;

  useEffect(() => {
    const storedId = localStorage.getItem("vlr_duel_id");
    if (storedId) setLocalUserId(storedId);
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?page=${page}`);
        const json = await res.json();
        
        if (Array.isArray(json)) {
          setData(json);
          setHasMore(json.length === PAGE_LIMIT);
        } else {
          setData([]);
          setHasMore(false);
        }
      } catch (err) {
        setData([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [page]);

  return { data, loading, hasMore, localUserId };
}