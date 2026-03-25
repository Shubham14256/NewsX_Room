export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Image skeleton */}
      <div className="h-44 w-full animate-pulse bg-neutral-200 dark:bg-neutral-800" />

      <div className="p-4 space-y-3">
        {/* Category pill */}
        <div className="h-4 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />

        {/* Title lines */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Summary lines */}
        <div className="space-y-1.5">
          <div className="h-3 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
        </div>

        {/* Author row */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-6 w-6 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="ml-auto h-3 w-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
        </div>
      </div>
    </div>
  );
}

export function TrendingCardSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Thumbnail */}
      <div className="h-28 w-32 shrink-0 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
      <div className="flex flex-1 flex-col justify-center gap-2 p-3">
        <div className="h-3 w-16 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="h-3 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
      </div>
    </div>
  );
}

export function HeroGridSkeleton() {
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
      {/* Featured skeleton */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-72 w-full animate-pulse bg-neutral-200 sm:h-80 lg:h-96 dark:bg-neutral-800" />
        <div className="p-5 space-y-3">
          <div className="h-3 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
        </div>
      </div>

      {/* Trending skeletons */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <TrendingCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative h-28 w-full animate-pulse bg-neutral-200 sm:h-32 dark:bg-neutral-800">
        {/* Play button placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/40" />
        </div>
      </div>
      <div className="space-y-2 p-2.5">
        <div className="h-3.5 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
      </div>
    </div>
  );
}
