import { CategoryManager } from "@/components/admin/category-manager";
import { prisma } from "@/lib/prisma";
import type { CategoryOption } from "@/types/news";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: CategoryOption[] = [];

  try {
    categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Failed to load categories page:", error);
  }

  return (
    <CategoryManager categories={categories} />
  );
}
