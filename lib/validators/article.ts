import { z } from "zod";

export const articleFormSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  slug: z.string().min(3, "Slug is required."),
  summary: z.string().min(20, "Summary must be at least 20 characters."),
  content: z.string().min(50, "Content must be at least 50 characters."),
  imageUrl: z.union([z.string().url("Please enter a valid image URL."), z.literal("")]).optional(),
  categoryId: z.string().min(1, "Category is required."),
  authorId: z.string().min(1, "Author is required."),
  is_breaking: z.boolean().default(false),
  seo_title: z.string().optional(),
  seo_keywords: z.string().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;
export type ArticleFormInput = z.input<typeof articleFormSchema>;
