"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  matches: number;
  wins: number;
  loses: number;
  winRate: number;
}

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_LIMIT = 25;

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setData([]); 
      try {
        const res = await fetch(`/api/leaderboard?page=${page}`);
        const json = await res.json();
        
        if (Array.isArray(json)) {
          setData(json);
          setHasMore(json.length === PAGE_LIMIT);
        }
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    router.push(`/leaderboard?page=${newPage}`);
  };

  return (
    <div className="min-h-screen text-black p-4 md:p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="bg-black text-white p-3 border-4 border-black">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">
              LEADERBOARD
            </h1>
          </div>
          <Link 
            href="/" 
            className="bg-[#FF3E3E] text-white px-4 py-2 text-xs font-black uppercase border-4 border-black hover:bg-[#CC0000] transition-colors"
          >
            Back to Lobby
          </Link>
        </div>

        <div className="bg-white border-4 border-black overflow-hidden max-h-[70vh] overflow-y-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#A3E635] border-b-4 border-black text-[10px] md:text-xs uppercase font-black">
                <th className="px-3 py-2 w-[50px] text-center border-r-4 border-black">#</th>
                <th className="px-3 py-2 w-[100px] border-r-4 border-black">UID</th>
                <th className="px-3 py-2 border-r-4 border-black">Player</th>
                <th className="px-3 py-2 w-[130px] text-center border-r-4 border-black">Total Matches</th>
                <th className="px-3 py-2 w-[80px] text-center border-r-4 border-black">W-L</th>
                <th className="px-3 py-2 w-[90px] text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm font-bold">
              {!loading && data.map((player) => (
                <tr key={player.userId} className="border-b-2 border-black hover:bg-[#FDE047] transition-colors">
                  <td className="px-3 py-1.5 text-center border-r-4 border-black italic">
                    {player.rank}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-[9px] border-r-4 border-black text-gray-600">
                    {player.userId?.slice(0, 8)}
                  </td>
                  <td className="px-3 py-1.5 uppercase truncate border-r-4 border-black">
                    {player.username}
                  </td>
                  <td className="px-3 py-1.5 text-center border-r-4 border-black">
                    {player.matches}
                  </td>
                  <td className="px-3 py-1.5 text-center border-r-4 border-black whitespace-nowrap">
                    {player.wins}-{player.loses}
                  </td>
                  <td className="px-3 py-1.5 text-right font-black text-blue-600">
                    {player.winRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="flex items-center justify-center py-20 bg-white">
               <div className="text-sm font-black uppercase border-4 border-black p-3 bg-yellow-300">
                 Syncing...
               </div>
            </div>
          )}

          {!loading && data.length === 0 && (
            <div className="text-center py-12 bg-white">
              <p className="text-xs font-black uppercase border-4 border-black inline-block p-2">No entries</p>
            </div>
          )}
        </div>

        <div className="flex justify-center items-center mt-6 gap-3">
          <button 
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="px-4 py-2 bg-[#60A5FA] border-4 border-black text-[10px] font-black uppercase disabled:opacity-30 hover:bg-[#3B82F6] transition-colors"
          >
            Prev
          </button>
          
          <div className="bg-black text-white px-4 py-2 border-4 border-black text-[10px] font-black uppercase">
            Page {page}
          </div>

          <button 
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasMore || loading}
            className="px-4 py-2 bg-[#60A5FA] border-4 border-black text-[10px] font-black uppercase disabled:opacity-30 hover:bg-[#3B82F6] transition-colors"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={null}>
      <LeaderboardContent />
    </Suspense>
  );
}