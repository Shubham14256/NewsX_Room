"use client";

import { useState, useTransition } from "react";
import { Radio, Plus, Send, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { createLiveEvent, endLiveEvent, postLiveUpdate } from "@/app/actions/live.actions";
import type { LiveEvent, LiveUpdate } from "@prisma/client";

type EventWithUpdates = LiveEvent & { updates: LiveUpdate[] };

export function LiveDeskClient({ initialEvents }: { initialEvents: EventWithUpdates[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    initialEvents.find((e) => e.status === "ACTIVE")?.id ?? initialEvents[0]?.id ?? null,
  );
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  function handleTitleChange(v: string) {
    setNewTitle(v);
    setNewSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  }

  function handleCreate() {
    if (!newTitle.trim() || !newSlug.trim()) return;
    startTransition(async () => {
      const res = await createLiveEvent(newTitle.trim(), newSlug.trim());
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Live event created");
      setEvents((prev) => [res.data as EventWithUpdates, ...prev]);
      setSelectedEventId((res.data as LiveEvent).id);
      setNewTitle(""); setNewSlug("");
    });
  }

  function handleEnd(eventId: string) {
    startTransition(async () => {
      const res = await endLiveEvent(eventId);
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Event ended");
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status: "ENDED" } : e));
    });
  }

  function handlePost() {
    if (!selectedEventId || !updateContent.trim()) return;
    startTransition(async () => {
      const res = await postLiveUpdate(selectedEventId, updateContent.trim(), isPinned);
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Update posted");
      const update = res.data as LiveUpdate;
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEventId
            ? { ...e, updates: [update, ...e.updates] }
            : e,
        ),
      );
      setUpdateContent(""); setIsPinned(false);
    });
  }

  return (
    <div className="flex gap-6 p-6">
      {/* Left: event list + create */}
      <div className="w-72 shrink-0 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Radio className="size-5 text-red-500" /> Live Desk
        </h2>

        {/* Create new event */}
        <div className="rounded-lg border border-neutral-200 p-3 space-y-2 dark:border-neutral-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">New Event</p>
          <input
            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Event title"
            value={newTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          <input
            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="slug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
          />
          <button
            onClick={handleCreate}
            disabled={isPending || !newTitle.trim()}
            className="flex w-full items-center justify-center gap-1 rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            <Plus className="size-3.5" /> Create
          </button>
        </div>

        {/* Event list */}
        <div className="space-y-1">
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEventId(e.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedEventId === e.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="flex items-center gap-2">
                {e.status === "ACTIVE" && (
                  <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                )}
                <span className="truncate">{e.title}</span>
              </span>
              <span className="text-xs opacity-60">{e.status}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: update composer + feed */}
      {selectedEvent ? (
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{selectedEvent.title}</h3>
            {selectedEvent.status === "ACTIVE" && (
              <button
                onClick={() => handleEnd(selectedEvent.id)}
                disabled={isPending}
                className="flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                <StopCircle className="size-4" /> End Event
              </button>
            )}
          </div>

          {selectedEvent.status === "ACTIVE" && (
            <div className="rounded-lg border border-neutral-200 p-3 space-y-2 dark:border-neutral-800">
              <textarea
                rows={3}
                className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                placeholder="Write an update..."
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                  />
                  Pin this update
                </label>
                <button
                  onClick={handlePost}
                  disabled={isPending || !updateContent.trim()}
                  className="flex items-center gap-1 rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                >
                  <Send className="size-3.5" /> Post
                </button>
              </div>
            </div>
          )}

          {/* Updates feed */}
          <div className="space-y-2">
            {selectedEvent.updates.map((u) => (
              <div
                key={u.id}
                className={`rounded-lg border p-3 text-sm ${
                  u.isPinned
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {u.isPinned && (
                  <span className="mb-1 inline-block text-xs font-semibold text-amber-600">📌 Pinned</span>
                )}
                <p>{u.content}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(u.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-neutral-400">
          Select or create a live event
        </div>
      )}
    </div>
  );
}
