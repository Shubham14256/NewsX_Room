import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

function getClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

/** Returns true if the error is a quota/rate-limit error (429) */
function isQuotaError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("429") || msg.includes("quota") || msg.includes("rate");
  }
  return false;
}

function toMockSummary(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.slice(0, 220) || "बातमी लवकरच उपलब्ध होईल.";
}

function toMockSeo(title: string): { seo_title: string; seo_keywords: string } {
  const cleanTitle = title.trim() || "Breaking News Update";
  const seoTitle = cleanTitle.length > 60 ? `${cleanTitle.slice(0, 57)}...` : cleanTitle;
  return {
    seo_title: seoTitle.slice(0, 60),
    seo_keywords:
      "breaking news, live update, latest headlines, newsroom analysis, digital media, current affairs",
  };
}

export async function generateArticleSummary(content: string): Promise<string> {
  const client = getClient();
  if (!client) return toMockSummary(content);

  try {
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `You are an expert news editor. Summarize the following article content into a punchy, engaging 60-word summary suitable for a news brief or 'shorts' format. Content: ${content}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    if (isQuotaError(err)) {
      console.warn("[ai] Quota exceeded — using mock summary fallback.");
      return toMockSummary(content);
    }
    throw err;
  }
}

function sanitizeJsonFromModel(rawText: string): string {
  return rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
}

export async function generateArticleSeo(
  title: string,
  content: string,
): Promise<{ seo_title: string; seo_keywords: string }> {
  const client = getClient();
  if (!client) return toMockSeo(title);

  try {
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Analyze this news article. Generate a highly optimized SEO Title (max 60 chars) and a comma-separated list of 5-7 SEO keywords. Return ONLY JSON format: { 'seo_title': '...', 'seo_keywords': '...' }. Title: ${title}. Content: ${content}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(sanitizeJsonFromModel(text)) as {
      seo_title?: string;
      seo_keywords?: string;
    };
    return {
      seo_title: parsed.seo_title?.trim() || toMockSeo(title).seo_title,
      seo_keywords: parsed.seo_keywords?.trim() || toMockSeo(title).seo_keywords,
    };
  } catch (err) {
    if (isQuotaError(err)) {
      console.warn("[ai] Quota exceeded — using mock SEO fallback.");
      return toMockSeo(title);
    }
    throw err;
  }
}

function toMockRewrite(originalContent: string): string {
  const normalized = originalContent.replace(/\s+/g, " ").trim();
  return normalized.slice(0, 420) || "A developing story with key regional impact.";
}

export async function rewriteArticle(originalContent: string): Promise<string> {
  const client = getClient();
  if (!client) return toMockRewrite(originalContent);

  try {
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `You are an expert journalist. Rewrite the following news snippet to be 100% unique, plagiarism-free, and highly engaging. Keep it professional. Original: ${originalContent}. Return ONLY the rewritten text.`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    if (isQuotaError(err)) {
      console.warn("[ai] Quota exceeded — using mock rewrite fallback.");
      return toMockRewrite(originalContent);
    }
    throw err;
  }
}

export async function checkCommentToxicity(comment: string): Promise<boolean> {
  const client = getClient();
  if (!client) {
    // No API key — fail open (safe fallback)
    return false;
  }

  try {
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Analyze the following user comment for a news website. Does it contain extreme profanity, hate speech, severe personal attacks, or spam? Reply with ONLY 'YES' if it is toxic, or 'NO' if it is safe. Comment: ${comment}`;
    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim().toUpperCase();
    return answer.startsWith("YES");
  } catch {
    // On API error, fail open
    return false;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    ),
  );
  return Promise.race([promise, timeout]);
}

export async function translateArticle(
  text: string,
  targetLanguage: string,
): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error("Translation unavailable: GEMINI_API_KEY not configured.");
  }

  const model = client.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = `You are an expert journalist and native translator. Translate the following news content into ${targetLanguage}. Maintain the journalistic tone, formatting, and HTML tags exactly. Return ONLY the translated text. Content: ${text}`;

  const translated = await withTimeout(
    model.generateContent(prompt).then((r) => r.response.text().trim()),
    15_000,
    `translateArticle(${targetLanguage})`,
  );

  return translated;
}
