import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AdminUser, hashPassword } from "@/models/AdminUser";

const SAFE_FIELDS = "-passwordHash";

// GET /api/admin/users?search=&role=&status=&page=1&limit=50
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const role   = searchParams.get("role")   ?? "";
    const status = searchParams.get("status") ?? "";
    const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit  = Math.min(100, Number(searchParams.get("limit") ?? 50));

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role)              filter.role     = role;
    if (status === "active")   filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const [users, total] = await Promise.all([
      AdminUser.find(filter, SAFE_FIELDS).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AdminUser.countDocuments(filter),
    ]);

    return NextResponse.json({ users, total, page, limit });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/admin/users  body: { name, email, phone?, role, password, isActive? }
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone = "", role = "staff", password, isActive = true } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
    }

    const exists = await AdminUser.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await AdminUser.create({ name, email, phone, role, password: undefined, passwordHash, isActive });

    const safe = { ...user.toObject(), passwordHash: undefined };
    return NextResponse.json(safe, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/users]", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
