import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { getSession } from "@/lib/store-auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const customer = await Customer.findById(session.customerId)
    .select("-passwordHash -otpCode -otpExpiresAt")
    .lean();
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(customer);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  const oid = new mongoose.Types.ObjectId(String(session.customerId));
  const col  = mongoose.connection.collection("customers");

  // Build $set using native driver — bypasses Mongoose schema processing entirely
  const $set: Record<string, unknown> = {};

  if (body.firstName !== undefined) {
    $set.firstName = String(body.firstName).trim();
  }
  if (body.lastName !== undefined) {
    $set.lastName = String(body.lastName).trim();
  }
  if (body.firstName !== undefined || body.lastName !== undefined) {
    const fn = body.firstName !== undefined ? String(body.firstName).trim() : "";
    const ln = body.lastName  !== undefined ? String(body.lastName).trim()  : "";
    $set.name = [fn, ln].filter(Boolean).join(" ");
  }
  if (body.name !== undefined && body.firstName === undefined) {
    $set.name = String(body.name);
  }
  if (body.phone !== undefined) {
    $set.phone = String(body.phone);
  }

  // Address — write directly to MongoDB, no Mongoose casting
  if (body.address !== undefined) {
    $set.addresses = [{
      label:     "Home",
      line1:     String(body.address.line1    ?? ""),
      line2:     String(body.address.line2    ?? ""),
      province:  String(body.address.province ?? ""),
      city:      String(body.address.city     ?? ""),
      zip:       String(body.address.zip      ?? ""),
      country:   "Thailand",
      isDefault: true,
    }];
  }

  if (body.password) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }
    $set.passwordHash = await bcrypt.hash(body.password, 10);
  }

  await col.updateOne({ _id: oid }, { $set });

  // Return updated doc (exclude sensitive fields)
  const updated = await col.findOne(
    { _id: oid },
    { projection: { passwordHash: 0, otpCode: 0, otpExpiresAt: 0 } }
  );
  return NextResponse.json(updated);
}
