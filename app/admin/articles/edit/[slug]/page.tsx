import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";
import type { CategoryOption } from "@/types/news";

export const dynamic = "force-dynamic";

interface EditArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { slug } = await params;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        summary: true,
        content: true,
        imageUrl: true,
        categoryId: true,
        is_breaking: true,
        seo_title: true,
        seo_keywords: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }) as Promise<CategoryOption[]>,
  ]);

  if (!article) notFound();

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Edit Article</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Update and republish your article.
        </p>
      </div>
      <ArticleForm
        categories={categories}
        authorId={session.user.id}
        initialData={article}
      />
    </section>
  );
}
