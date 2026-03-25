"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpiModal } from "@/components/payments/upi-modal";

const FREE_LIMIT = 3;
const READ_KEY = "readArticles";
const UNLOCKED_KEY = "unlockedArticles";

function getList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveList(key: string, list: string[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

interface PaywallGuardProps {
  slug: string;
  children: React.ReactNode;
}

export function PaywallGuard({ slug, children }: PaywallGuardProps) {
  // null = not yet determined (avoids hydration mismatch)
  const [status, setStatus] = useState<"loading" | "free" | "locked" | "unlocked">("loading");
  const [modalOpen, setModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const unlocked = getList(UNLOCKED_KEY);
    if (unlocked.includes(slug)) {
      setStatus("unlocked");
      return;
    }

    const read = getList(READ_KEY);
    if (read.includes(slug) || read.length < FREE_LIMIT) {
      // Count this read if not already counted
      if (!read.includes(slug)) {
        saveList(READ_KEY, [...read, slug]);
      }
      setStatus("free");
    } else {
      setStatus("locked");
    }
  }, [slug]);

  const handleSimulatePayment = useCallback(() => {
    setIsVerifying(true);
    setTimeout(() => {
      const unlocked = getList(UNLOCKED_KEY);
      if (!unlocked.includes(slug)) {
        saveList(UNLOCKED_KEY, [...unlocked, slug]);
      }
      setIsVerifying(false);
      setModalOpen(false);
      setStatus("unlocked");
      toast.success("Payment successful! Article unlocked.", {
        description: "You now have lifetime access to this article.",
      });
    }, 1500);
  }, [slug]);

  // Avoid rendering anything until we've read localStorage (prevents hydration mismatch)
  if (status === "loading") {
    return (
      <div className="mt-8 space-y-4 animate-pulse" aria-hidden="true">
        <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
    );
  }

  if (status === "free" || status === "unlocked") {
    return <>{children}</>;
  }

  // Locked state
  return (
    <>
      <div className="relative">
        {/* Blurred content preview */}
        <div className="max-h-[300px] overflow-hidden">
          {children}
        </div>

        {/* Gradient fade */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80"
          aria-hidden="true"
        />

        {/* Paywall overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-6">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white/95 px-6 py-6 text-center shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <Lock size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              You&apos;ve reached your free article limit.
            </h3>
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              You&apos;ve read {FREE_LIMIT} free articles this session. Unlock this one for just ₹5.
            </p>
            <Button
              onClick={() => setModalOpen(true)}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-600 dark:to-teal-600"
              size="lg"
            >
              🔓 Unlock this article for ₹5 (UPI)
            </Button>
            <p className="mt-2.5 text-xs text-neutral-400 dark:text-neutral-500">
              One-time payment · Instant access · No subscription
            </p>
          </div>
        </div>
      </div>

      <UpiModal
        slug={slug}
        isOpen={modalOpen}
        isVerifying={isVerifying}
        onClose={() => !isVerifying && setModalOpen(false)}
        onSimulatePayment={handleSimulatePayment}
      />
    </>
  );
}
