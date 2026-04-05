"use client";

// ─── Cricket Inline Feed Widget ───────────────────────────────────────────────
// A lightweight inline card variant of the cricket score — NOT the floating
// overlay. Separate entry point so next/dynamic splits it into its own chunk.
// Timers are paused when the card scrolls off-screen (IntersectionObserver)
// to prevent running two setInterval instances alongside the global widget.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";

interface MatchState {
  battingTeam: string;
  runs:        number;
  wickets:     number;
  balls:       number;
  maxOvers:    number;
  batter:      string;
  batterRuns:  number;
  batterBalls: number;
  bowler:      string;
}

const INITIAL: MatchState = {
  battingTeam: "IND",
  runs:        178,
  wickets:     4,
  balls:       110,
  maxOvers:    20,
  batter:      "Kohli",
  batterRuns:  74,
  batterBalls: 48,
  bowler:      "Bumrah",
};

const BATTERS = ["Kohli", "Rohit", "Gill", "Pant", "Hardik", "Jadeja", "SKY"];
const BOWLERS = ["Bumrah", "Cummins", "Hazlewood", "Starc", "Zampa", "Maxwell"];

function nextDelivery() {
  const r = Math.random();
  if (r < 0.04) return { runs: 0, isWicket: true  };
  if (r < 0.30) return { runs: 0, isWicket: false };
  if (r < 0.55) return { runs: 1, isWicket: false };
  if (r < 0.68) return { runs: 2, isWicket: false };
  if (r < 0.86) return { runs: 4, isWicket: false };
  return              { runs: 6, isWicket: false };
}

function toOvers(balls: number) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

export default function CricketInline() {
  const [match,   setMatch]   = useState<MatchState>(INITIAL);
  const [mounted, setMounted] = useState(false);
  const cardRef    = useRef<HTMLDivElement>(null);
  const tickRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  // Pause timers when card is off-screen — prevents double-timer with global widget
  useEffect(() => {
    if (!mounted) return;
    const card = cardRef.current;
    if (!card) return;

    const obs = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry?.isIntersecting ?? false; },
      { threshold: 0 },
    );
    obs.observe(card);
    return () => obs.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    function schedule() {
      tickRef.current = setTimeout(tick, 5_000 + Math.random() * 3_000);
    }
    function tick() {
      if (!visibleRef.current) { schedule(); return; } // paused off-screen
      setMatch((prev) => {
        if (prev.balls >= prev.maxOvers * 6 || prev.wickets >= 10) return prev;
        const d = nextDelivery();
        return {
          ...prev,
          runs:        prev.runs + d.runs,
          wickets:     prev.wickets + (d.isWicket ? 1 : 0),
          balls:       prev.balls + 1,
          batter:      d.isWicket ? BATTERS[Math.floor(Math.random() * BATTERS.length)]! : prev.batter,
          batterRuns:  d.isWicket ? 0 : prev.batterRuns + d.runs,
          batterBalls: d.isWicket ? 0 : prev.batterBalls + 1,
          bowler:      (prev.balls + 1) % 6 === 0
            ? BOWLERS[Math.floor(Math.random() * BOWLERS.length)]!
            : prev.bowler,
        };
      });
      schedule();
    }
    schedule();
    return () => { if (tickRef.current) clearTimeout(tickRef.current); };
  }, [mounted]);

  if (!mounted) return null;

  const isFinished = match.balls >= match.maxOvers * 6 || match.wickets >= 10;

  return (
    <div
      ref={cardRef}
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2.5">
          <div className="flex items-center gap-2">
            {!isFinished ? (
              <span className="flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white">
                <Radio className="size-2.5 animate-pulse" /> LIVE
              </span>
            ) : (
              <span className="rounded bg-neutral-700 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-neutral-300">
                FINAL
              </span>
            )}
            <span className="font-mono text-xs font-bold text-white">
              IND vs AUS · T20 World Cup Final
            </span>
          </div>
          <Link
            href="/live"
            className="text-[10px] font-semibold text-red-400 hover:text-red-300"
          >
            Full Scorecard →
          </Link>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-mono text-2xl font-black text-white">
              {match.runs}/{match.wickets}
            </p>
            <p className="font-mono text-[11px] text-neutral-400">
              {toOvers(match.balls)}/{match.maxOvers} ov
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-neutral-300">
              🏏 {match.batter}{" "}
              <span className="font-bold text-white">{match.batterRuns}*</span>
              <span className="text-neutral-500"> ({match.batterBalls})</span>
            </p>
            <p className="font-mono text-[11px] text-neutral-400">
              ⚡ {match.bowler} bowling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
