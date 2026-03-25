"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCommentStatus, deleteComment } from "@/app/actions/comment.actions";

type CommentStatus = "APPROVED" | "REJECTED" | "PENDING";

interface AdminComment {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: Date;
  author: { name: string };
  article: { title: string; slug: string };
}

const statusConfig: Record<CommentStatus, { label: string; className: string; icon: React.ReactNode }> = {
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: <CheckCircle size={12} />,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: <XCircle size={12} />,
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    icon: <Clock size={12} />,
  },
};

export function AdminCommentTable({ comments }: { comments: AdminComment[] }) {
  const [rows, setRows] = useState(comments);
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleStatus(id: string, status: CommentStatus) {
    setActiveId(id);
    startTransition(async () => {
      const result = await updateCommentStatus(id, status);
      if (result.success) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r)),
        );
        toast.success("Status updated.");
      } else {
        toast.error(result.message);
      }
      setActiveId(null);
    });
  }

  function handleDelete(id: string) {
    setActiveId(id);
    startTransition(async () => {
      const result = await deleteComment(id);
      if (result.success) {
        setRows((prev) => prev.filter((r) => r.id !== id));
        toast.success("Comment deleted.");
      } else {
        toast.error(result.message);
      }
      setActiveId(null);
    });
  }

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400">
        No comments yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left dark:border-neutral-800">
            <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Author</th>
            <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Comment</th>
            <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Article</th>
            <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Date</th>
            <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Status</th>
            <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.map((comment) => {
            const cfg = statusConfig[comment.status];
            const isLoading = isPending && activeId === comment.id;

            return (
              <tr key={comment.id} className="group">
                <td className="py-3 pr-4 font-medium text-neutral-900 dark:text-white">
                  {comment.author.name}
                </td>
                <td className="max-w-xs py-3 pr-4">
                  <p className="line-clamp-2 text-neutral-600 dark:text-neutral-300">
                    {comment.content}
                  </p>
                </td>
                <td className="py-3 pr-4">
                  <a
                    href={`/article/${comment.article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-1 max-w-[160px] text-xs text-neutral-500 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
                  >
                    {comment.article.title}
                  </a>
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-xs text-neutral-400">
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                    new Date(comment.createdAt),
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                      cfg.className,
                    )}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin text-neutral-400" />
                    ) : (
                      <>
                        {comment.status !== "APPROVED" && (
                          <button
                            onClick={() => handleStatus(comment.id, "APPROVED")}
                            title="Approve"
                            className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {comment.status !== "REJECTED" && (
                          <button
                            onClick={() => handleStatus(comment.id, "REJECTED")}
                            title="Reject"
                            className="rounded p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          title="Delete"
                          className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
