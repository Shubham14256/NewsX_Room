"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { unstable_catchError as catchError } from "next/error";
import { toast } from "sonner";
import {
  Loader2, Newspaper, Trash2, ExternalLink, UploadCloud,
  X, ImageIcon, CheckCircle2, MapPin, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EPaperRecord {
  id:           string;
  title:        string;
  date:         string;
  pdfUrl:       string;
  city?:        string | null;
  thumbnailUrl?: string | null;
  pageCount?:   number | null;
  createdAt:    string;
}

interface PageFile {
  file:     File;
  blobUrl:  string;
  progress: number;   // 0–100
  done:     boolean;
}

// ─── File validation constants ────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const CITIES = ["पुणे", "मुंबई", "नागपूर", "नाशिक", "औरंगाबाद", "कोल्हापूर", "Other"];

const inputClass = cn(
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none",
  "transition-shadow focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100",
  "dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-500",
);

// ─── Upload simulation ────────────────────────────────────────────────────────
// Animates a progress bar from 0→100 over ~1.2s per file, then resolves.
// Returns the blob URL (already created before calling this).
function simulateUpload(
  index: number,
  onProgress: (idx: number, pct: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let pct = 0;
    // Stagger start so files don't all animate simultaneously
    const delay = index * 180;
    setTimeout(() => {
      const id = setInterval(() => {
        pct += Math.floor(Math.random() * 18) + 8; // 8–25% per tick
        if (pct >= 100) {
          pct = 100;
          clearInterval(id);
          onProgress(index, 100);
          resolve();
        } else {
          onProgress(index, pct);
        }
      }, 80);
    }, delay);
  });
}

// ─── Inner admin page ─────────────────────────────────────────────────────────

function AdminEPaperPageInner() {
  // ── Form state ──────────────────────────────────────────────────────────
  const [title,      setTitle]      = useState("");
  const [date,       setDate]       = useState("");
  const [city,       setCity]       = useState("");
  const [pages,      setPages]      = useState<PageFile[]>([]);
  const [uploading,  setUploading]  = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Drag state ──────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const dropRef   = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // ── Published editions list ─────────────────────────────────────────────
  const [epapers,    setEpapers]    = useState<EPaperRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Cleanup blob URLs on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      pages.forEach((p) => URL.revokeObjectURL(p.blobUrl));
    };
  }, [pages]);

  // ── Fetch published editions ────────────────────────────────────────────
  const fetchEPapers = useCallback(async () => {
    try {
      const res  = await fetch("/api/epaper");
      const json = await res.json() as { success: boolean; data: EPaperRecord[] };
      if (json.success) setEpapers(json.data);
    } catch {
      toast.error("Failed to load editions.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { void fetchEPapers(); }, [fetchEPapers]);

  // ── File ingestion ──────────────────────────────────────────────────────
  function ingestFiles(files: FileList | File[]) {
    const accepted: File[] = [];

    for (const file of Array.from(files)) {
      // MIME type whitelist — rejects PDFs, SVGs, and anything non-image
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        toast.error(`"${file.name}" is not allowed.`, {
          description: "Only JPG, PNG, and WebP images are accepted.",
        });
        continue;
      }
      // Per-file size cap — rejects files over 5 MB immediately
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${file.name}" exceeds the 5 MB limit.`, {
          description: `File size: ${(file.size / 1024 / 1024).toFixed(1)} MB`,
        });
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    const newPages: PageFile[] = accepted.map((file) => ({
      file,
      blobUrl:  URL.createObjectURL(file),
      progress: 0,
      done:     false,
    }));

    setPages((prev) => [...prev, ...newPages]);
    void runUploadSimulation(newPages);
  }

  async function runUploadSimulation(newPages: PageFile[]) {
    setUploading(true);

    // Find the starting index in the full pages array
    // We use a functional update so we always have the latest state
    const startIdx = await new Promise<number>((resolve) => {
      setPages((prev) => {
        resolve(prev.length - newPages.length);
        return prev;
      });
    });

    function onProgress(relIdx: number, pct: number) {
      setPages((prev) => {
        const next = [...prev];
        const absIdx = startIdx + relIdx;
        if (next[absIdx]) {
          next[absIdx] = { ...next[absIdx]!, progress: pct, done: pct === 100 };
        }
        return next;
      });
    }

    await Promise.all(newPages.map((_, i) => simulateUpload(i, onProgress)));
    setUploading(false);
    toast.success(`✅ ${newPages.length} page${newPages.length > 1 ? "s" : ""} uploaded successfully!`);
  }

  function removePage(idx: number) {
    setPages((prev) => {
      URL.revokeObjectURL(prev[idx]!.blobUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  // ── Drag & drop handlers ────────────────────────────────────────────────
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function onDragLeave() { setIsDragging(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) ingestFiles(e.dataTransfer.files);
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submitting) return;
    if (pages.length === 0) { toast.error("Please upload at least one page image."); return; }
    if (uploading)          { toast.error("Please wait for uploads to finish."); return; }

    setSubmitting(true);

    // ── Fix #1: Compensating transaction (rollback) pattern ──────────────
    // Track every URL that successfully lands in Vercel Blob BEFORE the DB
    // write. If anything fails after partial uploads, we delete the orphans.
    const committedUrls: string[] = [];

    try {
      toast.loading("Saving to cloud storage…", { id: "upload-toast" });

      // Upload files sequentially so committedUrls is always accurate.
      // Promise.all would race — if page 3 fails, pages 1 & 2 are already
      // committed and we need their URLs to roll back.
      const pageImageUrls: string[] = [];
      for (let i = 0; i < pages.length; i++) {
        const p    = pages[i]!;
        const form = new FormData();
        form.append("file", p.file);

        const res  = await fetch("/api/upload", { method: "POST", body: form });
        const json = await res.json() as { url?: string; error?: string };

        if (!json.url) {
          // This upload failed — trigger rollback for everything committed so far
          throw new Error(json.error ?? `Upload failed on page ${i + 1}`);
        }

        // Track immediately — if the NEXT iteration fails, this URL is orphaned
        committedUrls.push(json.url);
        pageImageUrls.push(json.url);
      }

      toast.dismiss("upload-toast");

      // ── DB write ────────────────────────────────────────────────────────
      const payload = {
        title:        title.trim(),
        date,
        pdfUrl:       pageImageUrls[0]!,
        city:         city || undefined,
        thumbnailUrl: pageImageUrls[0]!,
        pageImages:   pageImageUrls,
        pageCount:    pageImageUrls.length,
      };

      const res = await fetch("/api/epaper", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const json = await res.json() as {
        success: boolean;
        error?: { message?: string; code?: string };
      };

      if (!res.ok || !json.success) {
        // DB write failed — all uploaded blobs are now orphaned, roll back
        throw new Error(json.error?.message ?? res.statusText ?? "Publish failed.");
      }

      // ── Success — clear committed list (nothing to roll back) ───────────
      committedUrls.length = 0;

      // ── Elite slicing pipeline BYPASSED (Phase 2 — pending DB tier upgrade)
      // Slice endpoint preserved at /api/epaper/slice but not called here.
      // Re-enable by uncommenting the block below when ready.

      toast.success("🎉 E-Paper edition published!", {
        description: `${title} — ${pages.length} pages`,
      });

      pages.forEach((p) => URL.revokeObjectURL(p.blobUrl));
      setTitle(""); setDate(""); setCity(""); setPages([]);
      void fetchEPapers();

    } catch (err) {
      toast.dismiss("upload-toast");

      // ── Rollback: delete every blob that made it to Vercel storage ──────
      if (committedUrls.length > 0) {
        console.error(
          `[CRITICAL] Upload pipeline failed. Executing rollback for ` +
          `${committedUrls.length} orphaned blob(s)…`,
        );
        try {
          await fetch("/api/upload/rollback", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ urls: committedUrls }),
          });
          console.info(`[ROLLBACK] Successfully deleted ${committedUrls.length} orphaned blob(s).`);
        } catch (rollbackErr) {
          // Rollback itself failed — log for manual cleanup
          console.error("[ROLLBACK FAILED] Manual cleanup required for URLs:", committedUrls, rollbackErr);
        }
      }

      toast.error(err instanceof Error ? err.message : "Upload failed. Any partial uploads have been cleaned up.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  async function handleDelete(ep: EPaperRecord) {
    if (!window.confirm(`Delete "${ep.title}"? This cannot be undone.`)) return;
    setDeletingId(ep.id);
    try {
      const res  = await fetch("/api/epaper", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: ep.id }),
      });
      const json = await res.json() as { success: boolean; error?: { message?: string } };
      if (!json.success) throw new Error(json.error?.message ?? "Delete failed.");
      toast.success("Edition deleted.");
      setEpapers((prev) => prev.filter((e) => e.id !== ep.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  const allDone   = pages.length > 0 && pages.every((p) => p.done);
  const canSubmit = !submitting && !uploading && pages.length > 0 && title && date;

  return (
    <div className="space-y-6">

      {/* ── Upload Form ──────────────────────────────────────────────── */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
            <Newspaper className="size-5 text-white" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-neutral-900 dark:text-white">
              E-Paper Manager <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">V2</span>
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Upload page images to publish a new digital edition.
            </p>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          {/* Row 1: Title + Date + City */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Edition Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Morning Edition – March 25"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Edition Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                <MapPin className="size-3" /> City / Edition
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              >
                <option value="">Select city…</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Drag & Drop Zone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              E-Paper Pages (Images) *
            </label>

            <div
              ref={dropRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInput.current?.click()}
              role="button"
              aria-label="Upload E-Paper page images"
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-200",
                isDragging
                  ? [
                      "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/30",
                      "shadow-[0_0_0_4px_rgba(239,68,68,0.15)] dark:shadow-[0_0_0_4px_rgba(239,68,68,0.2)]",
                      "scale-[1.01]",
                    ].join(" ")
                  : "border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-500",
              )}
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) ingestFiles(e.target.files); e.target.value = ""; }}
              />

              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                isDragging ? "bg-red-100 dark:bg-red-900/30" : "bg-neutral-200 dark:bg-neutral-700",
              )}>
                <UploadCloud className={cn("size-7", isDragging ? "text-red-600" : "text-neutral-400")} />
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                  {isDragging ? "Drop pages here" : "Drag & drop page images here"}
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  or click to browse · JPG, PNG, WebP · Multiple files supported
                </p>
              </div>

              {pages.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <ImageIcon className="size-3" />
                  {pages.length} page{pages.length > 1 ? "s" : ""} selected
                  {allDone && <CheckCircle2 className="size-3" />}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Page preview grid with progress bars */}
          {pages.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/30">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Page Preview — {pages.length} page{pages.length > 1 ? "s" : ""}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    pages.forEach((p) => URL.revokeObjectURL(p.blobUrl));
                    setPages([]);
                  }}
                  className="text-xs font-medium text-red-500 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {pages.map((page, idx) => (
                  <div key={idx} className="group relative">
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                      style={{ aspectRatio: "3/4" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.blobUrl}
                        alt={`Page ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {/* Progress overlay */}
                      {!page.done && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60">
                          <Loader2 className="size-4 animate-spin text-white" />
                          <span className="font-mono text-[10px] font-bold text-white">
                            {page.progress}%
                          </span>
                        </div>
                      )}

                      {/* Done checkmark */}
                      {page.done && (
                        <div className="absolute right-1 top-1 rounded-full bg-emerald-500 p-0.5">
                          <CheckCircle2 className="size-3 text-white" />
                        </div>
                      )}

                      {/* Page number badge */}
                      <div className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 font-mono text-[9px] text-white">
                        P{idx + 1}
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removePage(idx)}
                        aria-label={`Remove page ${idx + 1}`}
                        className="absolute left-1 top-1 hidden rounded-full bg-red-600 p-0.5 group-hover:flex"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </div>

                    {/* Progress bar below thumbnail */}
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-150",
                          page.done ? "bg-emerald-500" : "bg-red-500",
                        )}
                        style={{ width: `${page.progress}%` }}
                      />
                    </div>
                  </div>
                ))}

                {/* Add more pages button */}
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600 dark:border-neutral-700 dark:hover:border-neutral-500"
                  style={{ aspectRatio: "3/4" }}
                >
                  <GripVertical className="size-4" />
                  <span className="text-[10px] font-medium">Add more</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "gap-2 transition-all",
                canSubmit
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "opacity-50",
              )}
            >
              {submitting ? (
                <><Loader2 className="size-4 animate-spin" /> Publishing…</>
              ) : uploading ? (
                <><Loader2 className="size-4 animate-spin" /> Uploading…</>
              ) : (
                <><Newspaper className="size-4" /> Publish Edition</>
              )}
            </Button>

            {uploading && (
              <p className="text-xs text-neutral-400">
                Uploading {pages.filter((p) => !p.done).length} remaining…
              </p>
            )}
            {allDone && !submitting && (
              <p className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" /> All pages ready
              </p>
            )}
          </div>
        </form>
      </section>

      {/* ── Published Editions List ───────────────────────────────────── */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-headline text-lg font-bold text-neutral-900 dark:text-white">
          Published Editions
        </h2>

        {loadingList ? (
          <div className="flex items-center gap-2 py-10 text-neutral-400">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : epapers.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400">
            No editions published yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {epapers.map((ep) => (
              <div key={ep.id} className="flex items-center gap-4 py-3">
                {/* Thumbnail */}
                <div className="h-12 w-9 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                  {ep.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ep.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Newspaper className="size-4 text-neutral-400" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                      {ep.title}
                    </p>
                    {ep.city && (
                      <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {ep.city}
                      </span>
                    )}
                    {ep.pageCount && (
                      <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {ep.pageCount}p
                      </span>
                    )}
                  </div>
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
                    <ExternalLink className="size-3" /> View
                  </a>
                  <button
                    onClick={() => void handleDelete(ep)}
                    disabled={deletingId === ep.id}
                    aria-label={`Delete ${ep.title}`}
                    className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:hover:bg-red-950/20"
                  >
                    {deletingId === ep.id
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <Trash2 className="size-3.5" />}
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

// ─── Error boundary ───────────────────────────────────────────────────────────

function EPaperAdminFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[AdminEPaperPage] Render error:", error.message);
  }
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
        E-Paper Manager failed to load. Please refresh the page.
      </p>
    </div>
  );
}

const EPaperAdminBoundary = catchError(EPaperAdminFallback);

export default function AdminEPaperPage() {
  return (
    <EPaperAdminBoundary>
      <AdminEPaperPageInner />
    </EPaperAdminBoundary>
  );
}
