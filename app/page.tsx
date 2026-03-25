import { Navbar } from "@/components/layout/navbar";
import { BreakingNewsTicker } from "@/components/news/breaking-news-ticker";
import { HeroGrid } from "@/components/news/hero-grid";
import { VideoNewsStrip } from "@/components/news/video-news-strip";
import { getNavSections } from "@/lib/navigation";
import { getBreakingNews, getPublishedArticles } from "@/lib/services/article.service";
import { prisma } from "@/lib/prisma";
import { Radio, Zap } from "lucide-react";
import Link from "next/link";
import type { ArticleCard, BreakingUpdate } from "@/types/news";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80";

function formatRelativeDate(value: Date | null): string {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value);
}

export default async function Home() {
  type PublishedArticle = Awaited<ReturnType<typeof getPublishedArticles>>[number];
  type BreakingArticle = Awaited<ReturnType<typeof getBreakingNews>>[number];

  let publishedArticles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  let breakingArticles: Awaited<ReturnType<typeof getBreakingNews>> = [];
  let liveEvents: { id: string; title: string; slug: string }[] = [];

  try {
    [publishedArticles, breakingArticles, liveEvents] = await Promise.all([
      getPublishedArticles(8),
      getBreakingNews(),
      prisma.liveEvent.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true },
        take: 5,
      }),
    ]);
  } catch (error) {
    console.error("Homepage article fetch failed:", error);
    publishedArticles = [];
    breakingArticles = [];
    liveEvents = [];
  }

  const navSections = await getNavSections();

  const articleCards: ArticleCard[] = publishedArticles.map((article: PublishedArticle) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    category: article.category.name,
    imageUrl: article.imageUrl || FALLBACK_IMAGE,
    publishedAt: formatRelativeDate(article.published_at),
    views: article.views,
    isBreaking: article.is_breaking,
  }));

  const breakingUpdates: BreakingUpdate[] = breakingArticles.map((article: BreakingArticle) => ({
    id: article.id,
    headline: article.title,
    href: `/article/${article.slug}`,
  }));

  const featuredArticle = articleCards[0];
  const trendingArticles = articleCards.slice(1, 4);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar sections={navSections} />
      <BreakingNewsTicker updates={breakingUpdates} />

      {/* Leaderboard Ad Slot */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900">
          <span className="font-mono text-xs text-neutral-400">[ Advertisement · 728×90 · Google AdSense ]</span>
        </div>
      </div>

      {liveEvents.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {liveEvents.map((event) => (
              <Link
                key={event.id}
                href={`/live/${event.slug}`}
                className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
              >
                <Radio className="size-3.5 animate-pulse" />
                LIVE: {event.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Web Stories entry point */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <Link
            href="/stories"
            className="group flex shrink-0 flex-col items-center gap-1.5"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400 p-0.5 shadow-lg ring-2 ring-red-500/30 transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-neutral-950">
                <Zap className="size-6 fill-orange-400 text-orange-400" />
              </div>
            </div>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Stories</span>
          </Link>
          {["राजकारण", "क्रीडा", "तंत्रज्ञान", "मनोरंजन", "व्यापार"].map((label, i) => (
            <Link
              key={label}
              href="/stories"
              className="group flex shrink-0 flex-col items-center gap-1.5"
            >
              <div
                className="relative h-16 w-16 overflow-hidden rounded-full p-0.5 shadow-md ring-2 ring-neutral-300/50 transition-transform group-hover:scale-105 dark:ring-neutral-700/50"
                style={{
                  background: [
                    "linear-gradient(135deg,#667eea,#764ba2)",
                    "linear-gradient(135deg,#f093fb,#f5576c)",
                    "linear-gradient(135deg,#4facfe,#00f2fe)",
                    "linear-gradient(135deg,#43e97b,#38f9d7)",
                    "linear-gradient(135deg,#fa709a,#fee140)",
                  ][i],
                }}
              >
                <div className="h-full w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <main className="pb-8">
        {featuredArticle ? (
          <HeroGrid featured={featuredArticle} trending={trendingArticles} />
        ) : (
          <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h1 className="font-headline text-2xl font-bold">No articles published yet</h1>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Start publishing from the admin panel to see live stories here.
              </p>
            </div>
          </section>
        )}
        <VideoNewsStrip />
      </main>
    </div>
  );
}
