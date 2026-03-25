import { z } from "zod";
import { getServerSession } from "next-auth";

import { generateArticleSeo, generateArticleSummary, rewriteArticle } from "@/lib/ai";
import { apiFailure, apiSuccess, ApiError } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchRSSFeed } from "@/lib/services/rss.service";
import { slugify } from "@/lib/slug";

const importerSchema = z.object({
  feedUrl: z.string().url("Please provide a valid RSS feed URL."),
  categoryId: z.string().min(1, "Category is required."),
  limit: z.number().int().min(1).max(2).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return apiFailure(new ApiError("Forbidden.", "FORBIDDEN", 403));
  }

  try {
    const body = await request.json();
    const parsed = importerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid importer payload.", "VALIDATION_ERROR", 400);
    }

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category) {
      throw new ApiError("Selected category does not exist.", "CATEGORY_NOT_FOUND", 404);
    }

    const author =
      (await prisma.user.findUnique({ where: { email: "admin@shubhstra.com" } })) ||
      (await prisma.user.findFirst({ where: { role: { in: ["ADMIN", "EDITOR", "REPORTER"] } } }));

    if (!author) {
      throw new ApiError(
        "No author account found. Seed admin user first via /api/seed-admin.",
        "AUTHOR_NOT_FOUND",
        400,
      );
    }

    const feedItems = await fetchRSSFeed(parsed.data.feedUrl, parsed.data.limit ?? 2);
    if (feedItems.length === 0) {
      throw new ApiError("No entries found in this feed.", "EMPTY_FEED", 404);
    }

    const createdArticles = [];

    for (const item of feedItems) {
      const sourceContent =
        item.snippet || `${item.title}. Read more: ${item.link}`;

      const rewritten = await rewriteArticle(sourceContent);
      const summary = await generateArticleSummary(rewritten);
      const seo = await generateArticleSeo(item.title, rewritten);
      const baseSlug = slugify(item.title);
      const uniqueSlug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const article = await prisma.article.create({
        data: {
          title: item.title,
          slug: uniqueSlug,
          summary,
          content: rewritten,
          authorId: author.id,
          categoryId: category.id,
          seo_title: seo.seo_title,
          seo_keywords: seo.seo_keywords,
          published_at: new Date(),
          is_breaking: false,
          imageUrl: null,
        },
        include: {
          author: true,
          category: true,
        },
      });

      createdArticles.push(article);
    }

    return apiSuccess(createdArticles, 201);
  } catch (error) {
    console.error("POST /api/importer failed:", error);
    return apiFailure(error);
  }
}

export const runtime = "nodejs";
