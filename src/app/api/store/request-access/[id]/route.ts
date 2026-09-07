import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AccessRequest } from "@/models/AccessRequest";
import { sendAccessDecisionEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { status } = await req.json();

  if (!["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  await connectDB();

  const prev = await AccessRequest.findById(id).lean() as {
    email: string; fname: string; applicationNo: string; status: string;
  } | null;
  if (!prev) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const doc = await AccessRequest.findByIdAndUpdate(id, { status }, { new: true }).lean();

  // ส่งอีเมลเฉพาะตอนที่ status เปลี่ยนเป็น approved หรือ rejected
  if ((status === "approved" || status === "rejected") && prev.status !== status) {
    sendAccessDecisionEmail(prev.email, prev.fname, prev.applicationNo, status).catch(err =>
      console.error("[sendAccessDecisionEmail]", err),
    );
  }

  return NextResponse.json({ ok: true, request: doc });
}
