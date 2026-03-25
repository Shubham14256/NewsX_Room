"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Newspaper, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EPaper {
  id: string;
  title: string;
  date: string;
  pdfUrl: string;
  createdAt: string;
}

export default function AdminEPaperPage() {
  const [epapers, setEpapers] = useState<EPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", date: "", pdfUrl: "" });

  const fetchEPapers = useCallback(async () => {
    try {
      const res = await fetch("/api/epaper");
      const json = await res.json();
      if (json.success) setEpapers(json.data as EPaper[]);
    } catch {
      toast.error("Failed to load E-Papers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEPapers();
  }, [fetchEPapers]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/epaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Failed.");
      toast.success("E-Paper published successfully.");
      setForm({ title: "", date: "", pdfUrl: "" });
      void fetchEPapers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(ep: EPaper) {
    if (!window.confirm(`Delete "${ep.title}"? This cannot be undone.`)) return;
    setDeletingId(ep.id);
    try {
      const res = await fetch("/api/epaper", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ep.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Delete failed.");
      toast.success("Edition deleted.");
      setEpapers((prev) => prev.filter((e) => e.id !== ep.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass = cn(
    "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none",
    "transition-shadow focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100",
    "dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-500",
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="font-headline text-2xl font-bold text-neutral-900 dark:text-white">
          E-Paper Manager
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Publish a new digital edition by linking a hosted PDF.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Edition Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Edition – March 23"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Edition Date
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              PDF URL (S3 / CDN)
            </label>
            <input
              type="url"
              required
              placeholder="https://cdn.example.com/edition.pdf"
              value={form.pdfUrl}
              onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-3">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Publishing...</>
              ) : (
                <><Newspaper size={15} /> Publish Edition</>
              )}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-headline text-lg font-bold text-neutral-900 dark:text-white">
          Published Editions
        </h2>

        {loading ? (
          <div className="flex items-center gap-2 py-10 text-neutral-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : epapers.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400">No editions published yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {epapers.map((ep) => (
              <div key={ep.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                    {ep.title}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(ep.date))}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={ep.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <ExternalLink size={12} /> View PDF
                  </a>
                  <button
                    onClick={() => void handleDelete(ep)}
                    disabled={deletingId === ep.id}
                    aria-label={`Delete ${ep.title}`}
                    className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:hover:bg-red-950/20"
                  >
                    {deletingId === ep.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
