import PusherJs from "pusher-js";

let _client: PusherJs | null = null;

export function getPusherClient(): PusherJs | null {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) return null;

  if (!_client) {
    _client = new PusherJs(key, { cluster });
  }
  return _client;
}
