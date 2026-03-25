export type UserRole = "ADMIN" | "EDITOR" | "REPORTER" | "USER";

export interface NavSection {
  id: string;
  label: string;
  href: string;
}

export interface BreakingUpdate {
  id: string;
  headline: string;
  href: string;
}

export interface ArticleCard {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  views: number;
  isBreaking?: boolean;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
}
