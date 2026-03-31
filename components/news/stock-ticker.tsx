"use client";

import { useEffect, useRef, useState } from "react";
import { unstable_catchError as catchError } from "next/error";
import { TrendingUp, TrendingDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockQuote {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePct: number;
  direction: "up" | "down";
  flash: boolean;
}

// ─── Seed data — fully deterministic, no Math.random() at module scope ────────

const SEEDS: Omit<StockQuote, "direction" | "flash">[] = [
  { symbol: "NIFTY50",    label: "NIFTY 50",    price: 22_541.15, change:  +84.30, changePct: +0.38 },
  { symbol: "SENSEX",     label: "SENSEX",      price: 74_119.49, change: +271.45, changePct: +0.37 },
  { symbol: "BANKNIFTY",  label: "BANK NIFTY",  price: 48_302.70, change:  -93.55, changePct: -0.19 },
  { symbol: "RELIANCE",   label: "RELIANCE",    price:  2_934.80, change:  +18.65, changePct: +0.64 },
  { symbol: "TCS",        label: "TCS",         price:  3_812.40, change:  -22.10, changePct: -0.58 },
  { symbol: "HDFCBANK",   label: "HDFC BANK",   price:  1_621.55, change:   +9.30, changePct: +0.58 },
  { symbol: "INFY",       label: "INFOSYS",     price:  1_478.90, change:  -11.75, changePct: -0.79 },
  { symbol: "TATAMOTORS", label: "TATA MOTORS", price:    948.25, change:  +14.50, changePct: +1.55 },
  { symbol: "WIPRO",      label: "WIPRO",       price:    462.35, change:   -3.80, changePct: -0.82 },
  { symbol: "ICICIBANK",  label: "ICICI BANK",  price:  1_089.70, change:   +6.45, changePct: +0.60 },
  { symbol: "BAJFINANCE", label: "BAJ FINANCE", price:  6_843.00, change:  -47.20, changePct: -0.69 },
  { symbol: "ADANIENT",   label: "ADANI ENT",   price:  2_412.60, change:  +31.80, changePct: +1.34 },
  { symbol: "HCLTECH",    label: "HCL TECH",    price:  1_356.45, change:   +8.90, changePct: +0.66 },
  { symbol: "SBIN",       label: "SBI",         price:    793.80, change:   -4.15, changePct: -0.52 },
  { symbol: "MARUTI",     label: "MARUTI",      price: 12_687.50, change: +143.25, changePct: +1.14 },
  { symbol: "GOLD",       label: "GOLD (MCX)",  price: 72_456.00, change: +312.00, changePct: +0.43 },
  { symbol: "USDINR",     label: "USD/INR",     price:     83.47, change:   -0.06, changePct: -0.07 },
];

// ─── Pure helpers — no side-effects, safe to call anywhere ───────────────────

function initQuotes(): StockQuote[] {
  return SEEDS.map((q) => ({
    ...q,
    direction: q.change >= 0 ? "up" : "down",
    flash: false,
  }));
}

/** Nudge price by ±0.05–0.25% — only ever called inside useEffect (client-only) */
function nudge(price: number): number {
  const pct  = (Math.random() * 0.20 + 0.05) / 100;
  const sign = Math.random() < 0.5 ? 1 : -1;
  return Math.round(price * (1 + sign * pct) * 100) / 100;
}

function formatPrice(price: number, symbol: string): string {
  if (symbol === "USDINR") return price.toFixed(2);
  if (price >= 10_000)
    return price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(2);
}

// ─── Inner ticker (all dynamic logic lives here) ──────────────────────────────

function StockTickerInner() {
  // ── SAFEGUARD 1: mounted guard ────────────────────────────────────────────
  // Server renders null — zero hydration surface.
  // All Math.random() calls are gated behind mounted=true, so they only ever
  // execute on the client after hydration is complete.
  const [mounted, setMounted] = useState(false);
  const [quotes,  setQuotes]  = useState<StockQuote[]>(initQuotes);

  // Mount gate — runs once, client-only
  useEffect(() => { setMounted(true); }, []);

  // ── SAFEGUARD 2: rigorous timer cleanup ───────────────────────────────────
  // intervalRef  — the price-update setInterval handle
  // flashTimerRef — the flash-clear setTimeout handle
  // Both stored in refs so the cleanup function always holds the latest handle,
  // even if React re-runs the effect.
  const intervalRef  = useRef<ReturnType<typeof setInterval>  | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't start simulation until safely mounted on the client
    if (!mounted) return;

    function clearAllTimers() {
      if (intervalRef.current   !== null) { clearInterval(intervalRef.current);   intervalRef.current   = null; }
      if (flashTimerRef.current !== null) { clearTimeout(flashTimerRef.current);  flashTimerRef.current = null; }
    }

    intervalRef.current = setInterval(() => {
      // Pick 2–4 random stocks to update each tick
      const count    = Math.floor(Math.random() * 3) + 2;
      const toUpdate = new Set<number>();
      while (toUpdate.size < count) {
        toUpdate.add(Math.floor(Math.random() * SEEDS.length));
      }

      setQuotes((prev) =>
        prev.map((q, i) => {
          if (!toUpdate.has(i)) return { ...q, flash: false };

          const newPrice  = nudge(q.price);
          const delta     = newPrice - q.price;
          const newChange = Math.round((q.change + delta) * 100) / 100;
          const base      = newPrice - newChange;
          const newPct    = base !== 0
            ? Math.round((newChange / Math.abs(base)) * 10_000) / 100
            : q.changePct;

          return {
            ...q,
            price:     newPrice,
            change:    newChange,
            changePct: newPct,
            direction: newChange >= 0 ? "up" : "down",
            flash:     true,
          };
        }),
      );

      // Clear flash highlight — tracked ref so it's always cancellable
      if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => {
        setQuotes((prev) => prev.map((q) => ({ ...q, flash: false })));
        flashTimerRef.current = null;
      }, 700);
    }, 3_500);

    // Cleanup: fires on unmount — guarantees zero orphaned timers
    return clearAllTimers;
  }, [mounted]);

  // Server pass and pre-mount: render nothing
  if (!mounted) return null;

  // Duplicate list so the CSS marquee loops seamlessly
  const items = [...quotes, ...quotes];

  return (
    <div
      className="relative overflow-hidden border-b border-neutral-800 bg-neutral-950"
      aria-label="Live stock market prices"
    >
      {/* Left edge fade + LIVE badge */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full items-center">
        <div className="flex h-full items-center bg-neutral-950 pl-3 pr-3">
          <span className="flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
        </div>
        <div className="h-full w-8 bg-gradient-to-r from-neutral-950 to-transparent" />
      </div>

      {/* Right edge fade */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-neutral-950 to-transparent" />

      {/* Scrolling track — CSS animation untouched */}
      <div className="stock-ticker-track flex items-center py-1.5 pl-24">
        {items.map((q, idx) => (
          <span
            key={`${q.symbol}-${idx}`}
            className="inline-flex shrink-0 items-center gap-1.5 px-4 font-mono text-[11px]"
          >
            <span className="font-bold tracking-wide text-neutral-400">
              {q.label}
            </span>

            <span
              className={[
                "tabular-nums font-semibold transition-colors duration-500",
                q.flash
                  ? q.direction === "up" ? "text-emerald-300" : "text-red-400"
                  : "text-white",
              ].join(" ")}
            >
              {formatPrice(q.price, q.symbol)}
            </span>

            <span
              className={[
                "inline-flex items-center gap-0.5 tabular-nums",
                q.direction === "up" ? "text-emerald-400" : "text-red-400",
              ].join(" ")}
            >
              {q.direction === "up"
                ? <TrendingUp  className="size-2.5 shrink-0" />
                : <TrendingDown className="size-2.5 shrink-0" />}
              {q.direction === "up" ? "+" : ""}
              {q.changePct.toFixed(2)}%
            </span>

            <span className="ml-2 text-neutral-700" aria-hidden="true">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── SAFEGUARD 3: component-level error boundary ──────────────────────────────
// unstable_catchError(fallback) returns a wrapper component that accepts
// children. StockTickerInner is passed as children so any render-time throw
// is caught here and returns null — the Navbar never sees the error.
function TickerErrorFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[StockTicker] Render error suppressed:", error.message);
  }
  return null;
}

const StockTickerBoundary = catchError(TickerErrorFallback);

export function StockTicker() {
  return (
    <StockTickerBoundary>
      <StockTickerInner />
    </StockTickerBoundary>
  );
}
