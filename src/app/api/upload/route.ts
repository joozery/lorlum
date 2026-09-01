import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

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
      return NextResponse.json({ error: "Only JPEG, PNG, WebP allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
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
