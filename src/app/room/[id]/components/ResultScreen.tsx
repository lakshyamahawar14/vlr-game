"use client";

import Link from "next/link";
import { useMemo } from "react";

type Player = { name: string; cost: number };

interface Props {
  myName: string;
  oppName: string;
  myTeam: Player[];
  oppTeam: Player[];
  rawStats: Record<string, number>;
}

export default function ResultScreen({
  myName,
  oppName,
  myTeam,
  oppTeam,
  rawStats,
}: Props) {
  const myTotal = useMemo(
    () =>
      myTeam.reduce(
        (acc, p) => acc + (rawStats[p.name.toLowerCase()] || 0),
        0
      ),
    [myTeam, rawStats]
  );

  const oppTotal = useMemo(
    () =>
      oppTeam.reduce(
        (acc, p) => acc + (rawStats[p.name.toLowerCase()] || 0),
        0
      ),
    [oppTeam, rawStats]
  );

  const iWon = myTotal > oppTotal;
  const oppWon = oppTotal > myTotal;

  const winnerName = useMemo(() => {
    if (iWon) return myName;
    if (oppWon) return oppName;
    return "DRAW";
  }, [iWon, oppWon, myName, oppName]);

  return (
    <div className="w-full bg-white border-[4px] border-black font-mono flex flex-col">
      <div
        className={`border-b-[4px] border-black p-3 flex flex-col items-center justify-center text-black ${
          iWon ? "bg-[#22C55E]" : oppWon ? "bg-red-500" : "bg-yellow-400"
        }`}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-0.5 opacity-90">
          Winner
        </p>
        <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">
          {winnerName}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row divide-y-[4px] md:divide-y-0 md:divide-x-[4px] divide-black">
        <div
          className={`flex-1 p-4 md:p-6 ${
            iWon
              ? "bg-emerald-50/50"
              : oppWon
              ? "bg-red-50/50"
              : "bg-gray-50/50"
          }`}
        >
          <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2">
            <h2 className="text-lg font-black uppercase tracking-tighter">
              {myName}'S ROSTER
            </h2>
            <div className="text-right">
              <span
                className={`text-[10px] block font-black ${
                  iWon
                    ? "text-emerald-600"
                    : oppWon
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                TOTAL RATING
              </span>
              <span
                className={`text-3xl font-black italic leading-none ${
                  iWon
                    ? "text-emerald-600"
                    : oppWon
                    ? "text-red-600"
                    : "text-black"
                }`}
              >
                {myTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {myTeam.map((p) => (
              <div
                key={p.name}
                className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="text-sm font-black uppercase">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 leading-none">
                    ${p.cost}
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 border-2 border-black ${
                      iWon
                        ? "bg-emerald-500 text-white"
                        : oppWon
                        ? "bg-red-500 text-white"
                        : "bg-black text-white"
                    }`}
                  >
                    R {(rawStats[p.name.toLowerCase()] || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`flex-1 p-4 md:p-6 ${
            oppWon
              ? "bg-emerald-50/50"
              : iWon
              ? "bg-red-50/50"
              : "bg-gray-50/50"
          }`}
        >
          <div className="flex justify-between items-center mb-4 border-b-2 border-black/10 pb-2">
            <h2 className="text-lg font-black uppercase tracking-tighter">
              {oppName}'S ROSTER
            </h2>
            <div className="text-right">
              <span
                className={`text-[10px] block font-black ${
                  oppWon
                    ? "text-emerald-600"
                    : iWon
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                TOTAL RATING
              </span>
              <span
                className={`text-3xl font-black italic leading-none ${
                  oppWon
                    ? "text-emerald-600"
                    : iWon
                    ? "text-red-600"
                    : "text-black"
                }`}
              >
                {oppTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {oppTeam.map((p) => (
              <div
                key={p.name}
                className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="text-sm font-black uppercase">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 leading-none">
                    ${p.cost}
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 border-2 border-black ${
                      oppWon
                        ? "bg-emerald-500 text-white"
                        : iWon
                        ? "bg-red-500 text-white"
                        : "bg-black text-white"
                    }`}
                  >
                    R {(rawStats[p.name.toLowerCase()] || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t-[4px] border-black bg-white flex justify-center">
        <Link
          href="/"
          className="w-full max-w-[200px] py-3 text-sm font-black uppercase border-4 border-black bg-yellow-400 text-black hover:bg-yellow-500 text-center outline-none select-none"
        >
          Return to Lobby
        </Link>
      </div>
    </div>
  );
}