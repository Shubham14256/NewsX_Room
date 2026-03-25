"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

type PromptState = "idle" | "visible" | "loading" | "done" | "denied" | "unsupported";

export function PushSubscribePrompt() {
  const [state, setState] = useState<PromptState>("idle");

  useEffect(() => {
    // Must run client-side only
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setState("unsupported");
      return;
    }

    if (Notification.permission === "granted") {
      setState("done");
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    // Only show banner if user hasn't dismissed it this session
    const dismissed = sessionStorage.getItem("push-prompt-dismissed");
    if (!dismissed) {
      setState("visible");
    }
  }, []);

  async function handleEnable() {
    setState("loading");

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setState("denied");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      // Wait for SW to be ready
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        // No VAPID key in dev — SW registered but can't subscribe
        setState("done");
        toast.success("Notifications enabled (dev mode — no VAPID key)");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) throw new Error("Subscribe API failed");

      setState("done");
      toast.success("Breaking news alerts enabled!");
    } catch (err) {
      console.error("[push-subscribe]", err);
      setState("visible"); // revert so user can retry
      toast.error("Could not enable notifications. Please try again.");
    }
  }

  function handleDismiss() {
    sessionStorage.setItem("push-prompt-dismissed", "1");
    setState("idle");
  }

  if (state !== "visible" && state !== "loading") return null;

  return (
    <div
      role="banner"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 size-5 shrink-0 text-amber-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Get breaking news alerts instantly
          </p>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            We&apos;ll notify you when big stories break. No spam.
          </p>
          <button
            onClick={handleEnable}
            disabled={state === "loading"}
            className="mt-2 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-60 dark:bg-white dark:text-neutral-900"
          >
            {state === "loading" ? "Enabling…" : "Enable Notifications"}
          </button>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss notification prompt"
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

// Converts a base64 VAPID public key to Uint8Array for the PushManager API
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
