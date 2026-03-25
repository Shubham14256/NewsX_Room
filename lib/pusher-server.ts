import Pusher from "pusher";

function createPusherServer(): Pusher | null {
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    return null;
  }
  return new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
}

export const pusherServer = createPusherServer();

export async function triggerLiveUpdate(
  eventSlug: string,
  data: { id: string; content: string; isPinned: boolean; createdAt: string },
) {
  if (!pusherServer) {
    // No-op when Pusher is not configured — SSE/polling fallback handles it
    return;
  }
  await pusherServer.trigger(`live-${eventSlug}`, "new-update", data);
}
