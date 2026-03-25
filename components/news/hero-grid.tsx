import Image from "next/image";
import Link from "next/link";

import type { ArticleCard } from "@/types/news";

interface HeroGridProps {
  featured: ArticleCard;
  trending: ArticleCard[];
}

export function HeroGrid({ featured, trending }: HeroGridProps) {
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
      <Link
        href={`/article/${featured.slug}`}
        className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="relative h-72 w-full sm:h-80 lg:h-full">
          <Image
            src={featured.imageUrl}
            alt={featured.title}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 z-10 p-5 text-white sm:p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-300">
            {featured.category}
          </p>
          <h1 className="font-headline text-2xl font-bold leading-tight sm:text-3xl">
            {featured.title}
          </h1>
          <p className="mt-3 line-clamp-2 text-sm text-neutral-200 sm:text-base">
            {featured.summary}
          </p>
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-4">
        {trending.map((article, idx) => (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            className={`group flex overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900 ${
              idx === 1
                ? "border-amber-400/50 bg-amber-500/5 dark:border-amber-600/30 dark:bg-amber-950/10"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <div className="relative h-28 w-32 shrink-0">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="128px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {idx === 1 && (
                <div className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-bold text-white shadow">
                  AD
                </div>
              )}
            </div>
            <div className="p-3">
              {idx === 1 ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  👑 Sponsored Partner Content
                </p>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                  {article.category}
                </p>
              )}
              <h2 className="mt-1 font-headline text-sm font-semibold leading-snug text-neutral-900 line-clamp-2 dark:text-neutral-100">
                {article.title}
              </h2>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                {article.publishedAt} • {article.views.toLocaleString()} views
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
