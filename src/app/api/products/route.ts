import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

// GET /api/products?search=&category=&featured=&status=&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const search   = searchParams.get("search")   || "";
    const category = searchParams.get("category") || "";
    const featured = searchParams.get("featured") || "";
    const status   = searchParams.get("status")   || "";
    const page     = Math.max(1, Number(searchParams.get("page")  || 1));
    const limit    = Math.min(100, Number(searchParams.get("limit") || 50));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name:   { $regex: search, $options: "i" } },
        { nameEn: { $regex: search, $options: "i" } },
        { sku:    { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (featured === "yes") filter.featured = true;
    if (featured === "no")  filter.featured = false;
    if (status === "active")   filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({ products, total, page, limit });
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/products]", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg.includes("duplicate key") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
