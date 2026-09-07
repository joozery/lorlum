import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { sendAccountDeletedEmail } from "@/lib/email";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await connectDB();

  const doc = await Customer.findById(id).lean() as { email: string; name?: string; firstName?: string } | null;
  if (!doc) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const name = doc.name ?? doc.firstName ?? doc.email;

  await Customer.findByIdAndDelete(id);

  // ส่งอีเมลแจ้ง user — fire-and-forget ไม่ block response
  sendAccountDeletedEmail(doc.email, name).catch(err =>
    console.error("[sendAccountDeletedEmail]", err),
  );

  return NextResponse.json({ ok: true });
}
