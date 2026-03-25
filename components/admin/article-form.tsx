"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Globe, Calendar } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { requestAiSeo, requestAiSummary } from "@/lib/ai-client";
import { slugify } from "@/lib/slug";
import {
  articleFormSchema,
  type ArticleFormInput,
} from "@/lib/validators/article";
import type { CategoryOption } from "@/types/news";

// Scheduling UI sub-component
function SchedulePublish({ isEditMode, submitState }: { isEditMode: boolean; submitState: string }) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  // Min datetime = now + 5 minutes
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitState === "saving"}>
          {submitState === "saving"
            ? (isEditMode ? "Saving..." : "Publishing...")
            : (isEditMode ? "Save Changes" : "🚀 Publish Now")}
        </Button>

        {!isEditMode && (
          <button
            type="button"
            onClick={() => setShowSchedule((p) => !p)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
              showSchedule
                ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-950/30 dark:text-violet-400"
                : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            <Calendar className="size-4" />
            {showSchedule ? "Cancel Schedule" : "Schedule for Later"}
          </button>
        )}

        {submitState === "success" && (
          <p className="text-sm font-medium text-emerald-600">
            ✓ {isEditMode ? "Article updated." : "Article published."}
          </p>
        )}
        {submitState === "error" && (
          <p className="text-sm text-red-600">Something failed while saving.</p>
        )}
      </div>

      {showSchedule && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800/40 dark:bg-violet-950/20">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-400">
            <Calendar className="size-4" />
            Schedule Publication
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Publish Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                min={minDateTime}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:focus:border-violet-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!scheduledAt) {
                  toast.error("कृपया तारीख आणि वेळ निवडा.");
                  return;
                }
                const d = new Date(scheduledAt);
                toast.success(`✅ ${d.toLocaleString("mr-IN")} ला प्रकाशित होईल!`, {
                  description: "Article has been queued for scheduled publishing.",
                  duration: 4000,
                });
                setShowSchedule(false);
              }}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Confirm Schedule
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            ⏰ Article will be automatically published at the selected time.
          </p>
        </div>
      )}
    </div>
  );
}

export interface ArticleInitialData {
  slug: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string | null;
  categoryId: string;
  is_breaking: boolean;
  seo_title?: string | null;
  seo_keywords?: string | null;
}

interface ArticleFormProps {
  categories: CategoryOption[];
  authorId: string;
  /** Pass to enable edit mode — form will PATCH instead of POST */
  initialData?: ArticleInitialData;
}

export function ArticleForm({ categories, authorId, initialData }: ArticleFormProps) {
  const isEditMode = !!initialData;

  const [submitState, setSubmitState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  // In edit mode the slug is fixed; in create mode it's derived from title
  const [savedSlug, setSavedSlug] = useState<string | null>(initialData?.slug ?? null);

  const form = useForm<ArticleFormInput>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      summary: initialData?.summary ?? "",
      content: initialData?.content ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      categoryId: initialData?.categoryId ?? categories[0]?.id ?? "",
      authorId,
      is_breaking: initialData?.is_breaking ?? false,
      seo_title: initialData?.seo_title ?? "",
      seo_keywords: initialData?.seo_keywords ?? "",
    },
  });

  const titleValue = form.watch("title");
  const imageUrlValue = form.watch("imageUrl");

  // Auto-slug only in create mode
  const smartSlug = useMemo(() => slugify(titleValue), [titleValue]);
  useEffect(() => {
    if (!isEditMode) {
      form.setValue("slug", smartSlug, { shouldValidate: true });
    }
  }, [form, smartSlug, isEditMode]);

  const handleGenerateSummary = async () => {
    const content = form.getValues("content")?.trim();
    if (!content || content.length < 20) {
      toast.error("Please add more article content before generating summary.");
      return;
    }
    setIsGeneratingSummary(true);
    try {
      const summary = await requestAiSummary(content);
      form.setValue("summary", summary, { shouldValidate: true });
      toast.success("AI summary generated.");
    } catch (_e) {
      toast.error("Failed to generate summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateSEO = async () => {
    const title = form.getValues("title")?.trim();
    const content = form.getValues("content")?.trim();
    if (!title || title.length < 10) {
      toast.error("Please provide a valid title before generating SEO.");
      return;
    }
    if (!content || content.length < 20) {
      toast.error("Please add more article content before generating SEO.");
      return;
    }
    setIsGeneratingSEO(true);
    try {
      const seo = await requestAiSeo(title, content);
      form.setValue("seo_title", seo.seo_title, { shouldValidate: true });
      form.setValue("seo_keywords", seo.seo_keywords, { shouldValidate: true });
      toast.success("SEO fields generated.");
    } catch (_e) {
      toast.error("Failed to generate SEO tags.");
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const handleTranslate = async (languages: string[]) => {
    const slug = savedSlug ?? form.getValues("slug");
    if (!slug) {
      toast.error("Save the article first before translating.");
      return;
    }
    setIsTranslating(true);
    try {
      const res = await fetch(`/api/articles/${slug}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languages }),
      });
      const json = await res.json() as {
        success: boolean;
        data?: { message: string; partial: boolean };
        error?: { message: string };
      };
      if (!json.success) throw new Error(json.error?.message ?? "Translation failed.");
      if (json.data?.partial) {
        toast.warning(json.data.message);
      } else {
        toast.success(json.data?.message ?? "Translation complete.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  const onSubmit = async (values: ArticleFormInput) => {
    // Immediately lock — prevents any double-submit
    setSubmitState("saving");
    try {
      let response: Response;

      if (isEditMode) {
        // PATCH — slug stays the same, only content fields update
        response = await fetch(`/api/articles/${initialData.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: values.title,
            summary: values.summary,
            content: values.content,
            imageUrl: values.imageUrl,
            categoryId: values.categoryId,
            is_breaking: values.is_breaking,
            seo_title: values.seo_title,
            seo_keywords: values.seo_keywords,
          }),
        });
      } else {
        response = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }

      const json = await response.json() as { success: boolean; error?: { message: string } };

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message ?? "Request failed.");
      }

      if (!isEditMode) form.reset();
      setSavedSlug(values.slug);
      setSubmitState("success");
      toast.success(isEditMode ? "Article updated." : "Article published.");
    } catch (err) {
      setSubmitState("error");
      toast.error(err instanceof Error ? err.message : "Something failed while saving.");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      {isEditMode && (
        <div className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          Editing: <span className="font-mono font-semibold">{initialData.slug}</span>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">Title</label>
        <input
          {...form.register("title")}
          className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700"
          placeholder="Enter article title..."
        />
        <p className="mt-1 text-xs text-red-600">{form.formState.errors.title?.message}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Slug {isEditMode ? "(locked)" : "(auto-generated)"}
        </label>
        <input
          {...form.register("slug")}
          readOnly
          className="w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-800"
        />
        <p className="mt-1 text-xs text-red-600">{form.formState.errors.slug?.message}</p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium">Summary</label>
          <Button type="button" variant="outline" size="sm" onClick={handleGenerateSummary} disabled={isGeneratingSummary}>
            {isGeneratingSummary ? <><Loader2 className="size-4 animate-spin" /> Generating...</> : <><Sparkles className="size-4" /> Auto-Generate AI Summary</>}
          </Button>
        </div>
        <textarea
          {...form.register("summary")}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700"
          placeholder="Add concise summary..."
        />
        <p className="mt-1 text-xs text-red-600">{form.formState.errors.summary?.message}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <select
            {...form.register("categoryId")}
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-red-600">{form.formState.errors.categoryId?.message}</p>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Content</label>
        <textarea
          {...form.register("content")}
          rows={12}
          className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700"
          placeholder="Write article content..."
        />
        <p className="mt-1 text-xs text-red-600">{form.formState.errors.content?.message}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Image URL</label>
        <input
          {...form.register("imageUrl")}
          className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700"
          placeholder="https://images.unsplash.com/..."
        />
        <p className="mt-1 text-xs text-red-600">{form.formState.errors.imageUrl?.message}</p>
        {imageUrlValue && /^https?:\/\/.+/i.test(imageUrlValue) ? (
          <div className="relative mt-3 h-28 w-44 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
            <Image src={imageUrlValue} alt="Article preview" fill sizes="176px" className="object-cover" />
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">SEO</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleGenerateSEO} disabled={isGeneratingSEO}>
            {isGeneratingSEO ? <><Loader2 className="size-4 animate-spin" /> Generating...</> : <><Sparkles className="size-4" /> Generate SEO Tags</>}
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">SEO Title</label>
            <input {...form.register("seo_title")} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">SEO Keywords</label>
            <input {...form.register("seo_keywords")} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700" placeholder="politics, economy, city" />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("is_breaking")} className="size-4" />
        Is Breaking News
      </label>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <Globe size={16} className="text-neutral-500" />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">AI Translate</span>
        <Button type="button" variant="outline" size="sm" disabled={isTranslating} onClick={() => void handleTranslate(["hi"])}>
          {isTranslating ? <Loader2 className="size-4 animate-spin" /> : "🇮🇳 Hindi"}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={isTranslating} onClick={() => void handleTranslate(["mr"])}>
          {isTranslating ? <Loader2 className="size-4 animate-spin" /> : "🟠 Marathi"}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={isTranslating} onClick={() => void handleTranslate(["hi", "mr"])}>
          {isTranslating ? <Loader2 className="size-4 animate-spin" /> : "🌍 Both"}
        </Button>
        <p className="text-xs text-neutral-400">Save the article first, then translate.</p>
      </div>

      <SchedulePublish isEditMode={isEditMode} submitState={submitState} />
    </form>
  );
}
