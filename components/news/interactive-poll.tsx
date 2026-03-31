"use client";

import { useEffect, useRef, useState } from "react";
import { unstable_catchError as catchError } from "next/error";
import { BarChart2, CheckCircle2, Flame, Zap, Heart, ThumbsUp, Frown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reaction {
  key:   string;
  emoji: string;
  label: string;
  icon:  React.ReactNode;
  color: string; // Tailwind bg class for the active ring
}

interface PollOption {
  id:      string;
  label:   string;
  /** Seeded vote count — gives the illusion of an active community */
  seed:    number;
}

interface InteractivePollProps {
  /** Unique per-article key — used to namespace localStorage entries */
  articleSlug: string;
  /** Override the default poll question */
  question?:   string;
  /** Override the default poll options */
  options?:    PollOption[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REACTIONS: Reaction[] = [
  { key: "fire",    emoji: "🔥", label: "Trending",  icon: <Flame       className="size-3.5" />, color: "ring-orange-400" },
  { key: "mindblown", emoji: "🤯", label: "Shocking", icon: <Zap        className="size-3.5" />, color: "ring-violet-400" },
  { key: "sad",     emoji: "😢", label: "Sad",       icon: <Frown       className="size-3.5" />, color: "ring-blue-400"   },
  { key: "angry",   emoji: "😡", label: "Angry",     icon: <Flame       className="size-3.5" />, color: "ring-red-500"    },
  { key: "like",    emoji: "👍", label: "Agree",     icon: <ThumbsUp    className="size-3.5" />, color: "ring-emerald-400"},
  { key: "love",    emoji: "❤️", label: "Important", icon: <Heart       className="size-3.5" />, color: "ring-pink-400"   },
];

const DEFAULT_OPTIONS: PollOption[] = [
  { id: "yes",      label: "✅ हो, सहमत आहे",    seed: 1820 },
  { id: "no",       label: "❌ नाही, असहमत",      seed:  640 },
  { id: "cant_say", label: "🤔 सांगता येत नाही", seed:  340 },
];

const DEFAULT_QUESTION = "या निर्णयाशी तुम्ही सहमत आहात का?";

// ─── localStorage helpers ─────────────────────────────────────────────────────

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key); }
  catch { return null; }
}

function lsSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); }
  catch { /* quota exceeded or private mode — silently ignore */ }
}

// ─── Inner component ──────────────────────────────────────────────────────────

function InteractivePollInner({
  articleSlug,
  question = DEFAULT_QUESTION,
  options   = DEFAULT_OPTIONS,
}: InteractivePollProps) {
  // ── SAFEGUARD: mounted guard ──────────────────────────────────────────────
  // localStorage is undefined on the server. We render null until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ── Reaction state ────────────────────────────────────────────────────────
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    fire: 4821, mindblown: 2103, sad: 891, angry: 1247, like: 7634, love: 3312,
  });
  const [myReaction,  setMyReaction]  = useState<string | null>(null);
  const [popKey,      setPopKey]      = useState<string | null>(null);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Poll state ────────────────────────────────────────────────────────────
  const [voteCounts,  setVoteCounts]  = useState<Record<string, number>>(
    () => Object.fromEntries(options.map((o) => [o.id, o.seed])),
  );
  const [myVote,      setMyVote]      = useState<string | null>(null);
  // Animate bars: null = not yet triggered, true = bars expanding
  const [showBars,    setShowBars]    = useState(false);

  // ── Restore from localStorage after mount ────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const savedReaction = lsGet(`reaction_${articleSlug}`);
    if (savedReaction) setMyReaction(savedReaction);

    const savedVote = lsGet(`poll_vote_${articleSlug}`);
    if (savedVote) {
      setMyVote(savedVote);
      // Delay bar animation slightly so it feels intentional on restore
      setTimeout(() => setShowBars(true), 150);
    }
  }, [mounted, articleSlug]);

  // ── Cross-tab synchronisation via StorageEvent ────────────────────────────
  // The `storage` event fires in every tab EXCEPT the one that wrote the key.
  // This means Tab B instantly reflects what Tab A voted/reacted without a
  // page refresh. We use a named function so addEventListener and
  // removeEventListener receive the exact same reference for correct cleanup.
  useEffect(() => {
    if (!mounted) return;

    function onStorage(e: StorageEvent) {
      // Only react to keys belonging to this article
      if (e.key === `reaction_${articleSlug}` && e.newValue) {
        const incoming = e.newValue;
        // Adjust counts: undo the previous reaction, apply the new one
        setReactionCounts((prev) => {
          const next = { ...prev };
          // We don't know the previous reaction in the other tab, so we read
          // the old value from the event (e.oldValue) when available
          if (e.oldValue) next[e.oldValue] = Math.max(0, (next[e.oldValue] ?? 1) - 1);
          next[incoming] = (next[incoming] ?? 0) + 1;
          return next;
        });
        setMyReaction(incoming);
      }

      if (e.key === `poll_vote_${articleSlug}` && e.newValue) {
        const incoming = e.newValue;
        setVoteCounts((prev) => ({
          ...prev,
          [incoming]: (prev[incoming] ?? 0) + 1,
        }));
        setMyVote(incoming);
        // Trigger bar animation in the synced tab
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setShowBars(true));
        });
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted, articleSlug]);

  // ── Cleanup pop timer on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (popTimerRef.current !== null) clearTimeout(popTimerRef.current);
    };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleReaction(key: string) {
    if (myReaction === key) return; // already reacted with this emoji

    setReactionCounts((prev) => {
      const next = { ...prev };
      // Remove previous reaction count
      if (myReaction) next[myReaction] = (next[myReaction] ?? 1) - 1;
      next[key] = (next[key] ?? 0) + 1;
      return next;
    });

    setMyReaction(key);
    lsSet(`reaction_${articleSlug}`, key);

    // Trigger pop animation
    if (popTimerRef.current !== null) clearTimeout(popTimerRef.current);
    setPopKey(key);
    popTimerRef.current = setTimeout(() => {
      setPopKey(null);
      popTimerRef.current = null;
    }, 500);
  }

  function handleVote(optionId: string) {
    if (myVote) return; // already voted

    setVoteCounts((prev) => ({
      ...prev,
      [optionId]: (prev[optionId] ?? 0) + 1,
    }));
    setMyVote(optionId);
    lsSet(`poll_vote_${articleSlug}`, optionId);

    // Stagger bar reveal for a satisfying animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setShowBars(true));
    });
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const totalVotes = options.reduce((s, o) => s + (voteCounts[o.id] ?? 0), 0);

  function pct(optionId: string): number {
    if (totalVotes === 0) return 0;
    return Math.round(((voteCounts[optionId] ?? 0) / totalVotes) * 100);
  }

  function fmtCount(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  }

  // ── Server / pre-mount skeleton ───────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="mt-8 animate-pulse rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
        <div className="mt-6 h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="mt-3 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      </div>
    );
  }

  // ── Full render ───────────────────────────────────────────────────────────
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">

      {/* ── Section A: Emoji Reactions ──────────────────────────────── */}
      <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
          <span>या बातमीवर तुमची प्रतिक्रिया</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {REACTIONS.map((r) => {
            const isActive = myReaction === r.key;
            const isPopping = popKey === r.key;

            return (
              <button
                key={r.key}
                onClick={() => handleReaction(r.key)}
                // Descriptive aria-label: tells screen readers exactly what
                // the button does and its current pressed state
                aria-label={`${r.label} सह प्रतिक्रिया द्या — ${fmtCount(reactionCounts[r.key] ?? 0)} प्रतिक्रिया`}
                aria-pressed={isActive}
                className={[
                  "flex flex-col items-center gap-1 rounded-2xl border px-3 py-2 transition-all duration-200",
                  "select-none",
                  // focus-visible ring matches the reaction's active colour so
                  // keyboard users get the same visual affordance as mouse users
                  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:${r.color}`,
                  isActive
                    ? `border-transparent bg-neutral-100 ring-2 dark:bg-neutral-800 ${r.color}`
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800",
                  isPopping ? "scale-125" : "scale-100",
                ].join(" ")}
                style={{ transition: isPopping ? "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)" : "transform 0.2s ease, background 0.2s ease" }}
              >
                {/* aria-hidden on the emoji — the aria-label on the button
                    already conveys the full meaning to screen readers */}
                <span aria-hidden="true" className={["text-xl leading-none", isPopping ? "animate-bounce" : ""].join(" ")}>
                  {r.emoji}
                </span>
                <span aria-hidden="true" className="font-mono text-[10px] font-bold tabular-nums text-neutral-500 dark:text-neutral-400">
                  {fmtCount(reactionCounts[r.key] ?? 0)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section B: Poll ─────────────────────────────────────────── */}
      <div className="px-5 py-5">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <BarChart2 className="size-4 text-neutral-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            वाचक मतदान
          </span>
          {myVote && (
            <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              ✓ मत नोंदवले
            </span>
          )}
        </div>

        <p className="font-headline text-base font-bold leading-snug text-neutral-900 dark:text-white">
          {question}
        </p>

        {/* aria-live="polite" + aria-atomic="true": when bars animate in,
            the screen reader announces the entire results block as one unit
            rather than reading each percentage change individually. */}
        <div
          className="mt-4 space-y-2.5"
          aria-live="polite"
          aria-atomic="true"
          aria-label={myVote ? `मतदान परिणाम: एकूण ${totalVotes.toLocaleString()} मते` : undefined}
        >
          {options.map((opt) => {
            const p        = pct(opt.id);
            const isVoted  = myVote === opt.id;
            const hasVoted = myVote !== null;

            if (!hasVoted) {
              // ── Pre-vote: clickable buttons ──────────────────────
              return (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  aria-label={`${opt.label} साठी मत द्या`}
                  className={[
                    "w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-150",
                    "border-neutral-200 bg-neutral-50 text-neutral-800",
                    "hover:border-neutral-900 hover:bg-neutral-900 hover:text-white",
                    "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
                    "dark:hover:border-white dark:hover:bg-white dark:hover:text-neutral-900",
                    "active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:focus-visible:ring-white",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            }

            // ── Post-vote: animated result bar ────────────────────
            return (
              <div key={opt.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={[
                    "flex items-center gap-1.5 text-sm font-semibold",
                    isVoted
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-neutral-400",
                  ].join(" ")}>
                    {isVoted && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                    {opt.label}
                  </span>
                  <span className={[
                    "font-mono text-sm font-black tabular-nums",
                    isVoted ? "text-neutral-900 dark:text-white" : "text-neutral-400",
                  ].join(" ")}>
                    {p}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={[
                      "h-full rounded-full transition-all duration-700 ease-out",
                      isVoted
                        ? "bg-neutral-900 dark:bg-white"
                        : "bg-neutral-300 dark:bg-neutral-600",
                    ].join(" ")}
                    style={{
                      width: showBars ? `${p}%` : "0%",
                      // Stagger each bar by its index for a cascade effect
                      transitionDelay: showBars
                        ? `${options.indexOf(opt) * 80}ms`
                        : "0ms",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
          {totalVotes.toLocaleString()} मते
          {myVote ? " · परिणाम" : " · मत द्या"}
        </p>
      </div>
    </div>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────

function PollErrorFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[InteractivePoll] Render error suppressed:", error.message);
  }
  return null;
}

const PollBoundary = catchError(PollErrorFallback);

export function InteractivePoll(props: InteractivePollProps) {
  return (
    <PollBoundary>
      <InteractivePollInner {...props} />
    </PollBoundary>
  );
}
