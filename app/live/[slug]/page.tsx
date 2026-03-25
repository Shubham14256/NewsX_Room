import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LiveFeed } from "@/components/news/live-feed";
import { Radio } from "lucide-react";

export default async function LiveEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.liveEvent
    .findUnique({
      where: { slug },
      include: {
        updates: { orderBy: { createdAt: "desc" } },
      },
    })
    .catch(() => null);

  if (!event) notFound();

  const serializedUpdates = event.updates.map((u) => ({
    id: u.id,
    content: u.content,
    isPinned: u.isPinned,
    createdAt: u.createdAt.toISOString(),
  }));

  const isActive = event.status === "ACTIVE";

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="mt-1">
          {isActive ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-red-950/40">
              <Radio className="size-3 animate-pulse" /> LIVE
            </span>
          ) : (
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800">
              ENDED
            </span>
          )}
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold leading-tight">
            {event.title}
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Started {new Date(event.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {isActive && (
        <p className="mb-4 text-xs text-neutral-500">
          This page updates in real-time. New updates appear at the top.
        </p>
      )}

      <LiveFeed
        eventSlug={slug}
        initialUpdates={serializedUpdates}
        isActive={isActive}
      />
    </main>
  );
}
