/**
 * Web Push (VAPID) setup.
 *
 * Generate keys once with:
 *   npx web-push generate-vapid-keys
 *
 * Then add to .env:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey>
 *   VAPID_PRIVATE_KEY=<privateKey>
 *   VAPID_MAILTO=mailto:admin@yourdomain.com
 */
import webpush from "web-push";

let _configured = false;

export function getWebPush(): typeof webpush | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const mailto = process.env.VAPID_MAILTO ?? "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    if (!_configured) {
      console.warn(
        "[web-push] VAPID keys not set — push notifications disabled. " +
          "Run `npx web-push generate-vapid-keys` and add keys to .env.",
      );
      _configured = true;
    }
    return null;
  }

  if (!_configured) {
    webpush.setVapidDetails(mailto, publicKey, privateKey);
    _configured = true;
  }

  return webpush;
}
