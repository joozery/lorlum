import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/store-auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 });

  await connectDB();
  const customer = await Customer.findOne({ email: email.toLowerCase().trim() });

  if (!customer || !customer.passwordHash) {
    return NextResponse.json({ error: "ไม่พบบัญชีนี้หรือยังไม่ได้ตั้งรหัสผ่าน" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, customer.passwordHash);
  if (!ok) return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });

  customer.lastLoginAt = new Date();
  await customer.save();

  const token = signToken({ customerId: String(customer._id), email: customer.email });
  const res = NextResponse.json({ ok: true, name: customer.name, email: customer.email });
  res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  return res;
}
