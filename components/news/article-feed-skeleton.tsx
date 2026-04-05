// Pure Server Component — no "use client" needed, no interactivity.
// Renders 3 pulse skeleton cards that exactly mirror ArticleListCard dimensions.

export function ArticleFeedSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true" aria-label="Loading more articles">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex animate-pulse gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          {/* Thumbnail placeholder — matches h-24 w-28 sm:h-28 sm:w-36 */}
          <div className="h-24 w-28 shrink-0 bg-neutral-200 dark:bg-neutral-800 sm:h-28 sm:w-36" />

          {/* Content placeholder */}
          <div className="flex flex-1 flex-col justify-between py-3 pr-3">
            <div className="space-y-2">
              {/* Category line */}
              <div className="h-2.5 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
              {/* Headline — two lines */}
              <div className="h-3.5 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3.5 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800" />
              {/* Summary */}
              <div className="hidden h-2.5 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800/60 sm:block" />
            </div>
            {/* Meta row */}
            <div className="mt-2 flex gap-3">
              <div className="h-2 w-16 rounded bg-neutral-100 dark:bg-neutral-800/60" />
              <div className="h-2 w-10 rounded bg-neutral-100 dark:bg-neutral-800/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
