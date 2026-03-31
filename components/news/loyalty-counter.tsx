"use client";

import { useEffect, useRef, useState } from "react";
import { unstable_catchError as catchError } from "next/error";

// ─── Storage key (single source of truth across all components) ───────────────
export const LS_POINTS_KEY    = "newsx_loyalty_points";
export const LS_REWARDED_KEY  = "newsx_rewarded_articles";

// ─── Shared localStorage helpers (exported for use in RewardTrigger) ─────────

export function lsGetPoints(): number {
  try {
    const raw = localStorage.getItem(LS_POINTS_KEY);
    const n   = parseInt(raw ?? "0", 10);
    return isNaN(n) ? 0 : n;
  } catch { return 0; }
}

export function lsSetPoints(pts: number): void {
  try { localStorage.setItem(LS_POINTS_KEY, String(pts)); }
  catch { /* Safari private mode — silently ignore */ }
}

export function lsGetRewarded(): string[] {
  try {
    const raw = localStorage.getItem(LS_REWARDED_KEY);
    const arr = JSON.parse(raw ?? "[]") as unknown;
    return Array.isArray(arr) ? (arr as string[]) : [];
  } catch { return []; }
}

export function lsAddRewarded(slug: string): void {
  try {
    const arr = lsGetRewarded();
    if (!arr.includes(slug)) {
      localStorage.setItem(LS_REWARDED_KEY, JSON.stringify([...arr, slug]));
    }
  } catch { /* silently ignore */ }
}

// ─── Inner counter ────────────────────────────────────────────────────────────

function LoyaltyCounterInner() {
  // ── Mounted guard — localStorage is undefined on the server ──────────────
  const [mounted, setMounted] = useState(false);
  const [points,  setPoints]  = useState(0);
  // pop = true triggers the scale-up animation on point gain
  const [pop,     setPop]     = useState(false);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Read initial value after mount
  useEffect(() => {
    if (!mounted) return;
    setPoints(lsGetPoints());
  }, [mounted]);

  // ── Cross-tab sync via StorageEvent ───────────────────────────────────────
  // Fires in every tab EXCEPT the one that wrote — so Tab B's navbar updates
  // the instant Tab A's RewardTrigger writes new points.
  useEffect(() => {
    if (!mounted) return;

    function onStorage(e: StorageEvent) {
      if (e.key !== LS_POINTS_KEY || e.newValue === null) return;
      const incoming = parseInt(e.newValue, 10);
      if (!isNaN(incoming)) {
        setPoints(incoming);
        triggerPop();
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  // ── Listen for same-tab point updates via custom event ────────────────────
  // StorageEvent doesn't fire in the tab that wrote. RewardTrigger dispatches
  // a custom "newsx:points" event so the counter in the SAME tab also updates.
  useEffect(() => {
    if (!mounted) return;

    function onPointsUpdate(e: Event) {
      const pts = (e as CustomEvent<number>).detail;
      setPoints(pts);
      triggerPop();
    }

    window.addEventListener("newsx:points", onPointsUpdate);
    return () => window.removeEventListener("newsx:points", onPointsUpdate);
  }, [mounted]);

  // ── Cleanup pop timer ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (popTimerRef.current !== null) clearTimeout(popTimerRef.current);
    };
  }, []);

  function triggerPop() {
    if (popTimerRef.current !== null) clearTimeout(popTimerRef.current);
    setPop(true);
    popTimerRef.current = setTimeout(() => {
      setPop(false);
      popTimerRef.current = null;
    }, 600);
  }

  // Server / pre-mount: render nothing — no hydration surface
  if (!mounted) return null;

  return (
    <div
      aria-label={`Loyalty points: ${points}`}
      title="Your NewsroomX loyalty points"
      className={[
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all duration-300",
        "border-amber-300/60 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-950/30",
        pop ? "scale-110 shadow-md shadow-amber-400/30" : "scale-100",
      ].join(" ")}
    >
      {/* Coin icon — glows on pop */}
      <span
        aria-hidden="true"
        className={["text-sm leading-none transition-all duration-300", pop ? "animate-spin" : ""].join(" ")}
        style={{ animationIterationCount: 1, animationDuration: "0.4s" }}
      >
        🪙
      </span>
      <span
        className={[
          "font-mono text-xs font-black tabular-nums transition-colors duration-300",
          pop ? "text-amber-600 dark:text-amber-400" : "text-amber-700 dark:text-amber-500",
        ].join(" ")}
      >
        {points.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────

function CounterFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[LoyaltyCounter] Render error suppressed:", error.message);
  }
  return null;
}

const CounterBoundary = catchError(CounterFallback);

export function LoyaltyCounter() {
  return (
    <CounterBoundary>
      <LoyaltyCounterInner />
    </CounterBoundary>
  );
}
