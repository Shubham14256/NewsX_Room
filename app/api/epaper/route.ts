import { type NextRequest } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { apiSuccess, apiFailure, ApiError } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["ADMIN", "EDITOR"] as const;

function isAuthorized(role?: string): boolean {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

const createEPaperSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string().min(1, "Date is required."),
  pdfUrl: z.string().url("Must be a valid URL."),
});

export async function GET() {
  try {
    const epapers = await prisma.ePaper.findMany({
      orderBy: { date: "desc" },
    });
    return apiSuccess(epapers, 200);
  } catch (error) {
    console.error("GET /api/epaper failed:", error);
    return apiFailure(error);
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAuthorized(session.user.role)) {
    return apiFailure(new ApiError("Forbidden.", "FORBIDDEN", 403));
  }

  try {
    const body = await request.json();
    const parsed = createEPaperSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(
        parsed.error.issues[0]?.message ?? "Invalid payload.",
        "VALIDATION_ERROR",
        400,
      );
    }

    const epaper = await prisma.ePaper.create({
      data: {
        title: parsed.data.title.trim(),
        date: new Date(parsed.data.date),
        pdfUrl: parsed.data.pdfUrl.trim(),
      },
    });

    return apiSuccess(epaper, 201);
  } catch (error) {
    console.error("POST /api/epaper failed:", error);
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAuthorized(session.user.role)) {
    return apiFailure(new ApiError("Forbidden.", "FORBIDDEN", 403));
  }

  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      throw new ApiError("E-Paper ID is required.", "VALIDATION_ERROR", 400);
    }

    await prisma.ePaper.delete({ where: { id: body.id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/epaper failed:", error);
    return apiFailure(error);
  }
}
