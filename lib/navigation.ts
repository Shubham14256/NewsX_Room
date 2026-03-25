import type { NavSection } from "@/types/news";
import { getAllCategories } from "@/lib/services/article.service";

export const navSections: NavSection[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "local", label: "Local", href: "/category/local" },
  { id: "tech", label: "Tech", href: "/category/tech" },
  { id: "sports", label: "Sports", href: "/category/sports" },
  { id: "video-shorts", label: "Video Shorts", href: "/category/video-shorts" },
];

export async function getNavSections(): Promise<NavSection[]> {
  try {
    const categories = await getAllCategories();

    if (categories.length === 0) {
      return navSections;
    }

    return [
      { id: "home", label: "Home", href: "/" },
      ...categories.map((category) => ({
        id: category.id,
        label: category.name,
        href: `/category/${category.slug}`,
      })),
    ];
  } catch {
    return navSections;
  }
}
