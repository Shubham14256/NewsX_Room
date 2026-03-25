"use client";

import { useState, useEffect } from "react";
import { ListPlus, Play, Pause, X, ChevronUp, Headphones, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface QueueItem {
  title: string;
  slug: string;
}

interface AddToQueueButtonProps {
  title: string;
  slug: string;
}

// Global queue state via localStorage key
const QUEUE_KEY = "newsroom_listen_queue";
const PLAYING_KEY = "newsroom_now_playing";

function getQueue(): QueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as QueueItem[];
  } catch {
    return [];
  }
}

export function AddToQueueButton({ title, slug }: AddToQueueButtonProps) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const q = getQueue();
    setAdded(q.some((i) => i.slug === slug));
  }, [slug]);

  function handleAdd() {
    if (added) return;
    const q = getQueue();
    if (!q.some((i) => i.slug === slug)) {
      q.push({ title, slug });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
      // Set as now playing if queue was empty
      if (q.length === 1) {
        localStorage.setItem(PLAYING_KEY, JSON.stringify({ title, slug }));
      }
    }
    setAdded(true);
    // Dispatch event so MiniPlayer updates
    window.dispatchEvent(new Event("queue-updated"));
    toast.success("🎧 Daily Briefing Queue मध्ये जोडले!", {
      description: title.slice(0, 60) + (title.length > 60 ? "…" : ""),
      duration: 3000,
    });
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      aria-label="Add to listen queue"
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
        added
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
          : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
      }`}
    >
      <ListPlus className="size-3.5" />
      {added ? "Queue मध्ये आहे" : "+ Queue"}
    </button>
  );
}

export function MiniPlayer() {
  const [playing, setPlaying] = useState<QueueItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  function refresh() {
    const q = getQueue();
    setQueue(q);
    try {
      const p = JSON.parse(localStorage.getItem(PLAYING_KEY) ?? "null") as QueueItem | null;
      setPlaying(p ?? q[0] ?? null);
    } catch {
      setPlaying(q[0] ?? null);
    }
  }

  useEffect(() => {
    refresh();
    window.addEventListener("queue-updated", refresh);
    return () => window.removeEventListener("queue-updated", refresh);
  }, []);

  function handleSkip() {
    const idx = queue.findIndex((i) => i.slug === playing?.slug);
    const next = queue[idx + 1] ?? queue[0];
    if (next) {
      localStorage.setItem(PLAYING_KEY, JSON.stringify(next));
      setPlaying(next);
    }
  }

  function handleRemove(slug: string) {
    const q = getQueue().filter((i) => i.slug !== slug);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    window.dispatchEvent(new Event("queue-updated"));
    refresh();
  }

  if (!playing) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 sm:px-6">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 shadow-2xl backdrop-blur-xl">
        {/* Expanded queue list */}
        {expanded && queue.length > 0 && (
          <div className="border-b border-white/10 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Daily Briefing Queue ({queue.length})
            </p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {queue.map((item) => (
                <div
                  key={item.slug}
                  className={`flex items-center justify-between rounded-lg px-2 py-1.5 ${
                    item.slug === playing.slug ? "bg-white/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.slug === playing.slug && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((b) => (
                          <div
                            key={b}
                            className="w-0.5 rounded-full bg-emerald-400"
                            style={{
                              height: `${8 + b * 3}px`,
                              animation: isPlaying ? `bounce ${0.6 + b * 0.1}s ease-in-out infinite alternate` : "none",
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <p className="truncate text-xs text-white/80">{item.title}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.slug)}
                    className="ml-2 shrink-0 text-neutral-500 hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mini player bar */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Album art placeholder */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500 shadow-lg">
            <Headphones className="size-5 text-white" />
          </div>

          {/* Track info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {playing.title}
            </p>
            <p className="text-xs text-neutral-400">NewsroomX Daily Briefing</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md transition-transform hover:scale-105 active:scale-95"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
            </button>
            <button
              onClick={handleSkip}
              className="text-neutral-400 hover:text-white"
              aria-label="Skip"
            >
              <SkipForward className="size-4" />
            </button>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="text-neutral-400 hover:text-white"
              aria-label="Toggle queue"
            >
              <ChevronUp className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-1000"
            style={{ width: isPlaying ? "45%" : "30%" }}
          />
        </div>
      </div>
    </div>
  );
}
