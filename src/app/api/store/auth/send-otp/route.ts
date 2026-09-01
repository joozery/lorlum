import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { generateOTP } from "@/lib/store-auth";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 });

  await connectDB();

  let customer = await Customer.findOne({ email: email.toLowerCase().trim() });
  if (!customer) {
    customer = await Customer.create({ email: email.toLowerCase().trim() });
  }

  const otp = generateOTP();
  customer.otpCode      = otp;
  customer.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await customer.save();

  await sendOtpEmail(email, otp, "login");

  return NextResponse.json({ ok: true });
}
