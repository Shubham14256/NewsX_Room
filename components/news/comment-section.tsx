"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Loader2, LogIn, Send } from "lucide-react";
import type { Session } from "next-auth";

import { submitComment } from "@/app/actions/comment.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommentAuthor {
  name: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  status: string;
  author: CommentAuthor;
}

interface CommentSectionProps {
  articleId: string;
  initialComments: Comment[];
  session: Session | null;
}

export function CommentSection({
  articleId,
  initialComments,
  session,
}: CommentSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isPending, startTransition] = useTransition();

  const approved = comments.filter((c) => c.status === "APPROVED");

  function handleSubmit() {
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await submitComment(articleId, content);
      if (result.success) {
        toast.success(result.message);
        // Optimistically add comment to local state
        if (session?.user) {
          setComments((prev) => [
            {
              id: `temp-${Date.now()}`,
              content: content.trim(),
              createdAt: new Date().toISOString(),
              status: "APPROVED",
              author: { name: session.user.name ?? "You" },
            },
            ...prev,
          ]);
        }
        setContent("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <section className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare size={20} className="text-neutral-500 dark:text-neutral-400" />
        <h2 className="font-headline text-xl font-bold text-neutral-900 dark:text-white">
          Discussion
        </h2>
        {approved.length > 0 && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {approved.length}
          </span>
        )}
      </div>

      {/* Composer */}
      {session?.user ? (
        <div className="mb-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
              {session.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {session.user.name}
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts on this story..."
            rows={3}
            maxLength={1000}
            disabled={isPending}
            className={cn(
              "w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none",
              "transition-shadow focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100",
              "dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-800",
              "disabled:opacity-60",
            )}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {content.length}/1000
            </span>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !content.trim()}
              size="sm"
              className="gap-1.5 rounded-lg"
            >
              {isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={13} />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-200 py-8 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Join the conversation — sign in to comment.
          </p>
          <Button
            onClick={() => router.push("/login")}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogIn size={14} />
            Login to Comment
          </Button>
        </div>
      )}

      {/* Comments list */}
      {approved.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-5">
          {approved.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                {comment.author.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(comment.createdAt))}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
