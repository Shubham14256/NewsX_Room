import { HeroGridSkeleton } from "@/components/news/article-skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-7 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      </div>

      {/* Breaking ticker skeleton */}
      <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="h-5 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-64 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
        </div>
      </div>

      {/* Ad slot skeleton */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <div className="h-14 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
      </div>

      {/* Stories row skeleton */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-1.5">
              <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60" />
            </div>
          ))}
        </div>
      </div>

      <HeroGridSkeleton />
    </div>
  );
}
