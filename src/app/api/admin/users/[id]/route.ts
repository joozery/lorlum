import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AdminUser, hashPassword } from "@/models/AdminUser";

type Ctx = { params: Promise<{ id: string }> };
const SAFE_FIELDS = "-passwordHash";

// GET /api/admin/users/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await AdminUser.findById(id, SAFE_FIELDS).lean();
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    console.error("[GET /api/admin/users/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PUT /api/admin/users/[id]  full update (password optional)
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, role, isActive, password } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "name, email and role are required" }, { status: 400 });
    }

    const emailConflict = await AdminUser.findOne({ email, _id: { $ne: id } });
    if (emailConflict) {
      return NextResponse.json({ error: "Email already used by another user" }, { status: 409 });
    }

    const update: Record<string, unknown> = { name, email, phone, role, isActive };
    if (password) update.passwordHash = await hashPassword(password);

    const updated = await AdminUser.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .select(SAFE_FIELDS).lean();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/admin/users/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id]  partial (toggle isActive, etc.)
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.password) {
      body.passwordHash = await hashPassword(body.password);
      delete body.password;
    }

    const updated = await AdminUser.findByIdAndUpdate(id, body, { new: true })
      .select(SAFE_FIELDS).lean();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/admin/users/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await AdminUser.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/users/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
