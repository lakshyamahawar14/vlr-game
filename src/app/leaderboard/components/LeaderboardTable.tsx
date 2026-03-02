import React from "react";

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

interface Props {
  data: LeaderboardEntry[];
  localUserId: string | null;
  loading: boolean;
}

export function LeaderboardTable({ data, localUserId, loading }: Props) {
  return (
    <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative min-h-[500px]">
      <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="sticky top-0 z-20">
            <tr className="bg-black text-white text-[10px] md:text-xs uppercase font-black">
              <th className="px-4 py-3 min-w-[70px] text-center border-r border-white/20">Rank</th>
              <th className="px-4 py-3 min-w-[110px] border-r border-white/20">USER ID</th>
              <th className="px-4 py-3 min-w-[200px] border-r border-white/20">Player</th>
              <th className="px-4 py-3 min-w-[100px] text-center border-r border-white/20">Matches</th>
              <th className="px-4 py-3 min-w-[120px] text-center border-r border-white/20">W-L-D</th>
              <th className="px-4 py-3 min-w-[100px] text-center border-r border-white/20">Avg R</th>
              <th className="px-4 py-3 min-w-[100px] text-right">Winrate</th>
            </tr>
          </thead>
          <tbody className="text-xs md:text-sm font-bold uppercase">
            {data.map((player) => {
              const isMe = player.userId === localUserId;
              return (
                <tr 
                  key={player.userId} 
                  className={`border-b-2 border-black/10 transition-colors ${
                    isMe ? "bg-indigo-50" : "bg-white hover:bg-neutral-50"
                  }`}
                >
                  <td className={`px-4 py-3 text-center border-r-2 border-black/5 font-black ${player.rank <= 3 ? "text-indigo-600" : ""}`}>
                    {player.rank}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] border-r-2 border-black/5 text-neutral-400 tracking-wider">
                    {player.userId?.slice(0, 8)}
                  </td>
                  <td className={`px-4 py-3 truncate border-r-2 border-black/5 ${isMe ? "text-indigo-600" : ""}`}>
                    {player.username} {isMe && <span className="text-[9px] bg-indigo-600 text-white px-1 ml-1 font-black">YOU</span>}
                  </td>
                  <td className="px-4 py-3 text-center border-r-2 border-black/5 text-neutral-500">
                    {player.matches}
                  </td>
                  <td className="px-4 py-3 text-center border-r-2 border-black/5 whitespace-nowrap tabular-nums">
                    <span className="text-green-600">{player.wins}</span>
                    <span className="text-neutral-300 mx-0.5">-</span>
                    <span className="text-red-600">{player.loses}</span>
                    <span className="text-neutral-300 mx-0.5">-</span>
                    <span>{player.draws}</span>
                  </td>
                  <td className="px-4 py-3 text-center border-r-2 border-black/5 font-black">
                    {player.avgScore.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-black">
                    {player.winRate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <div className="bg-black text-white px-8 py-6 border-4 border-black flex flex-col items-center gap-4 shadow-[10px_10px_0px_0px_rgba(79,70,229,1)]">
            <div className="w-10 h-10 border-4 border-white/20 border-t-indigo-400 animate-spin" />
            <p className="text-sm font-black uppercase tracking-[0.2em]">Fetching Leaderboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}