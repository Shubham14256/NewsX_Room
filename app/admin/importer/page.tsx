import { ImporterForm } from "@/components/admin/importer-form";
import { prisma } from "@/lib/prisma";
import type { CategoryOption } from "@/types/news";

export const dynamic = "force-dynamic";

export default async function AdminImporterPage() {
  let categories: CategoryOption[] = [];

  try {
    categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Failed to load importer categories:", error);
  }

  return <ImporterForm categories={categories} />;
}
