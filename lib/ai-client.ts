interface SummaryResponse {
  data: string;
}

interface SeoResponse {
  data: {
    seo_title: string;
    seo_keywords: string;
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const json = (await response.json()) as T;
  return json;
}

export async function requestAiSummary(content: string): Promise<string> {
  const response = await fetch("/api/ai/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate summary.");
  }

  const result = await parseJson<SummaryResponse>(response);
  return result.data;
}

export async function requestAiSeo(title: string, content: string): Promise<SeoResponse["data"]> {
  const response = await fetch("/api/ai/seo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate SEO tags.");
  }

  const result = await parseJson<SeoResponse>(response);
  return result.data;
}
