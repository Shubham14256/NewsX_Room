import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CategoryOption } from "@/types/news";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let categoryOptions: CategoryOption[] = [];

  try {
    categoryOptions = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to load categories for editor:", error);
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Write Article</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Use the smart editor to draft and publish newsroom-ready content.
        </p>
      </div>
      {categoryOptions.length > 0 ? (
        <ArticleForm categories={categoryOptions} authorId={session.user.id} />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          No categories found. Please create a category first in Admin → Categories.
        </div>
      )}
    </section>
  );
}
