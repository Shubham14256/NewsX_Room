import { z } from "zod";
import { getServerSession } from "next-auth";
import { apiFailure, apiSuccess, ApiError } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return apiSuccess(categories, 200);
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return apiFailure(new ApiError("Forbidden.", "FORBIDDEN", 403));
  }

  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid payload.", "VALIDATION_ERROR", 400);
    }

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name.trim(),
        slug: slugify(parsed.data.slug),
      },
    });

    return apiSuccess(category, 201);
  } catch (error) {
    console.error("POST /api/categories failed:", error);
    return apiFailure(error);
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN"].includes(session.user.role)) {
    return apiFailure(new ApiError("Forbidden. Only ADMIN can delete categories.", "FORBIDDEN", 403));
  }

  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      throw new ApiError("Category ID is required.", "VALIDATION_ERROR", 400);
    }

    // Check if any articles are attached
    const articleCount = await prisma.article.count({ where: { categoryId: body.id } });
    if (articleCount > 0) {
      throw new ApiError(
        `Cannot delete — ${articleCount} article${articleCount !== 1 ? "s" : ""} still use this category. Reassign them first.`,
        "CATEGORY_IN_USE",
        409,
      );
    }

    await prisma.category.delete({ where: { id: body.id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/categories failed:", error);
    return apiFailure(error);
  }
}
