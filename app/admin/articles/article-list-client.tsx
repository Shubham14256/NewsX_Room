"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  slug: string;
  published_at: Date | null;
  is_breaking: boolean;
  views: number;
  author: { name: string };
  category: { name: string };
}

export function ArticleListClient({ articles }: { articles: Article[] }) {
  const [broadcasting, setBroadcasting] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [list, setList] = useState<Article[]>(articles);

  async function handleBroadcast(article: Article) {
    setBroadcasting(article.id);
    try {
      const res = await fetch("/api/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          message: `Read the latest: ${article.title}`,
          url: `/article/${article.slug}`,
        }),
      });

      const data = (await res.json()) as { data?: { sent: number; failed: number }; error?: { message: string; code: string } | string };

      if (!res.ok) {
        const errMsg = typeof data.error === "object" ? data.error?.message : data.error;
        toast.error(errMsg ?? "Broadcast failed");
      } else {
        const { sent = 0, failed = 0 } = data.data ?? {};
        toast.success(`Sent to ${sent} subscriber${sent !== 1 ? "s" : ""}${failed > 0 ? ` (${failed} failed)` : ""}`);
      }
    } catch {
      toast.error("Network error — broadcast failed");
    } finally {
      setBroadcasting(null);
    }
  }

  async function handleDelete(article: Article) {
    if (!window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    setDeletingSlug(article.slug);
    try {
      const res = await fetch(`/api/articles/${article.slug}`, { method: "DELETE" });
      const data = await res.json() as { success: boolean; error?: { message: string } };
      if (!res.ok || !data.success) throw new Error(data.error?.message ?? "Delete failed.");
      toast.success("Article deleted.");
      setList((prev) => prev.filter((a) => a.slug !== article.slug));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingSlug(null);
    }
  }

  if (list.length === 0) {
    return (
      <p className="mt-4 text-sm text-neutral-500">No articles yet. Write your first one!</p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700">
            <th className="pb-2 pr-4">Title</th>
            <th className="pb-2 pr-4">Category</th>
            <th className="pb-2 pr-4">Author</th>
            <th className="pb-2 pr-4">Views</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {list.map((a) => (
            <tr key={a.id} className="group">
              <td className="py-3 pr-4">
                <span className="line-clamp-1 font-medium">{a.title}</span>
                {a.is_breaking && (
                  <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">
                    Breaking
                  </span>
                )}
              </td>
              <td className="py-3 pr-4 text-neutral-500">{a.category.name}</td>
              <td className="py-3 pr-4 text-neutral-500">{a.author.name}</td>
              <td className="py-3 pr-4 text-neutral-500">
                <span className="flex items-center gap-1">
                  <Eye className="size-3" /> {a.views}
                </span>
              </td>
              <td className="py-3 pr-4">
                {a.published_at ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Published
                  </span>
                ) : (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500 dark:bg-neutral-800">
                    Draft
                  </span>
                )}
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/articles/edit/${a.slug}`}
                    className="rounded p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    aria-label="Edit article"
                  >
                    <Pencil className="size-3.5" />
                  </Link>
                  {a.published_at && (
                    <button
                      onClick={() => handleBroadcast(a)}
                      disabled={broadcasting === a.id}
                      aria-label="Broadcast push notification"
                      title="Send push notification to all subscribers"
                      className="rounded p-1 text-neutral-400 hover:text-amber-600 disabled:opacity-40 dark:hover:text-amber-400"
                    >
                      <Bell className="size-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => void handleDelete(a)}
                    disabled={deletingSlug === a.slug}
                    aria-label="Delete article"
                    title="Delete article"
                    className="rounded p-1 text-neutral-400 hover:text-red-600 disabled:opacity-40 dark:hover:text-red-400"
                  >
                    {deletingSlug === a.slug
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <Trash2 className="size-3.5" />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
