import Image from "next/image";
import Link from "next/link";
import { Eye, TrendingUp } from "lucide-react";
import type { ArticleCard } from "@/types/news";

interface ArticleListCardProps {
  article: ArticleCard;
}

export function ArticleListCard({ article }: ArticleListCardProps) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className={[
        "group flex gap-3 overflow-hidden rounded-xl border bg-white",
        "transition-all hover:shadow-md",
        "dark:bg-neutral-900",
        article.isBreaking
          ? "border-red-200 dark:border-red-800/50"
          : "border-neutral-200 dark:border-neutral-800",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div className="relative h-24 w-28 shrink-0 overflow-hidden sm:h-28 sm:w-36">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 112px, 144px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {article.isBreaking && (
          <div className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-white">
            Breaking
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-3 pr-3">
        <div>
          {/* Category */}
          <p className="border-l-2 border-red-600 pl-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            {article.category}
          </p>

          {/* Headline */}
          <h3 className="mt-1 font-headline text-sm font-bold leading-snug text-neutral-900 line-clamp-2 group-hover:text-red-700 dark:text-neutral-100 dark:group-hover:text-red-400 sm:text-base">
            {article.title}
          </h3>

          {/* Summary — hidden on very small screens */}
          <p className="mt-1 hidden text-xs leading-relaxed text-neutral-500 line-clamp-1 dark:text-neutral-400 sm:block">
            {article.summary}
          </p>
        </div>

        {/* Meta row */}
        <div className="mt-2 flex items-center gap-3 text-[10px] text-neutral-400">
          <span>{article.publishedAt}</span>
          <span className="flex items-center gap-0.5">
            <Eye className="size-3" />
            {article.views.toLocaleString("en-IN")}
          </span>
          {article.views > 10_000 && (
            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3" />
              Trending
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
