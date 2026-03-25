"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slug";
import type { CategoryOption } from "@/types/news";

interface CategoryManagerProps {
  categories: CategoryOption[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const createCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message || "Failed to create category.");
      }

      toast.success("Category created.");
      setName("");
      setSlug("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create category.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (cat: CategoryOption) => {
    if (!window.confirm(`Delete category "${cat.name}"? Articles using it cannot be deleted.`)) return;
    setDeletingId(cat.id);
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id }),
      });
      const payload = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message || "Failed to delete category.");
      }
      toast.success(`"${cat.name}" deleted.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="font-headline text-2xl font-bold">Categories</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Manage newsroom taxonomy for discovery and distribution.
        </p>

        <form onSubmit={createCategory} className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Technology"
              className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium">Slug</label>
            <input
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              placeholder="technology"
              className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none ring-neutral-500 focus:ring-2 dark:border-neutral-700"
              required
            />
          </div>
          <div className="flex items-end md:col-span-1">
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Create Category"}
            </Button>
          </div>
        </form>
      </article>

      <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-headline text-xl font-semibold">Existing Categories</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
                <th className="py-3">Name</th>
                <th className="py-3">Slug</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="border-b border-neutral-100 dark:border-neutral-900">
                    <td className="py-3 text-sm">{category.name}</td>
                    <td className="py-3 text-sm text-neutral-600 dark:text-neutral-300">
                      /category/{category.slug}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => void deleteCategory(category)}
                        disabled={deletingId === category.id}
                        aria-label={`Delete ${category.name}`}
                        className="rounded p-1 text-neutral-400 hover:text-red-600 disabled:opacity-40 dark:hover:text-red-400"
                      >
                        {deletingId === category.id
                          ? <Loader2 className="size-4 animate-spin" />
                          : <Trash2 className="size-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-5 text-center text-sm text-neutral-500">
                    No categories yet. Create your first category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
