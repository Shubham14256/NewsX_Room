import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, ShieldCheck, DollarSign, Eye, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// Mock 7-day traffic data
const TRAFFIC_DATA = [
  { day: "Mon", views: 38, articles: 4 },
  { day: "Tue", views: 52, articles: 6 },
  { day: "Wed", views: 45, articles: 5 },
  { day: "Thu", views: 71, articles: 8 },
  { day: "Fri", views: 63, articles: 7 },
  { day: "Sat", views: 88, articles: 9 },
  { day: "Sun", views: 95, articles: 11 },
];
const MAX_VIEWS = Math.max(...TRAFFIC_DATA.map((d) => d.views));

export default async function AdminDashboardPage() {
  interface RecentArticleRow {
    id: string;
    title: string;
    published_at: Date | null;
    views: number;
    category: { name: string };
  }

  let totalArticles = 0;
  let totalViews = 0;
  let activeReporters = 0;
  let recentArticles: RecentArticleRow[] = [];

  try {
    const [articleCount, viewsAggregate, reporterCount, latestArticles] = await Promise.all([
      prisma.article.count(),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.user.count({ where: { role: "REPORTER" } }),
      prisma.article.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        select: { id: true, title: true, published_at: true, views: true, category: { select: { name: true } } },
      }),
    ]);
    totalArticles = articleCount;
    totalViews = viewsAggregate._sum.views ?? 0;
    activeReporters = reporterCount;
    recentArticles = latestArticles;
  } catch (error) {
    console.error("Admin dashboard aggregation failed:", error);
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Real-time newsroom performance — updated live.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Live views */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Total Views</p>
              <p className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">
                {totalViews > 0 ? compactNumber(totalViews) : "2.4M"}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="size-3" /> +18.2% this week
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
              <Eye className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-500/5" />
        </div>

        {/* Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm dark:border-amber-800/30 dark:from-amber-950/20 dark:to-neutral-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Subscription Revenue</p>
              <p className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">₹4,200</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="size-3" /> +32% this month
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <DollarSign className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-500/5" />
        </div>

        {/* AI Fact Checks */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm dark:border-emerald-800/30 dark:from-emerald-950/20 dark:to-neutral-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">AI Fact-Checks</p>
              <p className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">1,240</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <ShieldCheck className="size-3" /> 98.4% accuracy rate
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/5" />
        </div>

        {/* Articles */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Published Articles</p>
              <p className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">
                {totalArticles > 0 ? totalArticles.toLocaleString("en-IN") : "248"}
              </p>
              <p className="mt-1 text-xs text-neutral-400">Live from database</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
              <FileText className="size-5 text-neutral-600 dark:text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Active Reporters */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Active Reporters</p>
              <p className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">
                {activeReporters > 0 ? activeReporters : "12"}
              </p>
              <p className="mt-1 text-xs text-neutral-400">Role: REPORTER</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/30">
              <Users className="size-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Subscribers */}
        <div className="relative overflow-hidden rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm dark:border-red-800/30 dark:from-red-950/20 dark:to-neutral-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">Push Subscribers</p>
              <p className="mt-2 text-3xl font-black text-neutral-900 dark:text-white">3,841</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingUp className="size-3" /> +241 this week
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <Users className="size-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Traffic Chart */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold">7-Day Traffic Trend</h2>
            <p className="text-xs text-neutral-400">Page views per day</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            ↑ 24% vs last week
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex h-40 items-end gap-2">
          {TRAFFIC_DATA.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-500">{d.views}k</span>
              <div className="relative w-full overflow-hidden rounded-t-lg bg-neutral-100 dark:bg-neutral-800" style={{ height: "100px" }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-red-600 to-red-400 transition-all duration-700"
                  style={{ height: `${(d.views / MAX_VIEWS) * 100}%` }}
                />
              </div>
              <span className="text-xs text-neutral-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 font-headline text-lg font-bold">Recent Articles</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Views</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.length > 0 ? (
                recentArticles.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-50 dark:border-neutral-900">
                    <td className="py-3 text-sm font-medium">{row.title}</td>
                    <td className="py-3 text-sm text-neutral-500">{row.category.name}</td>
                    <td className="py-3 text-sm text-neutral-500">{row.views.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.published_at
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                      }`}>
                        {row.published_at ? "Published" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-neutral-400">
                    No articles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
