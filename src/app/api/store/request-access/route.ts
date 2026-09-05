import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AccessRequest } from "@/models/AccessRequest";
import { sendAccessRequestEmails } from "@/lib/email";

function genApplicationNo() {
  const num = Math.floor(1000 + Math.random() * 8999);
  return `LX-2026-${num}`;
}

export async function POST(req: NextRequest) {
  try {
    const { fname, email, location, interest } = await req.json();
    if (!fname || !email || !location) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    let applicationNo = genApplicationNo();
    // ensure unique (retry once on collision)
    const existing = await AccessRequest.findOne({ applicationNo });
    if (existing) applicationNo = genApplicationNo();

    await AccessRequest.create({ fname, email, location, interest, applicationNo });

    await sendAccessRequestEmails({ fname, email, location, interest, applicationNo });

    return NextResponse.json({ ok: true, applicationNo });
  } catch (err) {
    console.error("[POST /api/store/request-access]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "pending";
  try {
    await connectDB();
    const requests = await AccessRequest.find(
      status === "all" ? {} : { status }
    ).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, requests });
  } catch (err) {
    console.error("[GET /api/store/request-access]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
