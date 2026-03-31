"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft, ChevronRight, Download, BookOpen,
  MapPin, Calendar, FileText, ZoomIn, ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EPaperEdition } from "@/app/epaper/page";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EPaperViewerProps {
  editions:         EPaperEdition[];
  initialEditionId: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EPaperViewer({ editions, initialEditionId }: EPaperViewerProps) {
  const router   = useRouter();
  const pathname = usePathname();

  // Resolve active edition: URL param → first edition
  const resolveActive = (): EPaperEdition | null =>
    (initialEditionId ? editions.find((e) => e.id === initialEditionId) ?? null : null)
    ?? editions[0]
    ?? null;

  const [active,       setActive]       = useState<EPaperEdition | null>(resolveActive);
  const [pageIndex,    setPageIndex]    = useState(0);
  const [zoomed,       setZoomed]       = useState(false);

  // ── URL-driven edition switching ──────────────────────────────────────────
  // router.replace keeps the URL in sync without polluting history stack
  const selectEdition = useCallback((edition: EPaperEdition) => {
    setActive(edition);
    setPageIndex(0);   // always start at page 1 when switching editions
    setZoomed(false);
    const params = new URLSearchParams({ edition: edition.id });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]);

  if (!active) return null;

  const pages      = active.pageImages ?? [];
  const isV2       = pages.length > 0;
  const totalPages = isV2 ? pages.length : 0;
  const currentImg = pages[pageIndex] ?? null;

  function prevPage() { setPageIndex((i) => Math.max(0, i - 1)); }
  function nextPage() { setPageIndex((i) => Math.min(totalPages - 1, i + 1)); }

  return (
    <div className="space-y-8">

      {/* ── Active edition viewer ─────────────────────────────────────── */}
      <section>
        {/* Edition meta bar */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {active.id === editions[0]?.id ? "Latest Edition" : "Selected Edition"}
            </p>
            <h2 className="mt-0.5 font-headline text-2xl font-black text-neutral-900 dark:text-white">
              {active.title}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date(active.date))}
              </span>
              {active.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> {active.city}
                </span>
              )}
              {isV2 && (
                <span className="flex items-center gap-1">
                  <FileText className="size-3" /> {totalPages} pages
                </span>
              )}
            </div>
          </div>

          {/* Download button */}
          <a
            href={active.pdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/20 transition-all hover:bg-red-700 hover:shadow-lg"
          >
            <Download className="size-4" />
            Download PDF
          </a>
        </div>

        {/* ── V2: Image-array viewer ──────────────────────────────────── */}
        {isV2 && currentImg ? (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950 shadow-2xl dark:border-neutral-800">
            {/* Page image */}
            <div
              className={cn(
                "relative mx-auto transition-all duration-300",
                zoomed ? "max-w-none cursor-zoom-out" : "max-w-3xl cursor-zoom-in",
              )}
              style={{ minHeight: "60vh" }}
              onClick={() => setZoomed((z) => !z)}
            >
              <Image
                key={currentImg}
                src={currentImg}
                alt={`${active.title} — Page ${pageIndex + 1}`}
                width={1200}
                height={1600}
                className="h-auto w-full object-contain"
                priority={pageIndex === 0}
                unoptimized={currentImg.startsWith("blob:")}
              />

              {/* Zoom hint */}
              <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 backdrop-blur-sm">
                {zoomed
                  ? <ZoomOut className="size-4 text-white" />
                  : <ZoomIn  className="size-4 text-white" />}
              </div>
            </div>

            {/* Navigation bar */}
            <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900 px-4 py-3">
              <button
                onClick={prevPage}
                disabled={pageIndex === 0}
                aria-label="Previous page"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="size-4" /> Prev
              </button>

              {/* Page strip — thumbnail dots */}
              <div className="flex items-center gap-1.5 overflow-x-auto px-2">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setPageIndex(i); }}
                    aria-label={`Go to page ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-200",
                      i === pageIndex
                        ? "w-6 bg-red-500"
                        : "w-1.5 bg-neutral-600 hover:bg-neutral-400",
                    )}
                  />
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={pageIndex === totalPages - 1}
                aria-label="Next page"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Page counter */}
            <div className="bg-neutral-950 py-2 text-center">
              <span className="font-mono text-xs font-semibold text-neutral-500">
                Page {pageIndex + 1} of {totalPages}
              </span>
            </div>
          </div>
        ) : (
          // ── V1 legacy fallback: no pageImages, show PDF download ────────
          <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-neutral-200 bg-neutral-50 py-20 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
              <BookOpen className="size-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                {active.title}
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                This edition is available as a PDF download.
              </p>
            </div>
            <a
              href={active.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              <Download className="size-4" /> Open PDF
            </a>
          </div>
        )}
      </section>

      {/* ── Edition grid ──────────────────────────────────────────────── */}
      {editions.length > 1 && (
        <section>
          <h3 className="mb-4 font-headline text-lg font-bold text-neutral-900 dark:text-white">
            All Editions
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {editions.map((ed) => {
              const isActive = ed.id === active.id;
              return (
                <button
                  key={ed.id}
                  onClick={() => selectEdition(ed)}
                  aria-pressed={isActive}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-xl border text-left transition-all",
                    isActive
                      ? "border-red-400 shadow-md shadow-red-500/10 dark:border-red-600"
                      : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:hover:border-neutral-600",
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {ed.thumbnailUrl ? (
                      <Image
                        src={ed.thumbnailUrl}
                        alt={ed.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={ed.thumbnailUrl.startsWith("blob:")}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="size-8 text-neutral-300 dark:text-neutral-600" />
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-red-600/10" />
                    )}
                    {ed.pageCount && (
                      <div className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-white">
                        {ed.pageCount}p
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={cn(
                    "p-2.5",
                    isActive ? "bg-red-50 dark:bg-red-950/20" : "bg-white dark:bg-neutral-900",
                  )}>
                    {ed.city && (
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        isActive ? "text-red-600 dark:text-red-400" : "text-neutral-400",
                      )}>
                        {ed.city}
                      </p>
                    )}
                    <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug text-neutral-800 dark:text-neutral-200">
                      {ed.title}
                    </p>
                    <p className="mt-1 text-[10px] text-neutral-400">
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(ed.date))}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
