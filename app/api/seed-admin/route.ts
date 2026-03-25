import bcrypt from "bcryptjs";

import { apiFailure, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "admin@shubhstra.com";
const ADMIN_PASSWORD = "password123";

export async function POST() {
  // Disabled in production — run this once locally or via DB migration
  if (process.env.NODE_ENV === "production") {
    return Response.json({ success: false, error: "Not available in production." }, { status: 403 });
  }

  try {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        name: "Super Admin",
        role: "ADMIN",
        password: hashedPassword,
      },
      create: {
        name: "Super Admin",
        email: ADMIN_EMAIL,
        role: "ADMIN",
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return apiSuccess(admin, 201);
  } catch (error) {
    console.error("POST /api/seed-admin failed:", error);
    return apiFailure(error);
  }
}
