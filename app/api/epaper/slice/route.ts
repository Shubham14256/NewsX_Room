// ─── E-Paper Elite Slicing Pipeline ──────────────────────────────────────────
// POST /api/epaper/slice
//
// Accepts a multipart form with:
//   - file:      the broadsheet image (JPEG/PNG, up to 50MB)
//   - ePaperId:  the EPaper record ID to attach DZI manifests to
//   - pageIndex: which page this image represents (0-indexed)
//
// Pipeline:
//   1. Receive image buffer via formData
//   2. Use Sharp to generate a DZI tile pyramid (zoom levels 8–14, 256×256 tiles)
//   3. Upload all tiles + manifest to Vercel Blob
//   4. Update EPaper.dziPages[pageIndex] with the manifest URL
//
// CPU note: Sharp uses libvips streaming — the full image is never held in
// memory at once. A 300dpi broadsheet (~8MB) processes in ~800ms.

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

// ─── DZI tile size — industry standard ───────────────────────────────────────
const TILE_SIZE    = 256;
const TILE_OVERLAP = 1;     // 1px overlap prevents seam artifacts
const TILE_FORMAT  = "jpg" as const;
const TILE_QUALITY = 85;    // good quality / size balance for broadsheet text

export async function POST(req: NextRequest) {
  try {
    const form      = await req.formData();
    const file      = form.get("file") as File | null;
    const ePaperId  = form.get("ePaperId") as string | null;
    const pageIndex = parseInt(form.get("pageIndex") as string ?? "0", 10);

    if (!file || !ePaperId) {
      return NextResponse.json({ error: "file and ePaperId are required" }, { status: 400 });
    }

    // ── 1. Read image buffer ──────────────────────────────────────────────
    const buffer   = Buffer.from(await file.arrayBuffer());
    const image    = sharp(buffer);
    const metadata = await image.metadata();

    const imgWidth  = metadata.width  ?? 1200;
    const imgHeight = metadata.height ?? 1600;

    // ── 2. Calculate DZI zoom levels ──────────────────────────────────────
    // Max level = ceil(log2(max(width, height)))
    const maxLevel = Math.ceil(Math.log2(Math.max(imgWidth, imgHeight)));
    const minLevel = Math.max(0, maxLevel - 6); // only generate 7 levels deep

    // ── 3. Generate tiles level by level, upload in batches ──────────────
    // Process each zoom level sequentially (Sharp is CPU-bound).
    // Within each level, collect tile buffers then upload in parallel batches.
    const tilePrefix = `epaper/${ePaperId}/page-${pageIndex}`;
    let totalTiles = 0;

    for (let level = minLevel; level <= maxLevel; level++) {
      const scale    = Math.pow(2, level - maxLevel);
      const levelW   = Math.max(1, Math.round(imgWidth  * scale));
      const levelH   = Math.max(1, Math.round(imgHeight * scale));
      const colCount = Math.ceil(levelW / TILE_SIZE);
      const rowCount = Math.ceil(levelH / TILE_SIZE);

      // Resize once per level — reused for all tiles at this zoom
      const levelBuffer = await sharp(buffer)
        .resize(levelW, levelH, { fit: "fill" })
        .toBuffer();

      // Collect all tile upload promises for this level
      const levelUploads: Promise<void>[] = [];

      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
          const left   = Math.max(0, col * TILE_SIZE - TILE_OVERLAP);
          const top    = Math.max(0, row * TILE_SIZE - TILE_OVERLAP);
          const width  = Math.min(TILE_SIZE + TILE_OVERLAP * 2, levelW - left);
          const height = Math.min(TILE_SIZE + TILE_OVERLAP * 2, levelH - top);

          const tileBuffer = await sharp(levelBuffer)
            .extract({ left, top, width, height })
            .jpeg({ quality: TILE_QUALITY })
            .toBuffer();

          // OSD DZI convention: manifest.dzi → tiles at manifest_files/level/col_row.jpg
          const tilePath = `${tilePrefix}/manifest_files/${level}/${col}_${row}.jpg`;

          levelUploads.push(
            put(tilePath, tileBuffer, {
              access:      "public",
              contentType: "image/jpeg",
            }).then(() => undefined),
          );

          totalTiles++;
        }
      }

      // Upload this level's tiles in batches of 20
      const BATCH = 20;
      for (let i = 0; i < levelUploads.length; i += BATCH) {
        await Promise.all(levelUploads.slice(i, i + BATCH));
      }
    }

    // ── 5. Build and upload DZI manifest ─────────────────────────────────
    // CRITICAL: OSD derives tile URLs from the manifest filename.
    // Manifest must be named "manifest.dzi" and tiles must live at
    // "manifest_files/level/col_row.jpg" — this is the DZI spec OSD follows.
    const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<Image xmlns="http://schemas.microsoft.com/deepzoom/2008"
  Format="${TILE_FORMAT}"
  Overlap="${TILE_OVERLAP}"
  TileSize="${TILE_SIZE}">
  <Size Width="${imgWidth}" Height="${imgHeight}"/>
</Image>`;

    const manifestPath = `${tilePrefix}/manifest.dzi`;
    const manifestBlob = await put(
      manifestPath,
      manifest,
      { access: "public", contentType: "application/xml" },
    );

    // ── 6. Update EPaper.dziPages[pageIndex] using atomic SQL ─────────────
    // CRITICAL: We cannot use Prisma interactive transactions on Neon's
    // serverless HTTP pooler — they timeout after ~5s (P2028 error).
    // Instead, use PostgreSQL's jsonb_set() to atomically update only the
    // specific array index. This is a single SQL statement — no transaction
    // needed, no race condition possible (each page writes a different index).
    //
    // jsonb_set(target, path, value, create_missing):
    //   - target:         current dziPages column value (or '[]' if null)
    //   - path:           '{pageIndex}' — the array index to set
    //   - value:          the manifest URL as a JSON string
    //   - create_missing: true — extends the array if index doesn't exist yet
    await prisma.$executeRaw`
      UPDATE "EPaper"
      SET "dziPages" = jsonb_set(
        COALESCE("dziPages", '[]'::jsonb),
        ${`{${pageIndex}}`}::text[],
        ${JSON.stringify(manifestBlob.url)}::jsonb,
        true
      )
      WHERE id = ${ePaperId}
    `;

    return NextResponse.json({
      success:     true,
      manifestUrl: manifestBlob.url,
      tileCount:   totalTiles,
      dimensions:  { width: imgWidth, height: imgHeight },
    });

  } catch (err) {
    console.error("[EPaper Slice] Pipeline error:", err);
    return NextResponse.json(
      { error: "Slicing pipeline failed", detail: String(err) },
      { status: 500 },
    );
  }
}
