"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "src/components/ui/Button";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { LeaderboardTable } from "./components/LeaderboardTable";

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  
  const { data, loading, hasMore } = useLeaderboard(page);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    router.push(`/leaderboard?page=${newPage}`);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-black p-4 md:p-8 font-sans overflow-x-hidden relative">
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" 
           style={{ 
             backgroundImage: `
               linear-gradient(to right, #4f46e5 1px, transparent 1px),
               linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
             `, 
             backgroundSize: '32px 32px' 
           }} 
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b-4 border-black pb-4">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
            LEADER<span className="text-indigo-600">BOARD</span>
          </h1>
          <Link href="/">
            <Button className="!bg-indigo-600 hover:!bg-indigo-500 !text-white border-2 !border-black italic font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 px-6 py-2 text-sm transition-colors">
              Back to Lobby
            </Button>
          </Link>
        </div>

        <LeaderboardTable data={data} loading={loading} />

        <div className="flex justify-between items-center mt-8">
          <div className="hidden md:flex gap-2">
            <div className="w-2 h-8 bg-black" />
            <div className="w-1 h-8 bg-black/20" />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-center">
            <Button 
              className="!bg-black !text-white border-2 !border-black disabled:opacity-30 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
            >
              PREV
            </Button>
            
            <div className="bg-white px-6 py-1.5 border-2 border-black text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              PAGE <span className="text-indigo-600">{page}</span>
            </div>

            <Button 
              className="!bg-black !text-white border-2 !border-black disabled:opacity-30 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasMore || loading}
            >
              NEXT
            </Button>
          </div>

          <div className="hidden md:flex gap-2">
            <div className="w-1 h-8 bg-black/20" />
            <div className="w-2 h-8 bg-black" />
          </div>
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