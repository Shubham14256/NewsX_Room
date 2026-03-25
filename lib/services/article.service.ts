import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const articleInclude = {
  author: true,
  category: true,
} satisfies Prisma.ArticleInclude;

export async function getPublishedArticles(limit?: number) {
  return prisma.article.findMany({
    where: {
      published_at: {
        not: null,
      },
    },
    include: articleInclude,
    orderBy: {
      published_at: "desc",
    },
    ...(typeof limit === "number" ? { take: limit } : {}),
  });
}

export async function getBreakingNews() {
  return prisma.article.findMany({
    where: {
      is_breaking: true,
      published_at: {
        not: null,
      },
    },
    include: articleInclude,
    orderBy: {
      published_at: "desc",
    },
    take: 8,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: articleInclude,
  });
}

export async function getArticlesByCategorySlug(slug: string) {
  return prisma.article.findMany({
    where: {
      category: {
        slug,
      },
      published_at: {
        not: null,
      },
    },
    include: articleInclude,
    orderBy: {
      published_at: "desc",
    },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}
