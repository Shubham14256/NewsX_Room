import { z } from "zod";
import { getServerSession } from "next-auth";

import { generateArticleSeo } from "@/lib/ai";
import { apiFailure, apiSuccess, ApiError } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";

const seoSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  content: z.string().min(20, "Content must be at least 20 characters."),
});

const REQUEST_TIMEOUT_MS = 15000;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return apiFailure(new ApiError("Forbidden.", "FORBIDDEN", 403));
  }

  try {
    const body = await request.json();
    const parsed = seoSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid payload.", "VALIDATION_ERROR", 400);
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI request timed out.")), REQUEST_TIMEOUT_MS);
    });

    const seo = await Promise.race([
      generateArticleSeo(parsed.data.title, parsed.data.content),
      timeoutPromise,
    ]);

    return apiSuccess(seo, 200);
  } catch (error) {
    console.error("POST /api/ai/seo failed:", error);
    if (error instanceof Error && error.message.includes("timed out")) {
      return apiFailure(new ApiError("AI SEO request timed out.", "AI_TIMEOUT", 504));
    }
    return apiFailure(error);
  }
}
