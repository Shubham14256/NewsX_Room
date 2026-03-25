import { cookies } from "next/headers";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const VIEW_COOLDOWN_SECONDS = 60 * 60; // 1 hour per article per browser

interface ViewRouteProps {
  params: Promise<{ slug: string }>;
}

export async function POST(_: Request, { params }: ViewRouteProps) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const cookieKey = `viewed_${slug}`;

    // If cookie exists, this browser already counted a view recently — skip
    if (cookieStore.has(cookieKey)) {
      return apiSuccess({ skipped: true });
    }

    const updated = await prisma.article.update({
      where: { slug },
      data: { views: { increment: 1 } },
      select: { id: true, slug: true, views: true },
    });

    // Set HttpOnly cookie so JS can't clear it — expires after cooldown
    cookieStore.set(cookieKey, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: VIEW_COOLDOWN_SECONDS,
      path: "/",
    });

    return apiSuccess(updated, 200);
  } catch (error) {
    console.error("POST /api/articles/[slug]/view failed:", error);
    return apiFailure(error);
  }
}
