import { type NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { apiSuccess, apiFailure, ApiError } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchArticleSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  summary: z.string().min(20, "Summary must be at least 20 characters."),
  content: z.string().min(50, "Content must be at least 50 characters."),
  imageUrl: z.union([z.string().url("Please enter a valid image URL."), z.literal("")]).optional(),
  categoryId: z.string().min(1, "Category is required."),
  is_breaking: z.boolean().default(false),
  seo_title: z.string().optional(),
  seo_keywords: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return apiFailure(new ApiError("Forbidden.", "FORBIDDEN", 403));
  }

  try {
    const { slug } = await params;

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing) {
      throw new ApiError("Article not found.", "NOT_FOUND", 404);
    }

    const body = await request.json();
    const parsed = patchArticleSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        parsed.error.issues[0]?.message ?? "Invalid payload.",
        "VALIDATION_ERROR",
        400,
      );
    }

    const updated = await prisma.article.update({
      where: { slug },
      data: {
        title: parsed.data.title,
        summary: parsed.data.summary,
        content: parsed.data.content,
        imageUrl: parsed.data.imageUrl || null,
        categoryId: parsed.data.categoryId,
        is_breaking: parsed.data.is_breaking,
        seo_title: parsed.data.seo_title || null,
        seo_keywords: parsed.data.seo_keywords || null,
      },
      include: { category: true, author: true },
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("PATCH /api/articles/[slug] failed:", error);
    return apiFailure(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return apiFailure(new ApiError("Forbidden.", "FORBIDDEN", 403));
  }

  try {
    const { slug } = await params;

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing) {
      throw new ApiError("Article not found.", "NOT_FOUND", 404);
    }

    await prisma.article.delete({ where: { slug } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/articles/[slug] failed:", error);
    return apiFailure(error);
  }
}
