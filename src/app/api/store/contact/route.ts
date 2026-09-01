import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    await ContactMessage.create({ ...body, status: "new" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/store/contact]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
