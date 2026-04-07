"use client";

// Inline Ad Card — lightweight placeholder for feed-injected ad slots.
// Swap the inner content with your real ad network script when ready.

export default function InlineAdCard() {
  return (
    <div
      className="flex w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
      style={{ minHeight: 250 }}
      aria-label="Advertisement"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          Ad
        </span>
        <p className="text-xs text-neutral-400">Advertisement</p>
      </div>
    </div>
  );
}
