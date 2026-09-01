import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/models/Purchase";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/purchases/[id]  — update status
export async function PATCH(req: NextRequest, { params }: Ctx) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const allowed = ["draft", "ordered", "received", "cancelled"];
  if (body.status && !allowed.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const po = await Purchase.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
  if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, po });
}

// GET /api/purchases/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  await connectDB();
  const { id } = await params;
  const po = await Purchase.findById(id).lean();
  if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ po });
}
