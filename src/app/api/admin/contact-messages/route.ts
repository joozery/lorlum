import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get("status") || "";
    const filter = status ? { status } : {};
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[GET /api/admin/contact-messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { id, status } = await req.json();
    const msg = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true }).lean();
    return NextResponse.json({ ok: true, msg });
  } catch (err) {
    console.error("[PATCH /api/admin/contact-messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { id } = await req.json();
    await ContactMessage.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/contact-messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
