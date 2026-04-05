"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Archive } from "lucide-react";
import Link from "next/link";
import { ArticleListCard } from "@/components/news/article-list-card";
import { ArticleFeedSkeleton } from "@/components/news/article-feed-skeleton";
import { InjectionSlot } from "@/components/news/injection-slot";
import { FEED_INJECTIONS } from "@/lib/feed-injections";
import type { ArticleCard } from "@/types/news";
import type { FeedResponse } from "@/app/api/articles/feed/route";

// ─── Constants ────────────────────────────────────────────────────────────────

// Pillar 2: Hard timeout — if the feed API takes longer than this, abort.
// 5 seconds is the industry standard for non-critical background fetches.
const FETCH_TIMEOUT_MS = 5_000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArticleFeedProps {
  initialArticles: ArticleCard[];
  initialCursor:   string | null;
}

interface ArticleBatch {
  batchIndex: number;
  articles:   ArticleCard[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArticleFeed({ initialArticles, initialCursor }: ArticleFeedProps) {
  const [batches,   setBatches]   = useState<ArticleBatch[]>(
    initialArticles.length > 0
      ? [{ batchIndex: 0, articles: initialArticles }]
      : [],
  );
  const [cursor,    setCursor]    = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore,   setHasMore]   = useState(initialCursor !== null);
  const [nextBatch, setNextBatch] = useState(1);

  // ── Pillar 3: isMounted guard ─────────────────────────────────────────────
  // Prevents state updates on an unmounted component.
  // If the user navigates away while a fetch is in-flight, the async callbacks
  // check this ref before calling any setState — zero memory leak warnings.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ── Race-condition guard ──────────────────────────────────────────────────
  const fetchingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Fetch next batch ──────────────────────────────────────────────────────
  const fetchNext = useCallback(async () => {
    if (fetchingRef.current || !cursor || !hasMore) return;

    fetchingRef.current = true;

    // Only update loading state if still mounted
    if (isMountedRef.current) setIsLoading(true);

    // ── Pillar 2: AbortController with 5-second hard timeout ─────────────
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => {
      controller.abort();
      console.warn("[ArticleFeed] Fetch aborted — exceeded 5s timeout.");
    }, FETCH_TIMEOUT_MS);

    try {
      const url = `/api/articles/feed?cursor=${encodeURIComponent(cursor)}&limit=8`;
      const res = await fetch(url, { signal: controller.signal });

      clearTimeout(timeoutId); // fetch completed — cancel the abort timer

      if (!isMountedRef.current) return; // component unmounted mid-flight

      if (!res.ok) {
        console.error(`[ArticleFeed] Feed API returned ${res.status} ${res.statusText}`);
        setHasMore(false);
        return;
      }

      // ── Pillar 2: Malformed JSON guard ──────────────────────────────────
      // res.json() throws a SyntaxError on malformed responses (e.g. HTML
      // error pages, truncated payloads). We catch it explicitly so the feed
      // degrades gracefully instead of crashing the component.
      let json: { success: boolean; data: FeedResponse };
      try {
        json = await res.json() as { success: boolean; data: FeedResponse };
      } catch (parseErr) {
        console.error("[ArticleFeed] JSON parse failed — malformed API response:", parseErr);
        if (isMountedRef.current) setHasMore(false);
        return;
      }

      if (!isMountedRef.current) return;

      // ── Validate response shape before destructuring ────────────────────
      if (
        !json.success ||
        !json.data ||
        !Array.isArray(json.data.articles)
      ) {
        console.error("[ArticleFeed] Unexpected response shape:", json);
        setHasMore(false);
        return;
      }

      const { articles: newArticles, nextCursor } = json.data;
      const thisBatchIndex = nextBatch;

      setBatches((prev) => [...prev, { batchIndex: thisBatchIndex, articles: newArticles }]);
      setNextBatch((n) => n + 1);
      setCursor(nextCursor);
      setHasMore(nextCursor !== null);

    } catch (err) {
      clearTimeout(timeoutId);

      if (!isMountedRef.current) return; // unmounted — don't touch state

      // AbortError is expected on timeout — don't log as an unexpected error
      if (err instanceof DOMException && err.name === "AbortError") {
        console.warn("[ArticleFeed] Fetch timed out. Stopping infinite scroll.");
      } else {
        console.error("[ArticleFeed] Network error:", err);
      }

      // In all failure cases: stop fetching, show the archive link
      setHasMore(false);

    } finally {
      clearTimeout(timeoutId); // safety — clear if not already cleared
      fetchingRef.current = false;
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [cursor, hasMore, nextBatch]);

  // ── IntersectionObserver — 400px lead time ────────────────────────────────
  useEffect(() => {
    if (!hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNext();
      },
      { rootMargin: "0px 0px 400px 0px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, fetchNext]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (batches.length === 0) return null;

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      aria-label="More stories"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="border-l-2 border-red-600 pl-2 font-headline text-lg font-black text-neutral-900 dark:text-white">
          More Stories
        </h2>
        <Link
          href="/archive"
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
        >
          <Archive className="size-3.5" />
          Full Archive
        </Link>
      </div>

      {batches.map((batch) => {
        const injection = FEED_INJECTIONS.find(
          (inj) => inj.afterBatch === batch.batchIndex,
        );

        return (
          <div key={`batch-${batch.batchIndex}`}>
            <div className="space-y-3">
              {batch.articles.map((article) => (
                <ArticleListCard key={article.id} article={article} />
              ))}
            </div>

            {injection && (
              <InjectionSlot key={injection.id} injection={injection} />
            )}
          </div>
        );
      })}

      {isLoading && (
        <div className="mt-3">
          <ArticleFeedSkeleton />
        </div>
      )}

      {hasMore && (
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      )}

      {/* End-of-feed — shown on natural completion OR after any fetch failure */}
      {!hasMore && !isLoading && batches.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <div className="h-px w-16 bg-red-600" />
          <p className="text-xs text-neutral-400">You&apos;re all caught up</p>
          <Link
            href="/archive"
            className="mt-1 flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-white"
          >
            <Archive className="size-3" />
            Explore the full archive
          </Link>
        </div>
      )}
    </section>
  );
}
