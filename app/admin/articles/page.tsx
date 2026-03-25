import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleListClient } from "./article-list-client";

export default async function AllArticlesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const articles = await prisma.article
    .findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        published_at: true,
        is_breaking: true,
        views: true,
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    })
    .catch(() => []);

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="font-headline text-2xl font-bold">All Articles</h1>
      <ArticleListClient articles={articles} />
    </section>
  );
}
