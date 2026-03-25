import { prisma } from "@/lib/prisma";
import { EPaperViewer } from "@/components/news/epaper-viewer";
import { Newspaper, Download, ExternalLink, Star } from "lucide-react";

export const dynamic = "force-dynamic";

const MOCK_EDITIONS = [
  {
    id: "mock-1",
    title: "NewsroomX — पुणे आवृत्ती",
    date: new Date().toISOString(),
    pdfUrl: "/epaper/preview/pune",
    city: "पुणे",
    pages: "16",
    edition: "सकाळी आवृत्ती",
  },
  {
    id: "mock-2",
    title: "NewsroomX — मुंबई आवृत्ती",
    date: new Date(Date.now() - 86400000).toISOString(),
    pdfUrl: "/epaper/preview/mumbai",
    city: "मुंबई",
    pages: "20",
    edition: "विशेष आवृत्ती",
  },
];

export default async function EPaperPortalPage() {
  const editions = await prisma.ePaper.findMany({
    orderBy: { date: "desc" },
    select: { id: true, title: true, date: true, pdfUrl: true },
  });

  const serialized = editions.map((e) => ({
    ...e,
    date: e.date.toISOString(),
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <header className="mb-8 flex items-center gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600">
          <Newspaper size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-headline text-3xl font-black text-neutral-900 dark:text-white">
            E-Paper
          </h1>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            Digital editions of NewsroomX — read, browse, and download.
          </p>
        </div>
      </header>

      {/* Always-visible hardcoded mock editions */}
      <div className="mb-10 space-y-6">
        <div className="flex items-center gap-2">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            आजच्या आवृत्त्या — {new Intl.DateTimeFormat("mr-IN", { dateStyle: "full" }).format(new Date())}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {MOCK_EDITIONS.map((ep) => (
            <div
              key={ep.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
            >
              {/* Newspaper thumbnail */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
                {/* Realistic newspaper layout mockup */}
                <div className="absolute inset-4 rounded-lg border border-neutral-300 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  {/* Masthead */}
                  <div className="mb-3 border-b-4 border-neutral-900 pb-2 dark:border-neutral-100">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-2/3 rounded bg-neutral-900 dark:bg-neutral-100" />
                      <div className="h-4 w-16 rounded bg-neutral-400 dark:bg-neutral-500" />
                    </div>
                    <div className="mt-1 h-2 w-full rounded bg-neutral-300 dark:bg-neutral-600" />
                  </div>
                  {/* Content columns */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1.5">
                      <div className="h-4 w-full rounded bg-neutral-800 dark:bg-neutral-200" />
                      <div className="h-3 w-5/6 rounded bg-neutral-300 dark:bg-neutral-600" />
                      <div className="h-3 w-4/5 rounded bg-neutral-300 dark:bg-neutral-600" />
                      <div className="mt-2 h-20 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-2 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-2 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-2 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-24 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-2 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-2 w-4/5 rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="mt-2 h-3 w-full rounded bg-neutral-800 dark:bg-neutral-200" />
                      <div className="h-2 w-3/4 rounded bg-neutral-300 dark:bg-neutral-600" />
                    </div>
                  </div>
                </div>
                {/* City badge */}
                <div className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  {ep.city}
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-neutral-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm dark:bg-white/20">
                  {ep.pages} पाने
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10" />
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      {ep.edition}
                    </p>
                    <h3 className="mt-1 font-headline text-xl font-black text-neutral-900 dark:text-white">
                      {ep.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {new Intl.DateTimeFormat("mr-IN", { dateStyle: "long" }).format(new Date(ep.date))}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    ✓ Live
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={ep.pdfUrl}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-red-500/20 transition-all hover:bg-red-700 hover:shadow-lg"
                  >
                    <ExternalLink className="size-4" />
                    📖 Read E-Paper
                  </a>
                  <a
                    href={ep.pdfUrl}
                    download
                    className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    title="Download PDF"
                  >
                    <Download className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider before real DB editions */}
      {serialized.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Past Editions</span>
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </div>
      )}

      {serialized.length > 0 && <EPaperViewer editions={serialized} />}
    </main>
  );
}

