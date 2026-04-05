"use client";

// ─── InjectionSlot ────────────────────────────────────────────────────────────
// Wraps a lazily-loaded feed widget with:
//   1. Proximity-triggered dynamic import (600px rootMargin)
//   2. minHeight placeholder — prevents CLS before the chunk loads
//   3. ssr: false on all dynamic() calls — these widgets use browser APIs
//   4. unstable_catchError boundary — widget crash cannot take down ArticleFeed
//
// CRITICAL: next/dynamic() calls MUST be at module top-level (not inside
// render or a config array). The docs state: "dynamic() can't be used inside
// of React rendering as it needs to be marked in the top level of the module
// for preloading to work." Each widget gets its own top-level declaration.

import dynamic from "next/dynamic";
import { unstable_catchError as catchError } from "next/error";
import { useEffect, useRef, useState } from "react";
import type { FeedInjection } from "@/lib/feed-injections";

// ─── Dynamic imports — all at module top-level, ssr: false ───────────────────

const CricketInline = dynamic(
  () => import("@/components/news/feed-widgets/cricket-inline"),
  {
    ssr:     false,
    loading: () => <div style={{ minHeight: 180 }} aria-hidden="true" />,
  },
);

const HoroscopeMini = dynamic(
  () => import("@/components/news/feed-widgets/horoscope-mini"),
  {
    ssr:     false,
    loading: () => <div style={{ minHeight: 120 }} aria-hidden="true" />,
  },
);

const StoriesStrip = dynamic(
  () => import("@/components/news/feed-widgets/stories-strip"),
  {
    ssr:     false,
    loading: () => <div style={{ minHeight: 140 }} aria-hidden="true" />,
  },
);

// ─── Component key → dynamic component map ───────────────────────────────────

const COMPONENT_MAP: Record<string, React.ComponentType> = {
  CricketInline,
  HoroscopeMini,
  StoriesStrip,
};

// ─── Pillar 1: Blast-radius containment ──────────────────────────────────────
// If a widget crashes during render (bad state, chunk load failure, runtime
// error), this boundary catches it silently. The ArticleFeed continues
// rendering the next batch of articles — the user never sees a broken feed.
// Logs in dev only — zero noise in production.

function SlotErrorFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[InjectionSlot] Widget render error suppressed:", error.message);
  }
  // Return null — the slot collapses silently, feed scrolls on uninterrupted
  return null;
}

const SlotErrorBoundary = catchError(SlotErrorFallback);

// ─── Inner slot (proximity detection + render) ───────────────────────────────

interface InjectionSlotProps {
  injection: FeedInjection;
}

function InjectionSlotInner({ injection }: InjectionSlotProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // ── Stage 1: Proximity detection ─────────────────────────────────────────
  // Fires 600px before the slot enters the viewport — gives the dynamic import
  // time to resolve before the user actually sees the slot.
  useEffect(() => {
    if (shouldLoad) return; // already triggered — don't re-observe

    const el = placeholderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect(); // one-shot — never fires again
        }
      },
      { rootMargin: "0px 0px 600px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  const DynamicComponent = COMPONENT_MAP[injection.componentKey];

  // ── Stage 2: Render ───────────────────────────────────────────────────────
  return (
    <div
      ref={placeholderRef}
      style={{ minHeight: injection.minHeight }}
      className="py-3"
    >
      {shouldLoad && DynamicComponent ? (
        <DynamicComponent />
      ) : (
        <div
          aria-hidden="true"
          style={{ height: injection.minHeight }}
          className="rounded-2xl bg-neutral-100 dark:bg-neutral-800/30"
        />
      )}
    </div>
  );
}

// ─── Public export — inner slot wrapped in blast-radius boundary ──────────────

const InjectionSlotBoundary = catchError(SlotErrorFallback);

export function InjectionSlot({ injection }: InjectionSlotProps) {
  return (
    <InjectionSlotBoundary>
      <InjectionSlotInner injection={injection} />
    </InjectionSlotBoundary>
  );
}
