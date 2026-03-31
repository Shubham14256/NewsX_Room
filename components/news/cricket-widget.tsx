"use client";

import { useEffect, useRef, useState } from "react";
import { unstable_catchError as catchError } from "next/error";
import { X, Wifi } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchState {
  team1: string;
  team2: string;
  battingTeam: string;
  runs: number;
  wickets: number;
  balls: number;
  maxOvers: number;
  batter: string;
  batterRuns: number;
  batterBalls: number;
  bowler: string;
  lastEvent: string;
  tournament: string;
}

// ─── Pure helpers (no side-effects, safe to call anywhere) ───────────────────

function toOvers(balls: number): string {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

/** Weighted random delivery — only ever called inside useEffect (client-only) */
function nextDelivery(): { runs: number; label: string; isWicket: boolean } {
  const roll = Math.random();
  if (roll < 0.04) return { runs: 0, label: "W", isWicket: true };
  if (roll < 0.10) return { runs: 0, label: ".", isWicket: false };
  if (roll < 0.30) return { runs: 0, label: "0", isWicket: false };
  if (roll < 0.55) return { runs: 1, label: "1", isWicket: false };
  if (roll < 0.68) return { runs: 2, label: "2", isWicket: false };
  if (roll < 0.72) return { runs: 3, label: "3", isWicket: false };
  if (roll < 0.86) return { runs: 4, label: "4", isWicket: false };
  return               { runs: 6, label: "6", isWicket: false };
}

const BATTERS = ["Kohli", "Rohit", "Gill", "Pant", "Hardik", "Jadeja", "SKY"];
const BOWLERS = ["Bumrah", "Cummins", "Hazlewood", "Starc", "Zampa", "Maxwell"];

// Fully deterministic — safe for SSR, no Math.random() at module scope
const INITIAL: MatchState = {
  team1:       "IND",
  team2:       "AUS",
  battingTeam: "IND",
  runs:        178,
  wickets:     4,
  balls:       110,
  maxOvers:    20,
  batter:      "Kohli",
  batterRuns:  74,
  batterBalls: 48,
  bowler:      "Bumrah",
  lastEvent:   "1",
  tournament:  "T20 World Cup Final",
};

// ─── Inner widget (all dynamic logic lives here) ─────────────────────────────

function CricketWidgetInner() {
  // ── SAFEGUARD 1: mounted guard ──────────────────────────────────────────
  // Server renders null. Client renders the widget only after hydration is
  // complete. This eliminates any possibility of a server/client DOM mismatch
  // from fixed-position overlays or browser-API-dependent rendering.
  const [mounted,   setMounted]   = useState(false);
  const [match,     setMatch]     = useState<MatchState>(INITIAL);
  const [visible,   setVisible]   = useState(true);
  const [flash,     setFlash]     = useState<"boundary" | "six" | "wicket" | null>(null);
  const [expanded,  setExpanded]  = useState(false);

  // Mount gate — runs once, client-only
  useEffect(() => { setMounted(true); }, []);

  // ── SAFEGUARD 2: rigorous timer cleanup ─────────────────────────────────
  // tickTimerRef  — the next scheduled delivery (setTimeout)
  // flashTimerRef — the flash-clear timeout (setTimeout)
  // Both are stored in refs so the cleanup function always has the latest
  // handle, even across re-schedules inside the closure.
  const tickTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't start simulation until mounted and widget is visible
    if (!mounted || !visible) return;

    function clearAllTimers() {
      if (tickTimerRef.current  !== null) { clearTimeout(tickTimerRef.current);  tickTimerRef.current  = null; }
      if (flashTimerRef.current !== null) { clearTimeout(flashTimerRef.current); flashTimerRef.current = null; }
    }

    function scheduleTick() {
      // Random 5–8 s interval to feel organic
      tickTimerRef.current = setTimeout(tick, 5_000 + Math.random() * 3_000);
    }

    function tick() {
      // Compute next state purely — no stale closure risk
      setMatch((prev) => {
        if (prev.balls >= prev.maxOvers * 6 || prev.wickets >= 10) return prev;

        const delivery      = nextDelivery();
        const newBalls      = prev.balls + 1;
        const newRuns       = prev.runs + delivery.runs;
        const newWickets    = prev.wickets + (delivery.isWicket ? 1 : 0);
        const newBowler     = newBalls % 6 === 0
          ? BOWLERS[Math.floor(Math.random() * BOWLERS.length)]!
          : prev.bowler;
        const newBatter     = delivery.isWicket
          ? BATTERS[Math.floor(Math.random() * BATTERS.length)]!
          : prev.batter;

        // Derive flash type from this delivery synchronously inside the updater
        // so we never read stale state from a separate setMatch call
        const flashType: "six" | "boundary" | "wicket" | null =
          delivery.label === "6" ? "six"      :
          delivery.label === "4" ? "boundary" :
          delivery.isWicket      ? "wicket"   : null;

        // Schedule flash clear before setting flash, so the ref is always fresh
        if (flashType) {
          if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
          flashTimerRef.current = setTimeout(() => {
            setFlash(null);
            flashTimerRef.current = null;
          }, 900);
          setFlash(flashType);
        } else {
          setFlash(null);
        }

        return {
          ...prev,
          runs:        newRuns,
          wickets:     newWickets,
          balls:       newBalls,
          bowler:      newBowler,
          batter:      newBatter,
          batterRuns:  delivery.isWicket ? 0 : prev.batterRuns  + delivery.runs,
          batterBalls: delivery.isWicket ? 0 : prev.batterBalls + 1,
          lastEvent:   delivery.label,
        };
      });

      // Re-schedule next tick
      scheduleTick();
    }

    scheduleTick();

    // Cleanup: fires when component unmounts OR when visible/mounted changes.
    // Guarantees zero orphaned timers regardless of how the widget is closed.
    return clearAllTimers;
  }, [mounted, visible]);

  // Server pass and pre-mount: render nothing — no hydration surface at all
  if (!mounted || !visible) return null;

  const isFinished = match.balls >= match.maxOvers * 6 || match.wickets >= 10;

  const flashRing =
    flash === "six"      ? "ring-2 ring-yellow-400/60"  :
    flash === "boundary" ? "ring-2 ring-emerald-400/60" :
    flash === "wicket"   ? "ring-2 ring-red-500/60"     : "";

  const flashScoreColor =
    flash === "six"      ? "text-yellow-400"  :
    flash === "boundary" ? "text-emerald-400" :
    flash === "wicket"   ? "text-red-400"     : "text-white";

  const flashBadgeStyle =
    flash === "six"      ? "bg-yellow-500 text-black"  :
    flash === "boundary" ? "bg-emerald-500 text-black" :
                           "bg-red-600 text-white";

  const lastEventStyle =
    match.lastEvent === "6" ? "bg-yellow-500 text-black"       :
    match.lastEvent === "4" ? "bg-emerald-500 text-black"      :
    match.lastEvent === "W" ? "bg-red-600 text-white"          :
    match.lastEvent === "0" ? "bg-neutral-700 text-neutral-300":
                              "bg-neutral-600 text-white";

  const lastEventLabel =
    match.lastEvent === "6" ? "Maximum! Six runs!"     :
    match.lastEvent === "4" ? "Boundary! Four runs!"   :
    match.lastEvent === "W" ? "Wicket! Batter dismissed!" :
    match.lastEvent === "0" ? "Dot ball"               :
    `${match.lastEvent} run${match.lastEvent !== "1" ? "s" : ""}`;

  return (
    <>
      {/* ── MOBILE: thin bottom strip ───────────────────────────────── */}
      <div
        className={[
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "flex items-center justify-between gap-2 px-3 py-2",
          "border-t border-neutral-700 bg-neutral-900/98 backdrop-blur-md",
          flashRing,
          "transition-all duration-300",
        ].join(" ")}
      >
        <div className="flex min-w-0 items-center gap-2">
          {!isFinished && (
            <span className="flex shrink-0 items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white">
              <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
              LIVE
            </span>
          )}
          <span className="font-mono text-xs font-bold text-white">
            {match.battingTeam} {match.runs}/{match.wickets}
          </span>
          <span className="text-[10px] text-neutral-400">
            ({toOvers(match.balls)} ov)
          </span>
          {flash && (
            <span className={["rounded px-1 py-0.5 font-mono text-[10px] font-black", flashBadgeStyle].join(" ")}>
              {flash === "six" ? "SIX!" : flash === "boundary" ? "FOUR!" : "OUT!"}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[10px] text-neutral-300">
            {match.batter} {match.batterRuns}*({match.batterBalls})
          </span>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss cricket widget"
            className="rounded p-0.5 text-neutral-500 hover:text-white"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>

      {/* ── DESKTOP: floating card ──────────────────────────────────── */}
      <div
        className={[
          "fixed bottom-4 right-4 z-50 hidden md:block",
          "w-64 overflow-hidden rounded-2xl",
          "border border-neutral-700/60 bg-neutral-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl",
          flashRing,
          "transition-all duration-300",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
          <div className="flex items-center gap-2">
            {!isFinished ? (
              <span className="flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            ) : (
              <span className="rounded bg-neutral-700 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-neutral-300">
                FINAL
              </span>
            )}
            <span className="text-[10px] font-semibold text-neutral-400">
              {match.tournament}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded((p) => !p)}
              aria-label="Toggle details"
              className="rounded p-1 text-neutral-500 transition-colors hover:text-neutral-200"
            >
              <Wifi className="size-3" />
            </button>
            <button
              onClick={() => setVisible(false)}
              aria-label="Dismiss cricket widget"
              className="rounded p-1 text-neutral-500 transition-colors hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Score block */}
        <div className="px-3 py-3">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              {match.team1} vs {match.team2}
            </span>
            <span className="font-mono text-[10px] text-neutral-500">
              {toOvers(match.balls)}/{match.maxOvers} ov
            </span>
          </div>

          <div className="flex items-end gap-2">
            <span className={["font-mono text-3xl font-black leading-none tracking-tight transition-colors duration-300", flashScoreColor].join(" ")}>
              {match.runs}/{match.wickets}
            </span>
            {flash && (
              <span className={["mb-0.5 animate-bounce rounded px-1.5 py-0.5 font-mono text-xs font-black", flashBadgeStyle].join(" ")}>
                {flash === "six" ? "SIX!" : flash === "boundary" ? "FOUR!" : "OUT!"}
              </span>
            )}
          </div>

          <div className="mt-2 space-y-0.5">
            <p className="font-mono text-[11px] text-neutral-300">
              🏏 {match.batter}{" "}
              <span className="font-bold text-white">{match.batterRuns}*</span>
              <span className="text-neutral-500"> ({match.batterBalls})</span>
            </p>
            <p className="font-mono text-[11px] text-neutral-400">
              ⚡ {match.bowler} bowling
            </p>
          </div>

          {expanded && (
            <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-800/50 px-2.5 py-2">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
                Last Ball
              </p>
              <div className="flex items-center gap-2">
                <span className={["flex h-7 w-7 items-center justify-center rounded-full font-mono text-sm font-black", lastEventStyle].join(" ")}>
                  {match.lastEvent}
                </span>
                <span className="text-[10px] text-neutral-400">{lastEventLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer CRR / RRR */}
        <div className="border-t border-neutral-800 px-3 py-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">CRR</span>
            <span className="font-mono text-[10px] font-bold text-neutral-300">
              {match.balls > 0 ? ((match.runs / match.balls) * 6).toFixed(2) : "—"}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">RRR</span>
            <span className="font-mono text-[10px] font-bold text-emerald-400">
              {match.balls < match.maxOvers * 6
                ? (((200 - match.runs) / (match.maxOvers * 6 - match.balls)) * 6).toFixed(2)
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SAFEGUARD 3: component-level error boundary ──────────────────────────────
// unstable_catchError(fallback) returns a wrapper component that accepts
// children. We wrap CricketWidgetInner so any render error is caught here
// and the widget silently disappears instead of propagating to the root layout.
function WidgetErrorFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[CricketWidget] Render error suppressed:", error.message);
  }
  return null;
}

const CricketWidgetBoundary = catchError(WidgetErrorFallback);

export function CricketWidget() {
  return (
    <CricketWidgetBoundary>
      <CricketWidgetInner />
    </CricketWidgetBoundary>
  );
}
