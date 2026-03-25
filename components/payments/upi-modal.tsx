"use client";

import { useEffect, useRef } from "react";
import { Loader2, QrCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UpiModalProps {
  slug: string;
  isOpen: boolean;
  isVerifying: boolean;
  onClose: () => void;
  onSimulatePayment: () => void;
}

export function UpiModal({
  isOpen,
  isVerifying,
  onClose,
  onSimulatePayment,
}: UpiModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upi-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Secure Payment
            </p>
            <h2
              id="upi-modal-title"
              className="mt-0.5 text-lg font-bold text-neutral-900 dark:text-white"
            >
              Unlock Article · ₹5
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close payment modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center gap-5 px-6 py-6">
          {/* Mock QR */}
          <div className="flex h-44 w-44 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
            <QrCode size={80} className="text-neutral-300 dark:text-neutral-600" />
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
              Mock QR Code
            </p>
          </div>

          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Scan with{" "}
            <span className="font-semibold text-neutral-700 dark:text-neutral-200">
              PhonePe / GPay / Paytm
            </span>
          </p>

          <div className="w-full rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Amount</span>
              <span className="font-bold text-neutral-900 dark:text-white">₹5.00</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Access</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Lifetime unlock</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
          <Button
            onClick={onSimulatePayment}
            disabled={isVerifying}
            className={cn(
              "w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700",
              "h-11 rounded-xl text-sm font-semibold",
            )}
          >
            {isVerifying ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying payment...
              </>
            ) : (
              "Simulate Payment Success"
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
            🔒 256-bit encrypted · Demo environment
          </p>
        </div>
      </div>
    </div>
  );
}
