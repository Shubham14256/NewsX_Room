import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { HeroGrid } from "@/components/news/hero-grid";
import { getNavSections } from "@/lib/navigation";
import { getArticlesByCategorySlug } from "@/lib/services/article.service";
import type { ArticleCard } from "@/types/news";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatDate(value: Date | null): string {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [navSections, categoryArticles] = await Promise.all([
    getNavSections(),
    getArticlesByCategorySlug(slug),
  ]);

  if (!categoryArticles.length) notFound();

  const cards: ArticleCard[] = categoryArticles.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    category: article.category.name,
    imageUrl: article.imageUrl || FALLBACK_IMAGE,
    publishedAt: formatDate(article.published_at),
    views: article.views,
    isBreaking: article.is_breaking,
  }));

  const categoryName = categoryArticles[0]?.category.name ?? "";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar sections={navSections} />
      <main className="pb-8">
        <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <h1 className="font-headline text-3xl font-bold capitalize tracking-tight">
            {categoryName}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Latest stories and updates from the {categoryName} desk.
          </p>
        </section>

        {/* HeroGrid needs at least 2 articles (1 featured + 1 trending) */}
        {cards.length >= 2 ? (
          <HeroGrid featured={cards[0]} trending={cards.slice(1, 4)} />
        ) : (
          /* Single article fallback — clean card layout */
          <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                      {article.category}
                    </p>
                    <h2 className="mt-1 font-headline text-base font-bold leading-snug text-neutral-900 dark:text-neutral-100">
                      {article.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {article.summary}
                    </p>
                    <p className="mt-2 text-xs text-neutral-400">
                      {article.publishedAt} · {article.views.toLocaleString()} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
