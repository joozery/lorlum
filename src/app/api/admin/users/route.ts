import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { AdminUser, hashPassword } from "@/models/AdminUser";
import { sendAdminInviteEmail } from "@/lib/email";

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

// POST /api/admin/users  body: { name, email, phone?, role, password?, isActive? }
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone = "", role = "staff", password, isActive = true } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    const exists = await AdminUser.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    // Use provided password or a random placeholder (user will set via invite link)
    const plainPassword = password || crypto.randomBytes(16).toString("hex");
    const passwordHash  = await hashPassword(plainPassword);

    // Generate invite / password-reset token (valid 72 h)
    const resetToken       = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const user = await AdminUser.create({
      name, email, phone, role, passwordHash, isActive,
      resetToken, resetTokenExpiry,
    });

    // Send invite email
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const inviteLink = `${base}/set-password?token=${resetToken}`;
    let emailSent = false;
    let emailError = "";
    try {
      await sendAdminInviteEmail(email, name, inviteLink, role);
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr instanceof Error ? mailErr.message : String(mailErr);
      console.error("[invite email]", emailError);
    }

    const safe = { ...user.toObject(), passwordHash: undefined, resetToken: undefined, resetTokenExpiry: undefined };
    return NextResponse.json({ ...safe, inviteLink, emailSent, emailError }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/users]", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
