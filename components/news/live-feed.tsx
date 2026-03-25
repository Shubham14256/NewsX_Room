"use client";

import { useEffect, useRef, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";

interface LiveUpdateItem {
  id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

interface Props {
  eventSlug: string;
  initialUpdates: LiveUpdateItem[];
  isActive: boolean;
}

export function LiveFeed({ eventSlug, initialUpdates, isActive }: Props) {
  const [updates, setUpdates] = useState<LiveUpdateItem[]>(initialUpdates);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const pusher = getPusherClient();
    if (!pusher) return; // Pusher not configured — static updates only

    const channel = pusher.subscribe(`live-${eventSlug}`);

    channel.bind("new-update", (data: LiveUpdateItem) => {
      setUpdates((prev) => [data, ...prev]);
      setNewIds((prev) => new Set(prev).add(data.id));
      // Remove highlight after animation
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(data.id);
          return next;
        });
      }, 3000);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`live-${eventSlug}`);
    };
  }, [eventSlug, isActive]);

  return (
    <div className="space-y-3">
      <div ref={topRef} />
      {updates.length === 0 && (
        <p className="text-sm text-neutral-400 text-center py-8">
          No updates yet. Stay tuned.
        </p>
      )}
      {updates.map((u) => (
        <div
          key={u.id}
          className={`rounded-lg border p-4 text-sm transition-colors duration-700 ${
            u.isPinned
              ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
              : newIds.has(u.id)
                ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
                : "border-neutral-200 dark:border-neutral-800"
          }`}
        >
          {u.isPinned && (
            <span className="mb-1.5 inline-block text-xs font-semibold text-amber-600">
              📌 Pinned
            </span>
          )}
          {newIds.has(u.id) && (
            <span className="mb-1.5 ml-2 inline-block text-xs font-semibold text-blue-600">
              NEW
            </span>
          )}
          <p className="leading-relaxed">{u.content}</p>
          <p className="mt-2 text-xs text-neutral-400">
            {new Date(u.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
