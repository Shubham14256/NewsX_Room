import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";

const VIDEOS = [
  {
    id: "v1",
    title: "पंतप्रधान मोदींचे महत्त्वपूर्ण भाषण — संसदेत नवीन विधेयक मांडले",
    duration: "04:32",
    category: "राजकारण",
    thumb: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=400&q=80",
    views: "2.1M",
  },
  {
    id: "v2",
    title: "IPL 2025: मुंबई इंडियन्सचा थरारक विजय — शेवटच्या चेंडूवर सामना जिंकला",
    duration: "06:15",
    category: "क्रीडा",
    thumb: "https://images.unsplash.com/photo-1540747913346-19212a4b423e?auto=format&fit=crop&w=400&q=80",
    views: "4.8M",
  },
  {
    id: "v3",
    title: "AI Revolution India: Infosys आणि TCS चे नवीन AI प्रकल्प जाहीर",
    duration: "03:48",
    category: "तंत्रज्ञान",
    thumb: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=400&q=80",
    views: "1.3M",
  },
  {
    id: "v4",
    title: "मुंबई पूर: BMC ची तातडीची बैठक — नागरिकांना सतर्कतेचा इशारा",
    duration: "02:55",
    category: "शहर",
    thumb: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=400&q=80",
    views: "890K",
  },
];

export function VideoNewsStrip() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 shadow-sm shadow-red-500/30">
            <Play className="size-4 fill-white text-white" />
          </div>
          <h2 className="font-headline text-xl font-bold text-neutral-900 dark:text-white">
            Video News
          </h2>
        </div>
        <Link
          href="/video"
          className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
        >
          सर्व पहा <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Video cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {VIDEOS.map((video) => (
          <Link
            key={video.id}
            href="/video"
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumb}
                alt={video.title}
                className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-32"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                  <Play className="size-4 fill-red-600 text-red-600 translate-x-px" />
                </div>
              </div>

              {/* Duration pill */}
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-xs text-white">
                {video.duration}
              </div>

              {/* Category */}
              <div className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                {video.category}
              </div>
            </div>

            {/* Info */}
            <div className="p-2.5">
              <h3 className="font-headline text-xs font-bold leading-snug text-neutral-900 line-clamp-2 dark:text-neutral-100">
                {video.title}
              </h3>
              <p className="mt-1 text-xs text-neutral-400">{video.views} views</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
