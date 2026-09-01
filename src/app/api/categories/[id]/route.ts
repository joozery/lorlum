import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/categories/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const category = await Category.findById(id).lean();
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (err) {
    console.error("[GET /api/categories/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PUT /api/categories/[id]  full update
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { name, nameEn, slug, description, isActive } = body;

    if (!name || !nameEn || !slug) {
      return NextResponse.json({ error: "name, nameEn and slug are required" }, { status: 400 });
    }

    const slugConflict = await Category.findOne({ slug, _id: { $ne: id } });
    if (slugConflict) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { name, nameEn, slug, description, isActive },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/categories/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH /api/categories/[id]  partial update (e.g. toggle isActive)
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const updated = await Category.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/categories/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/categories/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
