import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SiteSettings } from "@/models/SiteSettings";

export async function GET() {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne({ key: "main" }).lean();
    if (!settings) {
      settings = await SiteSettings.create({ key: "main" });
    }
    return NextResponse.json(settings);
  } catch (err) {
    console.error("[GET /api/site-settings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      { $set: body },
      { new: true, upsert: true }
    ).lean();
    return NextResponse.json(settings);
  } catch (err) {
    console.error("[PUT /api/site-settings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
