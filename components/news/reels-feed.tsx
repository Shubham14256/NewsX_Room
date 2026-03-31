"use client";

import { useEffect, useRef, useState } from "react";
import { unstable_catchError as catchError } from "next/error";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Reel {
  id: string;
  category: string;
  headline: string;
  summary: string;
  /** Unsplash image used as poster + background for the UI-illusion "video" */
  image: string;
  /** Real short .mp4 — set to "" to fall back to image-only mode */
  videoUrl: string;
  time: string;
  articleSlug: string;
  likes: number;
  comments: number;
}

interface ReelSlideProps {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

// ─── Category colour map ──────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  राजकारण:   "bg-red-600",
  तंत्रज्ञान: "bg-violet-600",
  क्रीडा:    "bg-emerald-600",
  अर्थव्यवस्था: "bg-amber-600",
  विज्ञान:   "bg-cyan-600",
  शहर:       "bg-orange-600",
  मनोरंजन:  "bg-pink-600",
};

// ─── Single Reel Slide ────────────────────────────────────────────────────────

function ReelSlide({ reel, isActive, isMuted, onToggleMute }: ReelSlideProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [liked,   setLiked]   = useState(false);
  const [likes,   setLikes]   = useState(reel.likes);
  const [visible, setVisible] = useState(true);

  // ── Play / pause driven by IntersectionObserver in parent ────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !reel.videoUrl) return;

    if (isActive) {
      // Autoplay requires muted — already enforced via the muted attribute
      video.play().catch(() => {
        // Autoplay blocked (e.g. desktop without interaction) — silently ignore
      });
    } else {
      video.pause();
      video.currentTime = 0; // reset so next view starts fresh
    }
  }, [isActive, reel.videoUrl]);

  // ── Mute sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  function handleLike() {
    setLiked((p) => !p);
    setLikes((p) => (liked ? p - 1 : p + 1));
  }

  async function handleShare() {
    const url = `${window.location.origin}/article/${reel.articleSlug}`;
    if (navigator.share) {
      await navigator.share({ title: reel.headline, url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(url).catch(() => null);
      toast.success("लिंक कॉपी झाली!");
    }
  }

  if (!visible) return null;

  const catColor = CAT_COLORS[reel.category] ?? "bg-neutral-700";

  return (
    <div
      // ── Scroll snap target ──────────────────────────────────────────────
      // contain:strict tells the browser this is an independent paint context
      // — it skips repainting off-screen slides during scroll entirely.
      className="relative flex-shrink-0"
      style={{
        height:           "100dvh",
        scrollSnapAlign:  "start",
        scrollSnapStop:   "always",  // prevents fast-swipe skipping slides
        contain:          "strict",
      }}
    >
      {/* ── Background: real video or image fallback ─────────────────── */}
      {reel.videoUrl ? (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.image}
          loop
          muted          // required for autoplay in all browsers
          playsInline    // required on iOS — prevents Safari fullscreen takeover
          preload="none" // critical: don't buffer all videos simultaneously
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${reel.image})` }}
          aria-hidden="true"
        />
      )}

      {/* ── Gradient layers ──────────────────────────────────────────── */}
      {/* Top: darkens for header legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
      {/* Bottom: darkens for headline legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-safe-top pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 shadow-lg">
            <span className="text-xs font-black text-white">N</span>
          </div>
          <div>
            <p className="text-xs font-bold text-white">NewsroomX</p>
            <p className="text-[10px] text-white/60">{reel.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="rounded-full bg-black/40 p-2 backdrop-blur-sm"
          >
            {isMuted
              ? <VolumeX className="size-4 text-white" />
              : <Volume2 className="size-4 text-white" />}
          </button>
          <Link
            href="/"
            aria-label="Close reels"
            className="rounded-full bg-black/40 p-2 backdrop-blur-sm"
          >
            <X className="size-4 text-white" />
          </Link>
        </div>
      </div>

      {/* ── Bottom-left: headline + summary + CTA ────────────────────── */}
      <div className="absolute bottom-0 left-0 right-16 px-4 pb-8">
        <span className={["inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white", catColor].join(" ")}>
          {reel.category}
        </span>
        <h2 className="mt-2 font-headline text-xl font-black leading-tight text-white sm:text-2xl">
          {reel.headline}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/75">
          {reel.summary}
        </p>
        <Link
          href={`/article/${reel.articleSlug}`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          <BookOpen className="size-3.5" />
          पूर्ण बातमी वाचा
        </Link>
      </div>

      {/* ── Right column: TikTok-style action buttons ─────────────────── */}
      <div className="absolute bottom-8 right-3 flex flex-col items-center gap-5">
        {/* Like */}
        <button
          onClick={handleLike}
          aria-label="Like"
          className="flex flex-col items-center gap-1"
        >
          <div className={[
            "flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-sm transition-all",
            liked ? "bg-red-500/80 scale-110" : "bg-black/40",
          ].join(" ")}>
            <Heart className={["size-5 transition-all", liked ? "fill-white text-white" : "text-white"].join(" ")} />
          </div>
          <span className="font-mono text-[10px] font-bold text-white/80">
            {likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes}
          </span>
        </button>

        {/* Comment */}
        <button
          aria-label="Comments"
          onClick={() => toast("टिप्पण्या लवकरच येतील!")}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <MessageCircle className="size-5 text-white" />
          </div>
          <span className="font-mono text-[10px] font-bold text-white/80">
            {reel.comments}
          </span>
        </button>

        {/* Share */}
        <button
          aria-label="Share"
          onClick={() => void handleShare()}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60">
            <Share2 className="size-5 text-white" />
          </div>
          <span className="font-mono text-[10px] font-bold text-white/80">
            शेअर
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Reels Feed (scroll container + IntersectionObserver) ─────────────────────

function ReelsFeedInner({ reels }: { reels: Reel[] }) {
  // ── SAFEGUARD: mounted guard ──────────────────────────────────────────────
  // Server renders a static skeleton. All browser APIs (IntersectionObserver,
  // video.play) are gated behind mounted=true.
  const [mounted,    setMounted]    = useState(false);
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [isMuted,    setIsMuted]    = useState(true);

  useEffect(() => { setMounted(true); }, []);

  // One ref per slide — populated by callback refs below
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── Single IntersectionObserver for all slides ────────────────────────────
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!mounted) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveIdx(idx);
          }
        }
      },
      {
        // 80% visibility threshold — slide must be mostly in view to activate
        threshold: 0.8,
      },
    );

    // Observe all slides
    slideRefs.current.forEach((el) => {
      if (el) observerRef.current!.observe(el);
    });

    // Cleanup: disconnect unconditionally on unmount
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [mounted]);

  // Server skeleton — dark screen with spinner
  if (!mounted) {
    return (
      <div className="flex h-dvh items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div
      // ── Scroll container ────────────────────────────────────────────────
      style={{
        height:          "100dvh",
        overflowY:       "scroll",
        scrollSnapType:  "y mandatory",
        scrollBehavior:  "smooth",
        // GPU-composited layer — prevents main-thread jank during scroll
        willChange:      "transform",
        // Prevent iOS Safari bounce from breaking snap
        WebkitOverflowScrolling: "touch",
      } as React.CSSProperties}
      aria-label="News Reels"
    >
      {reels.map((reel, idx) => (
        <div
          key={reel.id}
          ref={(el) => { slideRefs.current[idx] = el; }}
        >
          <ReelSlide
            reel={reel}
            isActive={idx === activeIdx}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((p) => !p)}
          />
        </div>
      ))}

      {/* Progress dots — right edge, vertically centred */}
      <div className="fixed right-1.5 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-1.5 sm:flex">
        {reels.map((_, idx) => (
          <div
            key={idx}
            className={[
              "rounded-full transition-all duration-300",
              idx === activeIdx
                ? "h-4 w-1.5 bg-white"
                : "h-1.5 w-1.5 bg-white/30",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Error boundary wrapper ───────────────────────────────────────────────────

function ReelsFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[ReelsFeed] Render error suppressed:", error.message);
  }
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-black text-white">
      <p className="text-sm text-white/60">Reels लोड करता आले नाहीत.</p>
      <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
        परत जा
      </Link>
    </div>
  );
}

const ReelsBoundary = catchError(ReelsFallback);

export function ReelsFeed({ reels }: { reels: Reel[] }) {
  return (
    <ReelsBoundary>
      <ReelsFeedInner reels={reels} />
    </ReelsBoundary>
  );
}
