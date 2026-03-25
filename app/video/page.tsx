"use client";

import { useState } from "react";
import { Play, Clock, Eye, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

const FEATURED = {
  title: "पंतप्रधान मोदींचे राष्ट्राला संबोधन — नवीन आर्थिक धोरण जाहीर",
  duration: "18:42",
  views: "4.2M",
  category: "राजकारण",
  date: "आज, सकाळी ११:३०",
  thumb: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
};

const VIDEOS = [
  { id: "v1", title: "IPL 2025 Final Highlights: मुंबई vs चेन्नई — थरारक सामना", duration: "12:15", views: "8.1M", category: "क्रीडा", thumb: "https://images.unsplash.com/photo-1540747913346-19212a4b423e?auto=format&fit=crop&w=400&q=80" },
  { id: "v2", title: "Budget 2026 Analysis: तज्ज्ञांचे मत — काय स्वस्त, काय महाग?", duration: "09:33", views: "2.3M", category: "अर्थव्यवस्था", thumb: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80" },
  { id: "v3", title: "ISRO Chandrayaan-4 Launch: Live Coverage", duration: "45:20", views: "12.7M", category: "विज्ञान", thumb: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80" },
  { id: "v4", title: "Mumbai Rains 2025: City Under Water — Ground Report", duration: "06:48", views: "1.9M", category: "शहर", thumb: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=400&q=80" },
  { id: "v5", title: "AI Revolution: भारतातील Top 10 Startups", duration: "14:22", views: "3.4M", category: "तंत्रज्ञान", thumb: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=400&q=80" },
  { id: "v6", title: "Virat Kohli Interview: Career, Family आणि Future Plans", duration: "22:10", views: "15.6M", category: "क्रीडा", thumb: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80" },
];

const CATEGORIES = ["सर्व", "राजकारण", "क्रीडा", "अर्थव्यवस्था", "तंत्रज्ञान", "विज्ञान", "शहर"];

export default function VideoPage() {
  const [playing, setPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState("सर्व");

  const filtered = activeCategory === "सर्व" ? VIDEOS : VIDEOS.filter((v) => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-white">← NewsroomX</Link>
            <span className="text-neutral-700">/</span>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-red-600">
                <Play className="size-3 fill-white text-white" />
              </div>
              <h1 className="font-headline text-lg font-bold">Video News</h1>
            </div>
          </div>
          <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-bold text-red-400">
            🔴 LIVE NOW
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Featured player */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
          <div
            className="group relative cursor-pointer"
            style={{ aspectRatio: "16/9" }}
            onClick={() => setPlaying((p) => !p)}
          >
            {/* Thumbnail */}
            <img
              src={FEATURED.thumb}
              alt={FEATURED.title}
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Play button */}
            {!playing ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600 shadow-2xl shadow-red-600/50 transition-transform group-hover:scale-110">
                  <Play className="size-8 fill-white text-white translate-x-1" />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30">
                    <div className="flex gap-1.5">
                      <div className="h-6 w-1.5 animate-pulse rounded-full bg-white" />
                      <div className="h-6 w-1.5 animate-pulse rounded-full bg-white" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                  <p className="text-sm text-white/70">Playing...</p>
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="absolute bottom-4 right-4 rounded bg-black/80 px-2 py-1 font-mono text-sm text-white">
              {FEATURED.duration}
            </div>

            {/* Category */}
            <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
              {FEATURED.category}
            </div>
          </div>

          {/* Video info */}
          <div className="p-5">
            <h2 className="font-headline text-xl font-black leading-snug sm:text-2xl">
              {FEATURED.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
              <span className="flex items-center gap-1.5"><Eye className="size-4" /> {FEATURED.views} views</span>
              <span className="flex items-center gap-1.5"><Clock className="size-4" /> {FEATURED.date}</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="size-4 text-emerald-400" /> Trending #1</span>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-white text-neutral-900"
                  : "border border-white/20 text-neutral-400 hover:border-white/40 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition-all hover:border-white/20 hover:shadow-xl hover:shadow-black/50"
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <img
                  src={video.thumb}
                  alt={video.title}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 shadow-lg">
                    <Play className="size-5 fill-white text-white translate-x-px" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-xs text-white">
                  {video.duration}
                </div>
                <div className="absolute left-2 top-2 rounded bg-red-600/80 px-1.5 py-0.5 text-xs font-bold">
                  {video.category}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-headline text-sm font-bold leading-snug text-white line-clamp-2">
                  {video.title}
                </h3>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500">
                  <Eye className="size-3" /> {video.views}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
