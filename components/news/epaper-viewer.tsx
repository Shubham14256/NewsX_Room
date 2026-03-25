"use client";

import { useState } from "react";
import { Download, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EPaper {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
}

interface EPaperViewerProps {
  editions: EPaper[];
}

export function EPaperViewer({ editions }: EPaperViewerProps) {
  const [activeId, setActiveId] = useState<string>(editions[0]?.id ?? "");

  const active = editions.find((e) => e.id === activeId) ?? editions[0];
  const past = editions.slice(1);

  if (!active) {
    return (
      <div className="py-20 text-center text-neutral-400">
        <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">No editions available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Today's / Active Edition Viewer */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
              {activeId === editions[0]?.id ? "Today's Edition" : "Selected Edition"}
            </p>
            <h2 className="mt-0.5 font-headline text-2xl font-black text-neutral-900 dark:text-white">
              {active.title}
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(
                new Date(active.date),
              )}
            </p>
          </div>
          <a href={active.pdfUrl} download target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 rounded-xl bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700">
              <Download size={15} />
              Download PDF
            </Button>
          </a>
        </div>

        {/* PDF Viewer */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          {/* Native object embed — works on desktop browsers */}
          <object
            data={active.pdfUrl}
            type="application/pdf"
            width="100%"
            className="hidden h-[800px] sm:block"
            aria-label={`PDF viewer for ${active.title}`}
          >
            {/* Fallback for mobile / unsupported browsers */}
            <MobileFallback pdfUrl={active.pdfUrl} title={active.title} />
          </object>

          {/* Always-visible mobile fallback (hidden on sm+) */}
          <div className="block sm:hidden">
            <MobileFallback pdfUrl={active.pdfUrl} title={active.title} />
          </div>
        </div>
      </section>

      {/* Past Editions */}
      {past.length > 0 && (
        <section>
          <h3 className="mb-4 font-headline text-lg font-bold text-neutral-900 dark:text-white">
            Past Editions
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {past.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setActiveId(ep.id)}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                  activeId === ep.id
                    ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600",
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-10 items-center justify-center rounded-md border-2",
                    activeId === ep.id
                      ? "border-red-400 bg-red-100 dark:border-red-600 dark:bg-red-900/40"
                      : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800",
                  )}
                  aria-hidden="true"
                >
                  <BookOpen
                    size={18}
                    className={
                      activeId === ep.id
                        ? "text-red-600 dark:text-red-400"
                        : "text-neutral-400 dark:text-neutral-500"
                    }
                  />
                </div>
                <div>
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-neutral-800 dark:text-neutral-200">
                    {ep.title}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                      new Date(ep.date),
                    )}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MobileFallback({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
        <BookOpen size={28} className="text-red-600 dark:text-red-400" />
      </div>
      <div>
        <p className="font-semibold text-neutral-800 dark:text-neutral-100">{title}</p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          PDF preview is not supported on this device.
        </p>
      </div>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        <ExternalLink size={15} />
        View Document
      </a>
    </div>
  );
}
