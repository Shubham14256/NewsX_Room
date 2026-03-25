import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiFailure, ApiError } from "@/lib/api-response";

// Known push service domains — prevents garbage endpoints
const ALLOWED_PUSH_HOSTS = [
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "notify.windows.com",
  "push.apple.com",
  "web.push.apple.com",
];

function isValidPushEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:") return false;
    return ALLOWED_PUSH_HOSTS.some((host) => url.hostname.endsWith(host));
  } catch {
    return false;
  }
}

const subscribeSchema = z.object({
  endpoint: z.string().url("Endpoint must be a valid URL."),
  keys: z.object({
    p256dh: z.string().min(10, "Invalid p256dh key."),
    auth: z.string().min(10, "Invalid auth key."),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return apiFailure(new ApiError(
        parsed.error.issues[0]?.message ?? "Invalid subscription payload.",
        "VALIDATION_ERROR",
        400,
      ));
    }

    const { endpoint, keys } = parsed.data;

    if (!isValidPushEndpoint(endpoint)) {
      return apiFailure(new ApiError(
        "Endpoint does not belong to a recognized push service.",
        "INVALID_ENDPOINT",
        400,
      ));
    }

    await prisma.pushSubscriber.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
    });

    return apiSuccess({ subscribed: true });
  } catch (error) {
    console.error("POST /api/push/subscribe failed:", error);
    return apiFailure(error);
  }
}
