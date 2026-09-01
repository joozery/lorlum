import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LegalContent from "@/models/LegalContent";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  await connectDB();
  if (type) {
    const doc = await LegalContent.findOne({ type });
    return NextResponse.json(doc ?? { type, sections: [] });
  }
  const all = await LegalContent.find({});
  return NextResponse.json(all);
}

export async function PUT(req: NextRequest) {
  const { type, sections } = await req.json();
  if (!type || !sections) return NextResponse.json({ error: "type and sections required" }, { status: 400 });
  await connectDB();
  const doc = await LegalContent.findOneAndUpdate(
    { type },
    { type, sections },
    { upsert: true, new: true }
  );
  return NextResponse.json(doc);
}
