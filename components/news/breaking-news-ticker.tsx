import Link from "next/link";

import type { BreakingUpdate } from "@/types/news";

interface BreakingNewsTickerProps {
  updates: BreakingUpdate[];
}

export function BreakingNewsTicker({ updates }: BreakingNewsTickerProps) {
  if (updates.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-red-200 bg-red-50 dark:border-red-950 dark:bg-red-950/20">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <span className="shrink-0 rounded bg-red-600 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Breaking
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-track inline-flex">
            {[...updates, ...updates].map((update, index) => (
              <Link
                key={`${update.id}-${index}`}
                href={update.href}
                className="mx-6 inline-flex shrink-0 text-sm text-red-900 hover:underline dark:text-red-200"
              >
                {update.headline}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
