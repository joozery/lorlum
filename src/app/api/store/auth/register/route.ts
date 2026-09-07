import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { generateOTP } from "@/lib/store-auth";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { name, email, phone, password } = await req.json();
  if (!email || !password || !phone) {
    return NextResponse.json({ error: "กรุณากรอกอีเมล เบอร์โทรศัพท์ และรหัสผ่าน" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
  }

  await connectDB();

  const exists = await Customer.findOne({ email: email.toLowerCase().trim() });
  if (exists?.isVerified) {
    return NextResponse.json({ error: "อีเมลนี้มีบัญชีอยู่แล้ว" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp          = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Customer.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { name: name?.trim() ?? "", phone: phone.trim(), passwordHash, otpCode: otp, otpExpiresAt, isVerified: false },
    { upsert: true, new: true }
  );

  await sendOtpSms(phone, otp);

  return NextResponse.json({ ok: true, needsVerification: true, email });
}
