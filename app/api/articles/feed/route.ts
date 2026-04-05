import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiFailure, ApiError } from "@/lib/api-response";
import type { ArticleCard } from "@/types/news";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 8;
const MAX_LIMIT     = 20;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80";

// ─── Response shape ───────────────────────────────────────────────────────────

export interface FeedResponse {
  articles:   ArticleCard[];
  nextCursor: string | null; // ISO string of last article's published_at, or null = end of feed
}

// ─── GET /api/articles/feed ───────────────────────────────────────────────────
// Query params:
//   cursor  — ISO date string (published_at of the last article seen)
//             Omit on first load; the SSR page handles that.
//   limit   — number of articles to return (default 8, max 20)
//
// Pagination strategy: CURSOR-BASED on published_at (already indexed).
// Never uses SKIP/OFFSET — performance is O(log n) regardless of depth.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const cursorParam = searchParams.get("cursor");
    const limitParam  = searchParams.get("limit");

    // Validate limit
    const limit = Math.min(
      Math.max(parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );

    // Validate cursor — must be a parseable ISO date if provided
    let cursorDate: Date | undefined;
    if (cursorParam) {
      const parsed = new Date(cursorParam);
      if (isNaN(parsed.getTime())) {
        throw new ApiError("Invalid cursor value.", "VALIDATION_ERROR", 400);
      }
      cursorDate = parsed;
    }

    const articles = await prisma.article.findMany({
      where: {
        published_at: {
          not: null,
          // Cursor: fetch articles published BEFORE the cursor date.
          // This is the core of cursor-based pagination — no SKIP, no COUNT.
          ...(cursorDate ? { lt: cursorDate } : {}),
        },
      },
      select: {
        id:           true,
        title:        true,
        slug:         true,
        summary:      true,
        imageUrl:     true,
        published_at: true,
        views:        true,
        is_breaking:  true,
        category:     { select: { name: true } },
        author:       { select: { name: true } },
      },
      orderBy: { published_at: "desc" },
      take:    limit,
    });

    // Serialize to ArticleCard shape — identical to what app/page.tsx produces
    const articleCards: ArticleCard[] = articles.map((a) => ({
      id:          a.id,
      title:       a.title,
      slug:        a.slug,
      summary:     a.summary,
      category:    a.category.name,
      imageUrl:    a.imageUrl ?? FALLBACK_IMAGE,
      publishedAt: a.published_at
        ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(a.published_at)
        : "Just now",
      views:       a.views,
      isBreaking:  a.is_breaking,
    }));

    // nextCursor: published_at of the last article in this batch.
    // null signals end-of-feed — client disconnects the observer.
    const lastArticle = articles[articles.length - 1];
    const nextCursor: string | null =
      articles.length === limit && lastArticle?.published_at
        ? lastArticle.published_at.toISOString()
        : null;

    const response: FeedResponse = { articles: articleCards, nextCursor };
    return apiSuccess(response, 200);

  } catch (error) {
    console.error("GET /api/articles/feed failed:", error);
    return apiFailure(error);
  }
}
