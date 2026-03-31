import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { Navbar } from "@/components/layout/navbar";
import { SocialShare } from "@/components/news/social-share";
import { ViewTracker } from "@/components/news/view-tracker";
import { PaywallGuard } from "@/components/news/paywall-guard";
import { CommentSection } from "@/components/news/comment-section";
import { AudioPlayer } from "@/components/news/audio-player";
import { PushSubscribePrompt } from "@/components/news/push-subscribe-prompt";
import { PerspectiveTabs } from "@/components/news/perspective-tabs";
import { FactCheckBadge } from "@/components/news/fact-check-badge";
import { AddToQueueButton, MiniPlayer } from "@/components/news/listen-queue";
import { AiRecommendations } from "@/components/news/ai-recommendations";
import { InteractivePoll } from "@/components/news/interactive-poll";
import { RewardTrigger } from "@/components/news/reward-trigger";
import { getArticleBySlug } from "@/lib/services/article.service";
import { getNavSections } from "@/lib/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatPublishedDate(date: Date | null): string {
  if (!date) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export default async function ArticleReaderPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, session, navSections] = await Promise.all([
    getArticleBySlug(slug),
    getServerSession(authOptions),
    getNavSections(),
  ]);

  if (!article) {
    notFound();
  }

  const comments = await prisma.comment.findMany({
    where: { articleId: article.id },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar sections={navSections} />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <ViewTracker slug={slug} />
      <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <header className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <h1 className="font-headline text-3xl font-black leading-tight sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <span>By {article.author.name}</span>
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900/40 dark:text-red-200">
              {article.category.name}
            </span>
            <span>{formatPublishedDate(article.published_at)}</span>
            <FactCheckBadge />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SocialShare title={article.title} />
            <AddToQueueButton title={article.title} slug={slug} />
          </div>
          <PerspectiveTabs />
        </header>

        {article.summary ? (
          <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-900/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
              ✨ Quick Read
            </p>
            <p className="mt-2 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
              {article.summary}
            </p>
            <AudioPlayer title={article.title} content={article.content} />
          </section>
        ) : null}

        <PaywallGuard slug={slug}>
          <section className="mt-8 space-y-5 text-neutral-800 dark:text-neutral-100">
            {article.content.split("\n").map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) {
                return null;
              }

              return (
                <p key={`${article.id}-${index}`} className="text-lg leading-8">
                  {trimmed}
                </p>
              );
            })}
          </section>
        </PaywallGuard>
      </article>

      <AiRecommendations />

      <InteractivePoll articleSlug={slug} />

      <CommentSection
        articleId={article.id}
        initialComments={comments}
        session={session}
      />
      <PushSubscribePrompt />
      <MiniPlayer />
      <RewardTrigger articleSlug={slug} />
    </main>
    </div>
  );
}
