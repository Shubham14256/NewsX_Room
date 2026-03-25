"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { CategoryOption } from "@/types/news";

interface ImporterFormProps {
  categories: CategoryOption[];
}

const STAGES = [
  "Fetching RSS feed...",
  "Rewriting with AI...",
  "Generating summary and SEO...",
  "Saving to newsroom...",
] as const;

export function ImporterForm({ categories }: ImporterFormProps) {
  const [feedUrl, setFeedUrl] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [isRunning, setIsRunning] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const runImporter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRunning(true);
    setStageIndex(0);

    const interval = setInterval(() => {
      setStageIndex((value) => (value + 1) % STAGES.length);
    }, 1400);

    try {
      const response = await fetch("/api/importer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedUrl,
          categoryId,
          limit: 2,
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: Array<{ title: string }>;
        error?: { message?: string };
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message || "Importer failed.");
      }

      toast.success(`Imported ${payload.data?.length ?? 0} article(s) successfully.`);
      setFeedUrl("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to run importer.");
    } finally {
      clearInterval(interval);
      setIsRunning(false);
      setStageIndex(0);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Auto Importer</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Pull stories from RSS, rewrite with AI, optimize SEO, and publish automatically.
        </p>
      </div>

      <form
        onSubmit={runImporter}
        className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">RSS Feed URL</label>
          <input
            value={feedUrl}
            onChange={(event) => setFeedUrl(event.target.value)}
            placeholder="https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms"
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={isRunning || categories.length === 0}>
          {isRunning ? "Running Importer..." : "🚀 Run AI Importer"}
        </Button>

        {isRunning ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{STAGES[stageIndex]}</p>
        ) : null}
      </form>
    </section>
  );
}
