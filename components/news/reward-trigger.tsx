"use client";

import { useEffect, useRef, useState } from "react";
import { unstable_catchError as catchError } from "next/error";
import { toast } from "sonner";
import {
  lsGetPoints,
  lsSetPoints,
  lsGetRewarded,
  lsAddRewarded,
} from "@/components/news/loyalty-counter";

const POINTS_PER_ARTICLE = 10;

// ─── Inner trigger ────────────────────────────────────────────────────────────

function RewardTriggerInner({ articleSlug }: { articleSlug: string }) {
  // ── Mounted guard ─────────────────────────────────────────────────────────
  const [mounted,   setMounted]   = useState(false);
  const [rewarded,  setRewarded]  = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Check if already rewarded (after mount, before observer) ─────────────
  useEffect(() => {
    if (!mounted) return;
    const already = lsGetRewarded().includes(articleSlug);
    if (already) setRewarded(true);
  }, [mounted, articleSlug]);

  // ── IntersectionObserver — fires the reward when sentinel enters viewport ─
  useEffect(() => {
    if (!mounted || rewarded) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        // ── Anti-cheat: re-check inside the callback (race-condition safe) ──
        // The state check above handles the common case, but if two tabs race
        // to award the same article, the localStorage check is the final gate.
        const alreadyRewarded = lsGetRewarded().includes(articleSlug);
        if (alreadyRewarded) {
          setRewarded(true);
          observerRef.current?.disconnect();
          return;
        }

        // ── Award points ──────────────────────────────────────────────────
        const current  = lsGetPoints();
        const newTotal = current + POINTS_PER_ARTICLE;

        lsSetPoints(newTotal);
        lsAddRewarded(articleSlug);
        setRewarded(true);

        // Disconnect immediately — one reward per article, ever
        observerRef.current?.disconnect();
        observerRef.current = null;

        // ── Notify same-tab LoyaltyCounter via custom event ───────────────
        // StorageEvent doesn't fire in the writing tab, so we dispatch a
        // custom event that the counter listens for in the same tab.
        window.dispatchEvent(
          new CustomEvent("newsx:points", { detail: newTotal }),
        );

        // ── Delightful UX ─────────────────────────────────────────────────
        toast.success(`🎉 +${POINTS_PER_ARTICLE} Points Earned!`, {
          description: `तुम्ही हा लेख पूर्ण वाचला! एकूण: ${newTotal.toLocaleString("en-IN")} 🪙`,
          duration: 4000,
        });
      },
      {
        // 100% of the sentinel must be visible — user truly scrolled to bottom
        threshold: 1.0,
      },
    );

    observerRef.current.observe(sentinel);

    // ── Strict cleanup — no orphaned observers on unmount ─────────────────
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [mounted, rewarded, articleSlug]);

  // Server / pre-mount: render nothing
  if (!mounted) return null;

  return (
    // The sentinel is a zero-height invisible div at the very bottom of the
    // article. When it enters the viewport, the user has scrolled to the end.
    <div
      ref={sentinelRef}
      aria-hidden="true"
      className="h-px w-full"
    >
      {/* Subtle "end of article" indicator — visible only after reward fires */}
      {rewarded && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            🪙 +{POINTS_PER_ARTICLE} points earned
          </span>
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </div>
      )}
    </div>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────

function RewardFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[RewardTrigger] Render error suppressed:", error.message);
  }
  return null;
}

const RewardBoundary = catchError(RewardFallback);

export function RewardTrigger({ articleSlug }: { articleSlug: string }) {
  return (
    <RewardBoundary>
      <RewardTriggerInner articleSlug={articleSlug} />
    </RewardBoundary>
  );
}
