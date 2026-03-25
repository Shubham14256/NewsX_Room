import Parser from "rss-parser";
import { ApiError } from "@/lib/api-response";

interface RSSItem {
  title: string;
  snippet: string;
  link: string;
}

/** Strip all HTML tags and decode common entities from a string */
function sanitizeHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const parser = new Parser();

export async function fetchRSSFeed(url: string, limit = 2): Promise<RSSItem[]> {
  try {
    if (!/^https?:\/\/.+/i.test(url)) {
      throw new ApiError("Invalid RSS URL. Please enter a valid http/https feed URL.", "INVALID_RSS_URL", 400);
    }

    const clampedLimit = Math.min(Math.max(limit, 1), 2);
    const feed = await parser.parseURL(url);
    const items = (feed.items || []).slice(0, clampedLimit);

    return items.map((item, index) => ({
      title: sanitizeHtml(item.title?.trim() || `Imported Story ${index + 1}`),
      snippet: sanitizeHtml((item.contentSnippet || item.content || item.summary || "").trim()),
      link: item.link?.trim() || url,
    }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Unable to fetch this RSS feed right now.", "RSS_FETCH_FAILED", 502);
  }
}
