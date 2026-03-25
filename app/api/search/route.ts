import { type NextRequest } from "next/server";
import { apiSuccess, apiFailure } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";

    if (!q) {
      return apiSuccess([], 200);
    }

    const articles = await prisma.article.findMany({
      where: {
        published_at: { not: null },
        ...(category ? { category: { slug: category } } : {}),
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        imageUrl: true,
        published_at: true,
        views: true,
        is_breaking: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
      orderBy: { published_at: "desc" },
      take: 30,
    });

    return apiSuccess(articles, 200);
  } catch (error) {
    console.error("GET /api/search failed:", error);
    return apiFailure(error);
  }
}
