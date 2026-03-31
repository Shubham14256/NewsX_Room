import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EPaperViewer } from "@/components/news/epaper-viewer";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EPaperEdition {
  id:           string;
  title:        string;
  date:         string;   // ISO string — serialized from DateTime
  pdfUrl:       string;
  city:         string | null;
  thumbnailUrl: string | null;
  pageImages:   string[] | null;  // parsed from Json
  pageCount:    number | null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface EPaperPageProps {
  searchParams: Promise<{ edition?: string }>;
}

export default async function EPaperPortalPage({ searchParams }: EPaperPageProps) {
  const { edition: activeEditionId } = await searchParams;

  let editions: EPaperEdition[] = [];
  try {
    const raw = await prisma.ePaper.findMany({
      orderBy: { date: "desc" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any[];

    editions = raw.map((e) => ({
      id:           e.id,
      title:        e.title,
      date:         (e.date as Date).toISOString(),
      pdfUrl:       e.pdfUrl,
      city:         e.city ?? null,
      thumbnailUrl: e.thumbnailUrl ?? null,
      pageImages:   Array.isArray(e.pageImages) ? (e.pageImages as string[]) : null,
      pageCount:    e.pageCount ?? null,
    }));
  } catch (err) {
    console.error("EPaper fetch failed (DB cold start?):", err);
    // Render empty state gracefully — don't crash the page
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
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

      {editions.length === 0 ? (
        // ── Empty state ──────────────────────────────────────────────────────
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <Newspaper className="size-8 text-neutral-400" />
          </div>
          <div>
            <p className="font-headline text-lg font-bold text-neutral-700 dark:text-neutral-200">
              No editions available today
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              The admin panel will publish today's edition shortly. Check back soon.
            </p>
          </div>
        </div>
      ) : (
        // ── Viewer — wrapped in Suspense as required by useSearchParams docs ─
        <Suspense fallback={<ViewerSkeleton />}>
          <EPaperViewer
            editions={editions}
            initialEditionId={activeEditionId ?? null}
          />
        </Suspense>
      )}
    </main>
  );
}

function ViewerSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-[600px] rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  );
}
