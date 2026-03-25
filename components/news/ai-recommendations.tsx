import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const MOCK_RECOMMENDATIONS = [
  {
    id: "rec-1",
    title: "भारताच्या अर्थव्यवस्थेत ऐतिहासिक वाढ: GDP ८.४% वर पोहोचला",
    category: "अर्थव्यवस्था",
    summary: "जागतिक मंदीच्या पार्श्वभूमीवर भारताने विक्रमी आर्थिक वाढ नोंदवली आहे.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80",
    readTime: "३ मिनिटे",
    slug: "/search?q=अर्थव्यवस्था",
  },
  {
    id: "rec-2",
    title: "ISRO चे नवीन मिशन: चंद्रावर पाणी शोधण्याची मोहीम",
    category: "विज्ञान",
    summary: "भारतीय अंतराळ संशोधन संस्थेने चंद्रयान-४ मोहिमेची घोषणा केली आहे.",
    imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80",
    readTime: "४ मिनिटे",
    slug: "/search?q=ISRO",
  },
  {
    id: "rec-3",
    title: "मुंबई मेट्रोचा विस्तार: नवीन ७ मार्ग मंजूर",
    category: "शहर",
    summary: "मुंबई महानगरपालिकेने मेट्रो नेटवर्कच्या विस्ताराला मंजुरी दिली आहे.",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80",
    readTime: "२ मिनिटे",
    slug: "/search?q=मुंबई+मेट्रो",
  },
];

export function AiRecommendations() {
  return (
    <section className="mt-10">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
          <Sparkles className="size-4 text-white" />
        </div>
        <h2 className="font-headline text-xl font-bold text-neutral-900 dark:text-white">
          AI Recommends For You
        </h2>
        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
          Personalized
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {MOCK_RECOMMENDATIONS.map((article) => (
          <Link
            key={article.id}
            href={article.slug}
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="relative h-36 w-full overflow-hidden">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">
                {article.readTime}
              </span>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                {article.category}
              </p>
              <h3 className="mt-1 font-headline text-sm font-bold leading-snug text-neutral-900 line-clamp-2 dark:text-neutral-100">
                {article.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                {article.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
        ✨ Powered by NewsroomX AI · Based on your reading history
      </p>
    </section>
  );
}
