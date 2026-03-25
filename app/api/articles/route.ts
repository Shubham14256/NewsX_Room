import { ZodError } from "zod";
import { getServerSession } from "next-auth";

import { apiFailure, apiSuccess, ApiError } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { articleFormSchema } from "@/lib/validators/article";

const ALLOWED_ROLES = ["ADMIN", "EDITOR", "REPORTER"] as const;

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 2;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: { category: true, author: true },
      orderBy: { created_at: "desc" },
    });
    return apiSuccess(articles, 200);
  } catch (error) {
    console.error("GET /api/articles failed:", error);
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role as (typeof ALLOWED_ROLES)[number])) {
    return apiFailure(new ApiError("Forbidden.", "FORBIDDEN", 403));
  }

  try {
    const body = await request.json();
    const parsed = articleFormSchema.parse(body);

    const slug = await uniqueSlug(parsed.slug);

    const newArticle = await prisma.article.create({
      data: {
        title: parsed.title,
        slug,
        summary: parsed.summary,
        content: parsed.content,
        imageUrl: parsed.imageUrl || null,
        // Always use session user — ignore any authorId from client payload
        authorId: session.user.id,
        categoryId: parsed.categoryId,
        is_breaking: parsed.is_breaking,
        seo_title: parsed.seo_title || null,
        seo_keywords: parsed.seo_keywords || null,
        published_at: new Date(),
      },
      include: { category: true, author: true },
    });

    return apiSuccess(newArticle, 201);
  } catch (error) {
    console.error("POST /api/articles failed:", error);
    if (error instanceof ZodError) {
      return apiFailure(new ApiError(error.issues[0]?.message ?? "Invalid payload.", "VALIDATION_ERROR", 400));
    }
    return apiFailure(error);
  }
}
