"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Loader2, ChevronDown } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface SearchArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  published_at: string | null;
  views: number;
  is_breaking: boolean;
  category: { name: string; slug: string };
  author: { name: string };
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

const DATE_RANGES = [
  { value: "all", label: "All Time" },
  { value: "24h", label: "Past 24 Hours" },
  { value: "week", label: "Past Week" },
  { value: "month", label: "Past Month" },
];

const SORT_OPTIONS = [
  { value: "latest", label: "Latest First" },
  { value: "popular", label: "Most Popular" },
  { value: "relevant", label: "Most Relevant" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [results, setResults] = useState<SearchArticle[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCategories(json.data as CategoryOption[]);
      })
      .catch(() => {});
  }, []);

  const runSearch = useCallback(async (q: string, cat: string) => {
    if (!q.trim()) {
      setResults([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const params = new URLSearchParams({ q });
      if (cat) params.set("category", cat);
      const res = await fetch(`/api/search?${params.toString()}`);
      const json = await res.json();
      setResults(json.success ? (json.data as SearchArticle[]) : []);
    } catch {
      setResults([]);
    } finally {
      setStatus("done");
    }
  }, []);

  useEffect(() => {
    void runSearch(debouncedQuery, category);
  }, [debouncedQuery, category, runSearch]);

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search bar */}
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-black text-neutral-900 dark:text-white">
          Search
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Find articles by keyword, topic, or category.
        </p>

        <div className="mt-5 space-y-3">
          {/* Main search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search headlines, topics..."
                className={cn(
                  "w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none",
                  "transition-shadow focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200",
                  "dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-800",
                )}
                aria-label="Search articles"
              />
            </div>
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                showFilters
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
              )}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className={`size-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Date range */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    {DATE_RANGES.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sort by */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Sort By
                  </label>
                  <div className="flex overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSortBy(s.value)}
                        className={cn(
                          "flex-1 py-2 text-xs font-semibold transition-colors",
                          sortBy === s.value
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                            : "bg-white text-neutral-500 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700",
                        )}
                      >
                        {s.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active filters summary */}
              {(dateRange !== "all" || category || sortBy !== "latest") && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-neutral-400">Active:</span>
                  {dateRange !== "all" && (
                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {DATE_RANGES.find((d) => d.value === dateRange)?.label}
                    </span>
                  )}
                  {category && (
                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {categories.find((c) => c.slug === category)?.name ?? category}
                    </span>
                  )}
                  <button
                    onClick={() => { setDateRange("all"); setCategory(""); setSortBy("latest"); }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* States */}
      {status === "loading" && (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <Loader2 size={24} className="animate-spin" />
          <span className="ml-3 text-sm">Searching...</span>
        </div>
      )}

      {status === "done" && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-200 py-20 text-center dark:border-neutral-700">
          <p className="text-2xl">🔍</p>
          <p className="mt-3 font-semibold text-neutral-700 dark:text-neutral-200">
            No results for &ldquo;{debouncedQuery}&rdquo;
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            Try different keywords or remove the category filter.
          </p>
        </div>
      )}

      {status === "idle" && !hasQuery && (
        <div className="rounded-xl border border-dashed border-neutral-200 py-20 text-center dark:border-neutral-700">
          <p className="text-2xl">📰</p>
          <p className="mt-3 text-sm text-neutral-400">
            Start typing to search across all published articles.
          </p>
        </div>
      )}

      {status === "done" && results.length > 0 && (
        <div className="space-y-1">
          <p className="mb-4 text-xs text-neutral-400">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{debouncedQuery}&rdquo;
          </p>
          {results.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className={cn(
                "group flex gap-4 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
                "dark:border-neutral-800 dark:bg-neutral-900",
              )}
            >
              {article.imageUrl && (
                <div
                  className="hidden h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:block dark:bg-neutral-800"
                  style={{
                    backgroundImage: `url(${article.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    {article.category.name}
                  </span>
                  {article.is_breaking && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      Breaking
                    </span>
                  )}
                </div>
                <h2 className="mt-1.5 font-headline text-base font-bold leading-snug text-neutral-900 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-400">
                  {article.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {article.summary}
                </p>
                <p className="mt-2 text-xs text-neutral-400">
                  {article.author.name}
                  {article.published_at
                    ? ` · ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(article.published_at))}`
                    : ""}
                  {` · ${article.views.toLocaleString()} views`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
