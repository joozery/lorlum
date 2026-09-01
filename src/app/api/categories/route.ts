import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";

// GET /api/categories?search=&status=active|inactive&page=1&limit=50
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit  = Math.min(100, Number(searchParams.get("limit") ?? 50));

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name:   { $regex: search, $options: "i" } },
        { nameEn: { $regex: search, $options: "i" } },
        { slug:   { $regex: search, $options: "i" } },
      ];
    }
    if (status === "active")   filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const [categories, total] = await Promise.all([
      Category.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Category.countDocuments(filter),
    ]);

    return NextResponse.json({ categories, total, page, limit });
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories  body: { name, nameEn, slug, description?, isActive? }
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, nameEn, slug, description = "", isActive = true } = body;

    if (!name || !nameEn || !slug) {
      return NextResponse.json({ error: "name, nameEn and slug are required" }, { status: 400 });
    }

    const exists = await Category.findOne({ slug });
    if (exists) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const category = await Category.create({ name, nameEn, slug, description, isActive });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("[POST /api/categories]", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
