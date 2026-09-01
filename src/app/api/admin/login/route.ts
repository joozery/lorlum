import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { AdminUser } from "@/models/AdminUser";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE     = "admin-token";

export async function POST(req: NextRequest) {
  try {
    const { email, password, remember = false } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 });
    }

    await connectDB();
    const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const ok = await user.verifyPassword(password);
    if (!ok) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    // Update last login
    await AdminUser.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8; // 30d or 8h
    const token  = jwt.sign(
      { userId: String(user._id), email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: maxAge }
    );

    const res = NextResponse.json({
      ok:   true,
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    });

    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path:     "/",
    });

    return res;
  } catch (err) {
    console.error("[POST /api/admin/login]", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
