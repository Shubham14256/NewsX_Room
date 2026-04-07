"use client";

// ─── EPaper Elite Viewer ──────────────────────────────────────────────────────
// OpenSeadragon-powered deep zoom viewer for broadsheet E-Paper pages.
// Activates only when dziPages manifest URLs are present — falls back to the
// existing EPaperViewer automatically when they are not.
//
// Features:
//   - Deep zoom tiling via OpenSeadragon (pinch-to-zoom, pan, keyboard nav)
//   - Article clipping: tap a region to open the linked article
//   - Zero-breakage: renders nothing if OSD fails to load (catchError boundary)

import { useEffect, useRef, useState, useCallback } from "react";
import { unstable_catchError as catchError } from "next/error";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Maximize2, X, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EPaperRegion {
  id:        string;
  pageIndex: number;
  x:         number;   // 0.0–1.0 ratio
  y:         number;
  w:         number;
  h:         number;
  articleId: string | null;
  label:     string | null;
  article?:  { slug: string; title: string } | null;
}

interface EliteViewerProps {
  ePaperId:    string;
  title:       string;
  dziPages:    string[];          // manifest URLs per page
  regions:     EPaperRegion[];    // all clipping regions for this edition
  pageCount:   number;
}

// ─── Clipping overlay ─────────────────────────────────────────────────────────
// Rendered as an absolutely-positioned transparent layer over the OSD canvas.
// Hit detection is pure client-side ratio math — no server round-trip per tap.

interface ClipRegion extends EPaperRegion {
  // rendered pixel coords — computed from OSD viewport on each pan/zoom
  px: number; py: number; pw: number; ph: number;
}

// ─── Inner viewer ─────────────────────────────────────────────────────────────

function EliteViewerInner({
  ePaperId, title, dziPages, regions, pageCount,
}: EliteViewerProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const viewerRef     = useRef<OpenSeadragon.Viewer | null>(null);
  const [mounted,     setMounted]     = useState(false);
  const [pageIndex,   setPageIndex]   = useState(0);
  const [clipRegions, setClipRegions] = useState<ClipRegion[]>([]);
  const [activeClip,  setActiveClip]  = useState<EPaperRegion | null>(null);
  const [osdReady,    setOsdReady]    = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Initialise OpenSeadragon ──────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Dynamic import — OSD uses browser globals, must be client-only
    import("openseadragon").then((OSD) => {
      // Destroy previous instance on page change
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }

      const manifestUrl = dziPages[pageIndex];
      if (!manifestUrl) return;

      viewerRef.current = OSD.default({
        element:               containerRef.current!,
        prefixUrl:             "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
        tileSources:           manifestUrl,   // OSD fetches the .dzi XML, derives tile URLs itself
        showNavigationControl: false,
        gestureSettingsMouse:  { clickToZoom: false },
        gestureSettingsTouch:  { pinchToZoom: true, flickEnabled: true },
        minZoomLevel:          0.5,
        maxZoomLevel:          10,
        visibilityRatio:       0.8,
        animationTime:         0.4,
        springStiffness:       8,
        immediateRender:       false,
        maxImageCacheCount:    200,
        crossOriginPolicy:     "Anonymous",   // required for Vercel Blob CORS
        ajaxWithCredentials:   false,
      });

      viewerRef.current.addHandler("open", () => {
        setOsdReady(true);
        updateClipOverlay();
      });

      // Recompute clip overlay on every pan/zoom frame
      viewerRef.current.addHandler("animation", updateClipOverlay);
      viewerRef.current.addHandler("resize",    updateClipOverlay);
    });

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
      setOsdReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, pageIndex, dziPages]);

  // ── Compute pixel positions of clipping regions ───────────────────────────
  // Called on every animation frame — converts 0.0–1.0 ratios to screen px
  // using OSD's viewport → screen coordinate transform.
  const updateClipOverlay = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || !viewer.world.getItemCount()) return;

    const item      = viewer.world.getItemAt(0);
    const imgBounds = item.getBounds();          // image bounds in viewport coords
    const container = viewer.container;
    const rect      = container.getBoundingClientRect();

    const pageRegions = regions.filter((r) => r.pageIndex === pageIndex);

    const computed: ClipRegion[] = pageRegions.map((r) => {
      // Convert ratio coords → viewport coords → screen px
      const vpX = imgBounds.x + r.x * imgBounds.width;
      const vpY = imgBounds.y + r.y * imgBounds.height;
      const vpW = r.w * imgBounds.width;
      const vpH = r.h * imgBounds.height;

      const screenTL = viewer.viewport.viewportToViewerElementCoordinates(
        new (viewer.viewport.constructor as any).Point(vpX, vpY),
      );
      const screenBR = viewer.viewport.viewportToViewerElementCoordinates(
        new (viewer.viewport.constructor as any).Point(vpX + vpW, vpY + vpH),
      );

      return {
        ...r,
        px: screenTL.x,
        py: screenTL.y,
        pw: screenBR.x - screenTL.x,
        ph: screenBR.y - screenTL.y,
      };
    });

    setClipRegions(computed);
  }, [regions, pageIndex]);

  // ── OSD control helpers ───────────────────────────────────────────────────
  function zoomIn()   { viewerRef.current?.viewport.zoomBy(1.5); }
  function zoomOut()  { viewerRef.current?.viewport.zoomBy(0.67); }
  function resetZoom(){ viewerRef.current?.viewport.goHome(true); }

  function prevPage() {
    setPageIndex((i) => Math.max(0, i - 1));
    setActiveClip(null);
  }
  function nextPage() {
    setPageIndex((i) => Math.min(pageCount - 1, i + 1));
    setActiveClip(null);
  }

  if (!mounted) {
    return (
      <div className="flex h-[70vh] items-center justify-center rounded-2xl bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Viewer shell ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl"
           style={{ height: "75vh" }}>

        {/* OSD mount point */}
        <div ref={containerRef} className="absolute inset-0" />

        {/* Loading spinner — shown until OSD fires 'open' */}
        {!osdReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
          </div>
        )}

        {/* ── Clipping overlay ──────────────────────────────────────── */}
        {osdReady && clipRegions.map((region) => (
          <button
            key={region.id}
            onClick={() => setActiveClip(region)}
            aria-label={region.label ?? "Read article"}
            style={{
              position: "absolute",
              left:     region.px,
              top:      region.py,
              width:    region.pw,
              height:   region.ph,
            }}
            className="group border border-transparent transition-all hover:border-red-400/60 hover:bg-red-500/10"
          >
            {/* Clip indicator dot — top-left corner */}
            <span className="absolute left-1 top-1 hidden h-2 w-2 rounded-full bg-red-500 group-hover:block" />
          </button>
        ))}

        {/* ── Zoom controls ─────────────────────────────────────────── */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {[
            { icon: ZoomIn,    fn: zoomIn,    label: "Zoom in"    },
            { icon: ZoomOut,   fn: zoomOut,   label: "Zoom out"   },
            { icon: Maximize2, fn: resetZoom, label: "Reset zoom" },
          ].map(({ icon: Icon, fn, label }) => (
            <button
              key={label}
              onClick={fn}
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>

        {/* ── Page counter badge ────────────────────────────────────── */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
          <span className="font-mono text-xs font-semibold text-white/80">
            {pageIndex + 1} / {pageCount}
          </span>
        </div>
      </div>

      {/* ── Page navigation bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={prevPage}
          disabled={pageIndex === 0}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <ChevronLeft className="size-4" /> Prev
        </button>

        {/* Page dot strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setPageIndex(i); setActiveClip(null); }}
              aria-label={`Page ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === pageIndex
                  ? "w-6 bg-red-500"
                  : "w-1.5 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600",
              )}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={pageIndex === pageCount - 1}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Next <ChevronRight className="size-4" />
        </button>
      </div>

      {/* ── Article clip modal ────────────────────────────────────────── */}
      {activeClip && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveClip(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 md:left-1/2 md:top-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                <BookOpen className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <button
                onClick={() => setActiveClip(null)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="font-headline text-lg font-bold text-neutral-900 dark:text-white">
              {activeClip.article?.title ?? activeClip.label ?? "Read Article"}
            </p>

            {activeClip.article ? (
              <Link
                href={`/article/${activeClip.article.slug}`}
                onClick={() => setActiveClip(null)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                <BookOpen className="size-4" />
                Read Full Article
              </Link>
            ) : (
              <p className="mt-2 text-sm text-neutral-500">
                No article linked to this region yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────

function EliteFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[EPaperEliteViewer] Render error suppressed:", error.message);
  }
  // Return null — epaper-viewer.tsx fallback renders instead
  return null;
}

const EliteBoundary = catchError(EliteFallback);

export function EPaperEliteViewer(props: EliteViewerProps) {
  return (
    <EliteBoundary>
      <EliteViewerInner {...props} />
    </EliteBoundary>
  );
}
