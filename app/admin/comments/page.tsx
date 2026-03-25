import { prisma } from "@/lib/prisma";
import { AdminCommentTable } from "@/components/admin/comment-table";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      article: { select: { title: true, slug: true } },
    },
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-neutral-900 dark:text-white">
          Comment Moderation
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Review, approve, reject, or delete reader comments.
        </p>
      </div>
      <AdminCommentTable comments={comments} />
    </section>
  );
}
