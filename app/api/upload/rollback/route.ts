import { del } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// ─── Rollback endpoint ────────────────────────────────────────────────────────
// Called by the admin client when a partial upload succeeds but the DB write
// fails. Deletes every blob URL in the payload to prevent storage graveyard.
// Auth-gated — only ADMIN/EDITOR can trigger a rollback.

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json() as { urls?: unknown };

  if (!Array.isArray(body.urls) || body.urls.length === 0) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  // Validate every entry is a string before passing to del()
  const urls: string[] = body.urls.filter((u): u is string => typeof u === "string");

  if (urls.length === 0) {
    return NextResponse.json({ error: "No valid URLs provided" }, { status: 400 });
  }

  console.warn(
    `[ROLLBACK] User ${session.user.id} triggered rollback for ${urls.length} blob(s).`,
  );

  // del() accepts a single URL or an array — batch delete in one API call
  await del(urls);

  console.info(`[ROLLBACK] Successfully deleted ${urls.length} orphaned blob(s).`);

  return NextResponse.json({ deleted: urls.length });
}
