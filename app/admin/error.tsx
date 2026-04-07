"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40">
            <AlertTriangle className="size-7 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h2 className="font-headline text-xl font-black text-neutral-900 dark:text-white">
          Admin Panel Error
        </h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          This section encountered an error. Your data is safe — this is a UI issue only.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-neutral-400">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 sm:w-auto"
          >
            <RefreshCw className="size-4" /> Retry
          </button>
          <Link
            href="/admin"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 sm:w-auto"
          >
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
