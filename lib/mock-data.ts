import type { ArticleCard, BreakingUpdate, NavSection } from "@/types/news";

export const navSections: NavSection[] = [
  { id: "home", label: "Home", href: "#" },
  { id: "local", label: "Local", href: "#" },
  { id: "tech", label: "Tech", href: "#" },
  { id: "sports", label: "Sports", href: "#" },
  { id: "video-shorts", label: "Video Shorts", href: "#" },
];

export const breakingUpdates: BreakingUpdate[] = [
  {
    id: "breaking-1",
    headline: "Monsoon alert: Coastal districts move emergency teams into position.",
    href: "#",
  },
  {
    id: "breaking-2",
    headline: "Markets react to policy shift with strongest weekly gains this quarter.",
    href: "#",
  },
  {
    id: "breaking-3",
    headline: "Live: Space-tech startup unveils reusable launch prototype in Bengaluru.",
    href: "#",
  },
];

export const featuredArticle: ArticleCard = {
  id: "article-featured",
  title: "Inside India’s Fastest Growing Creator Economy: What Newsrooms Must Learn",
  slug: "india-creator-economy-newsrooms",
  summary:
    "A deep look into how digital-first storytelling, mobile video, and niche community formats are changing audience growth.",
  category: "Tech",
  imageUrl:
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80",
  publishedAt: "2h ago",
  views: 42810,
  isBreaking: true,
};

export const trendingArticles: ArticleCard[] = [
  {
    id: "article-trend-1",
    title: "City Metro Expansion Adds 18 New Stations by Year End",
    slug: "city-metro-expansion-18-stations",
    summary: "Commuters could see average travel time drop by 22 minutes daily.",
    category: "Local",
    imageUrl:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80",
    publishedAt: "45m ago",
    views: 12420,
  },
  {
    id: "article-trend-2",
    title: "National Team Announces Youth-Heavy Squad for Summer Tour",
    slug: "national-team-youth-heavy-squad",
    summary: "Selectors prioritize pace, fitness, and tactical flexibility.",
    category: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
    publishedAt: "1h ago",
    views: 9320,
  },
  {
    id: "article-trend-3",
    title: "How 60-Second Video Explainors Are Driving Subscription Growth",
    slug: "60-second-video-explainors-subscription-growth",
    summary: "News products are blending short-form video with premium paywalls.",
    category: "Video Shorts",
    imageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80",
    publishedAt: "3h ago",
    views: 18540,
  },
];
