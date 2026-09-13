import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "video/mp4":  "mp4",
  "video/webm": "webm",
};
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_SIZE       = 5 * 1024 * 1024;  // 5 MB — images
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20 MB — video

// POST /api/upload
// Body: FormData { file: File, productId?: string, colorName?: string }
// Returns: { url: string }
export async function POST(req: NextRequest) {
  try {
    const form      = await req.formData();
    const file      = form.get("file") as File | null;
    const productId = (form.get("productId") as string | null) ?? "general";
    const colorName = (form.get("colorName") as string | null) ?? "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED[file.type]) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, MP4, WebM allowed" }, { status: 400 });
    }
    const isVideo = VIDEO_TYPES.has(file.type);
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large (max ${maxSize / (1024 * 1024)} MB)` }, { status: 400 });
    }

    const ext      = ALLOWED[file.type];
    const slug     = colorName ? colorName.toLowerCase().replace(/[^a-z0-9]/g, "-") : "";
    const filename = `${Date.now()}${slug ? `-${slug}` : ""}.${ext}`;
    const key      = `products/${productId}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url    = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
