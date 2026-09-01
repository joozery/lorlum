import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/store-auth";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });

  await connectDB();
  const customer = await Customer.findOne({ email: email.toLowerCase().trim() });

  if (!customer || customer.otpCode !== otp) {
    return NextResponse.json({ error: "รหัส OTP ไม่ถูกต้อง" }, { status: 401 });
  }
  if (!customer.otpExpiresAt || customer.otpExpiresAt < new Date()) {
    return NextResponse.json({ error: "รหัส OTP หมดอายุแล้ว กรุณาขอใหม่" }, { status: 401 });
  }

  customer.otpCode      = "";
  customer.otpExpiresAt = undefined as unknown as Date;
  customer.isVerified   = true;
  customer.lastLoginAt  = new Date();
  await customer.save();

  const token = signToken({ customerId: String(customer._id), email: customer.email });
  const res   = NextResponse.json({ ok: true, name: customer.name, email: customer.email });
  res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  return res;
}
