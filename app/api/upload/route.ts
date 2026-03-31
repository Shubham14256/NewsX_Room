import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── Fix #2: Magic-byte signatures ───────────────────────────────────────────
// Never trust client-supplied MIME type. Read the actual file bytes.
// A renamed .exe will have a PE header (4D 5A), not a valid image signature.
const MAGIC_SIGNATURES: { mime: string; bytes: number[]; offset: number }[] = [
  { mime: "image/jpeg", bytes: [0xFF, 0xD8, 0xFF],             offset: 0 },
  { mime: "image/png",  bytes: [0x89, 0x50, 0x4E, 0x47],       offset: 0 },
  // WebP: "RIFF" at 0 + "WEBP" at 8
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46],       offset: 0 },
];

async function detectMimeFromBytes(file: File): Promise<string | null> {
  // Read only the first 12 bytes — enough for all three signatures
  const slice  = file.slice(0, 12);
  const buffer = await slice.arrayBuffer();
  const bytes  = new Uint8Array(buffer);

  for (const sig of MAGIC_SIGNATURES) {
    const match = sig.bytes.every((b, i) => bytes[sig.offset + i] === b);
    if (!match) continue;

    // Extra check for WebP: bytes 8–11 must be "WEBP" (0x57 0x45 0x42 0x50)
    if (sig.mime === "image/webp") {
      const isWebP = bytes[8] === 0x57 && bytes[9] === 0x45
                  && bytes[10] === 0x42 && bytes[11] === 0x50;
      if (!isWebP) continue;
    }

    return sig.mime;
  }
  return null; // unknown / not an allowed image
}

// ─── Fix #3: In-memory rate limiter ──────────────────────────────────────────
// Tracks upload counts per user per UTC day.
// Resets automatically at midnight UTC — no external dependency needed.
// Limit: 50 uploads per user per day (a 16-page edition = 16 uploads).
const DAILY_LIMIT = 50;

interface RateBucket { count: number; dayKey: string }
const rateBuckets = new Map<string, RateBucket>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const dayKey = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const bucket = rateBuckets.get(userId);

  if (!bucket || bucket.dayKey !== dayKey) {
    // New day or first request — reset bucket
    rateBuckets.set(userId, { count: 1, dayKey });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  if (bucket.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: DAILY_LIMIT - bucket.count };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Fix #3: Rate limit check ──────────────────────────────────────────────
  const { allowed, remaining } = checkRateLimit(session.user.id);
  if (!allowed) {
    console.warn(`[RATE_LIMIT] User ${session.user.id} exceeded daily upload limit.`);
    return NextResponse.json(
      { error: `Daily upload limit reached (${DAILY_LIMIT}/day). Try again tomorrow.` },
      {
        status: 429,
        headers: { "Retry-After": "86400", "X-RateLimit-Remaining": "0" },
      },
    );
  }

  // ── Parse form ────────────────────────────────────────────────────────────
  const form = await request.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // ── Size check (fast — no I/O) ────────────────────────────────────────────
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File exceeds 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)` },
      { status: 400 },
    );
  }

  // ── Fix #2: Magic-byte MIME validation ────────────────────────────────────
  // Reads actual file bytes — cannot be spoofed by renaming or faking headers.
  const detectedMime = await detectMimeFromBytes(file);
  if (!detectedMime) {
    console.warn(
      `[SECURITY] User ${session.user.id} attempted upload with invalid magic bytes. ` +
      `Filename: "${file.name}", claimed MIME: "${file.type}"`,
    );
    return NextResponse.json(
      { error: "File content does not match an allowed image format (JPG, PNG, WebP)." },
      { status: 400 },
    );
  }

  // ── Upload to Vercel Blob ─────────────────────────────────────────────────
  // Use detected MIME (not client-supplied) as the content type
  const safeName = `epaper/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const blob = await put(safeName, file, {
    access:      "public",
    contentType: detectedMime,
  });

  console.info(
    `[UPLOAD] User ${session.user.id} uploaded "${file.name}" → ${blob.url} ` +
    `(${(file.size / 1024).toFixed(0)} KB, ${detectedMime}). ` +
    `Daily remaining: ${remaining}`,
  );

  return NextResponse.json(
    { url: blob.url },
    { headers: { "X-RateLimit-Remaining": String(remaining) } },
  );
}
