"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerLiveUpdate } from "@/lib/pusher-server";

export async function createLiveEvent(title: string, slug: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Auto-suffix slug if duplicate
    let uniqueSlug = slug;
    let counter = 2;
    while (await prisma.liveEvent.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter++}`;
    }

    const event = await prisma.liveEvent.create({
      data: { title, slug: uniqueSlug },
    });
    revalidatePath("/admin/live");
    return { success: true, data: event };
  } catch (_e) {
    return { success: false, error: "Failed to create live event" };
  }
}

export async function endLiveEvent(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const event = await prisma.liveEvent.update({
      where: { id: eventId },
      data: { status: "ENDED" },
    });
    revalidatePath("/admin/live");
    return { success: true, data: event };
  } catch (_e) {
    return { success: false, error: "Failed to end live event" };
  }
}

export async function postLiveUpdate(
  eventId: string,
  content: string,
  isPinned = false,
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "EDITOR", "REPORTER"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const event = await prisma.liveEvent.findUnique({ where: { id: eventId } });
    if (!event) return { success: false, error: "Event not found" };
    if (event.status === "ENDED") return { success: false, error: "Event has ended" };

    const update = await prisma.liveUpdate.create({
      data: { content, isPinned, eventId },
    });

    // Fire-and-forget Pusher trigger — never blocks the response
    triggerLiveUpdate(event.slug, {
      id: update.id,
      content: update.content,
      isPinned: update.isPinned,
      createdAt: update.createdAt.toISOString(),
    }).catch(() => {
      // Pusher failure is non-fatal — readers will see update on next poll/refresh
    });

    revalidatePath(`/live/${event.slug}`);
    return { success: true, data: update };
  } catch (_e) {
    return { success: false, error: "Failed to post update" };
  }
}
