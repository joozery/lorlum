import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AdminUser, hashPassword } from "@/models/AdminUser";

// GET /api/admin/reset-password?token=xxx  — verify token
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = new URL(req.url).searchParams.get("token");
    if (!token) return NextResponse.json({ valid: false, error: "No token" }, { status: 400 });

    const user = await AdminUser.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).select("name email resetToken resetTokenExpiry");

    if (!user) return NextResponse.json({ valid: false, error: "Token expired or invalid" }, { status: 400 });

    return NextResponse.json({ valid: true, name: user.name, email: user.email });
  } catch (err) {
    console.error("[GET /api/admin/reset-password]", err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/admin/reset-password  body: { token, password }
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "token and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }

    const user = await AdminUser.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+resetToken +resetTokenExpiry");

    if (!user) {
      return NextResponse.json({ error: "ลิงก์หมดอายุหรือไม่ถูกต้อง" }, { status: 400 });
    }

    user.passwordHash      = await hashPassword(password);
    user.resetToken        = undefined;
    user.resetTokenExpiry  = undefined;
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/reset-password]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
