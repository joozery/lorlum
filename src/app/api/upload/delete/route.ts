import { NextRequest, NextResponse } from "next/server";
import { deleteFromR2, keyFromUrl } from "@/lib/r2";

// DELETE /api/upload/delete  body: { url: "https://pub-xxx.r2.dev/products/..." }
export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string };
    if (!url?.includes("r2.dev/")) {
      return NextResponse.json({ error: "Invalid R2 URL" }, { status: 400 });
    }
    const key = keyFromUrl(url);
    await deleteFromR2(key);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/upload/delete]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
