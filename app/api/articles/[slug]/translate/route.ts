import { type NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { apiSuccess, apiFailure, ApiError } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateArticle } from "@/lib/ai";

const SUPPORTED_LANGUAGES: Record<string, string> = {
  hi: "Hindi",
  mr: "Marathi",
};

const translateSchema = z.object({
  languages: z
    .array(z.string().min(2).max(5))
    .min(1, "Provide at least one language code."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return apiFailure(new ApiError("Forbidden.", "FORBIDDEN", 403));
  }

  try {
    const { slug } = await params;

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, title: true, summary: true, content: true },
    });

    if (!article) {
      throw new ApiError("Article not found.", "NOT_FOUND", 404);
    }

    const body = await request.json();
    const parsed = translateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        parsed.error.issues[0]?.message ?? "Invalid payload.",
        "VALIDATION_ERROR",
        400,
      );
    }

    const { languages } = parsed.data;

    // Attempt all translations in parallel — partial success is acceptable
    const results = await Promise.allSettled(
      languages.map(async (lang) => {
        const langName = SUPPORTED_LANGUAGES[lang] ?? lang;

        const [title, summary, content] = await Promise.all([
          translateArticle(article.title, langName),
          translateArticle(article.summary, langName),
          translateArticle(article.content, langName),
        ]);

        // Upsert so re-running doesn't create duplicates
        await prisma.articleTranslation.upsert({
          where: { articleId_language: { articleId: article.id, language: lang } },
          create: { articleId: article.id, language: lang, title, summary, content },
          update: { title, summary, content },
        });

        return { lang, status: "fulfilled" as const };
      }),
    );

    const succeeded: string[] = [];
    const failed: Array<{ lang: string; reason: string }> = [];

    results.forEach((result, i) => {
      const lang = languages[i]!;
      if (result.status === "fulfilled") {
        succeeded.push(lang);
      } else {
        const reason =
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown error";
        failed.push({ lang, reason });
        console.error(`Translation failed for [${lang}]:`, reason);
      }
    });

    const isPartial = failed.length > 0 && succeeded.length > 0;
    const isFullFailure = succeeded.length === 0;

    if (isFullFailure) {
      throw new ApiError(
        `All translations failed: ${failed.map((f) => `${f.lang}: ${f.reason}`).join("; ")}`,
        "TRANSLATION_FAILED",
        502,
      );
    }

    return apiSuccess(
      {
        succeeded,
        failed,
        partial: isPartial,
        message: isPartial
          ? `Partial success. Translated: [${succeeded.join(", ")}]. Failed: [${failed.map((f) => f.lang).join(", ")}].`
          : `All ${succeeded.length} translation(s) completed successfully.`,
      },
      isPartial ? 207 : 200,
    );
  } catch (error) {
    console.error(`POST /api/articles/[slug]/translate failed:`, error);
    return apiFailure(error);
  }
}
