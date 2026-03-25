"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-16 dark:bg-neutral-950">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 shadow-lg dark:bg-red-950/40">
            <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="font-headline text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          आमच्या newsroom मध्ये तांत्रिक अडचण आली आहे.
          <br />कृपया पुन्हा प्रयत्न करा किंवा मुख्यपृष्ठावर परत जा.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-neutral-400">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 sm:w-auto"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 sm:w-auto"
          >
            <Home className="size-4" />
            Go to Homepage
          </Link>
        </div>

        {/* Status indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            NewsroomX systems are operational — this is a temporary issue.
          </p>
        </div>
      </div>
    </main>
  );
}
