"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCommentToxicity } from "@/lib/ai";

export type CommentActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function submitComment(
  articleId: string,
  content: string,
): Promise<CommentActionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, message: "You must be logged in to comment." };
  }

  const trimmed = content.trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: false, message: "Comment is too short." };
  }
  if (trimmed.length > 1000) {
    return { success: false, message: "Comment exceeds 1000 characters." };
  }

  const isToxic = await checkCommentToxicity(trimmed);

  await prisma.comment.create({
    data: {
      content: trimmed,
      status: isToxic ? "REJECTED" : "APPROVED",
      authorId: session.user.id,
      articleId,
    },
  });

  if (isToxic) {
    return {
      success: false,
      message: "Your comment was flagged and rejected due to community guidelines.",
    };
  }

  // Revalidate the article page so the new comment appears instantly
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });
  if (article?.slug) {
    revalidatePath(`/article/${article.slug}`);
  }

  return { success: true, message: "Comment posted successfully." };
}

export async function updateCommentStatus(
  commentId: string,
  status: "APPROVED" | "REJECTED" | "PENDING",
): Promise<CommentActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return { success: false, message: "Unauthorized." };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { status },
  });

  revalidatePath("/admin/comments");
  return { success: true, message: "Status updated." };
}

export async function deleteComment(commentId: string): Promise<CommentActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return { success: false, message: "Unauthorized." };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath("/admin/comments");
  return { success: true, message: "Comment deleted." };
}
