import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWebPush } from "@/lib/web-push";
import { apiSuccess, apiFailure } from "@/lib/api-response";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return apiFailure("Unauthorized", 401);
  }

  const wp = getWebPush();
  if (!wp) {
    return apiFailure("Push notifications not configured (missing VAPID keys)", 503);
  }

  const body = (await request.json()) as {
    title?: string;
    message?: string;
    url?: string;
  };

  if (!body.title) {
    return apiFailure("title is required", 400);
  }

  const subscribers = await prisma.pushSubscriber.findMany();
  if (subscribers.length === 0) {
    return apiSuccess({ sent: 0, failed: 0 });
  }

  const payload = JSON.stringify({
    title: body.title,
    body: body.message ?? body.title,
    url: body.url ?? "/",
  });

  const results = await Promise.allSettled(
    subscribers.map(async (sub) => {
      try {
        await wp.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
      } catch (err: unknown) {
        // 410 Gone = subscription expired — clean it up
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          await prisma.pushSubscriber.delete({ where: { id: sub.id } }).catch(() => null);
        }
        throw err;
      }
    }),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return apiSuccess({ sent, failed });
}
