"use client";

// ─── Stories Strip Feed Widget ────────────────────────────────────────────────
// A compact horizontal strip of story bubbles — teases the /stories Reels feed.
// Separate chunk from the full ReelsFeed component.

import Link from "next/link";
import { Zap } from "lucide-react";

const STORY_BUBBLES = [
  { label: "राजकारण", gradient: "linear-gradient(135deg,#667eea,#764ba2)" },
  { label: "क्रीडा",  gradient: "linear-gradient(135deg,#f093fb,#f5576c)" },
  { label: "तंत्रज्ञान", gradient: "linear-gradient(135deg,#4facfe,#00f2fe)" },
  { label: "मनोरंजन", gradient: "linear-gradient(135deg,#43e97b,#38f9d7)" },
  { label: "व्यापार", gradient: "linear-gradient(135deg,#fa709a,#fee140)" },
];

export default function StoriesStrip() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="size-4 fill-orange-400 text-orange-400" />
            <span className="font-headline text-sm font-bold text-neutral-900 dark:text-white">
              Reels & Stories
            </span>
          </div>
          <Link
            href="/stories"
            className="text-[10px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
          >
            सर्व पहा →
          </Link>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {/* Main Stories CTA */}
          <Link
            href="/stories"
            className="group flex shrink-0 flex-col items-center gap-1.5"
          >
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400 p-0.5 shadow-md ring-2 ring-red-500/30 transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-neutral-950">
                <Zap className="size-5 fill-orange-400 text-orange-400" />
              </div>
            </div>
            <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">Stories</span>
          </Link>

          {/* Category bubbles */}
          {STORY_BUBBLES.map((bubble) => (
            <Link
              key={bubble.label}
              href="/stories"
              className="group flex shrink-0 flex-col items-center gap-1.5"
            >
              <div
                className="h-14 w-14 overflow-hidden rounded-full p-0.5 shadow-sm ring-2 ring-neutral-300/50 transition-transform group-hover:scale-105 dark:ring-neutral-700/50"
                style={{ background: bubble.gradient }}
              >
                <div className="h-full w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                {bubble.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
