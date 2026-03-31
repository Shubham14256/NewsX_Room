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

// ── V1 fields: required (backwards-compatible with existing admin UI) ─────────
// ── V2 fields: all optional — legacy payloads omit them without error ─────────
const createEPaperSchema = z.object({
  // V1 — required, unchanged
  title:        z.string().min(2, "Title must be at least 2 characters."),
  date:         z.string().min(1, "Date is required."),
  pdfUrl:       z.string().url("Must be a valid URL."),

  // V2 — optional, safe to omit
  city:         z.string().min(1).optional(),
  thumbnailUrl: z.string().url("thumbnailUrl must be a valid URL.").optional(),
  pageImages:   z.array(z.string().url()).min(1).optional(),
  pageCount:    z.number().int().positive().optional(),
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
        // V1 fields — always present
        title:  parsed.data.title.trim(),
        date:   new Date(parsed.data.date),
        pdfUrl: parsed.data.pdfUrl.trim(),

        // V2 fields — only written when the payload includes them.
        // undefined values are ignored by Prisma (column stays NULL).
        ...(parsed.data.city         !== undefined && { city:         parsed.data.city.trim()         }),
        ...(parsed.data.thumbnailUrl !== undefined && { thumbnailUrl: parsed.data.thumbnailUrl.trim() }),
        ...(parsed.data.pageImages   !== undefined && { pageImages:   parsed.data.pageImages,
                                                        pageCount:    parsed.data.pageCount ?? parsed.data.pageImages.length }),
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
