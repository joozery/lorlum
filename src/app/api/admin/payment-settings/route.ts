import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PaymentSettings } from "@/models/PaymentSettings";
import { verifyAdminRequest } from "@/lib/admin-auth";

function mask(value: string): string {
  return value ? value.slice(-4) : "";
}

function sanitize(doc: { enabled: boolean; mode: string; publishableKey: string; secretKey: string; webhookSecret: string }) {
  return {
    enabled: doc.enabled,
    mode: doc.mode,
    publishableKey: doc.publishableKey,
    hasSecretKey: !!doc.secretKey,
    secretKeyPreview: mask(doc.secretKey),
    hasWebhookSecret: !!doc.webhookSecret,
    webhookSecretPreview: mask(doc.webhookSecret),
  };
}

export async function GET(req: NextRequest) {
  const session = verifyAdminRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  let doc = await PaymentSettings.findOne({ key: "main" }).lean();
  if (!doc) doc = await PaymentSettings.create({ key: "main" });

  const reveal = req.nextUrl.searchParams.get("reveal");
  if (reveal === "secretKey" || reveal === "webhookSecret") {
    return NextResponse.json({ ...sanitize(doc), [reveal]: doc[reveal] || "" });
  }
  return NextResponse.json(sanitize(doc));
}

export async function PUT(req: NextRequest) {
  if (!verifyAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.enabled === "boolean") update.enabled = body.enabled;
  if (body.mode === "test" || body.mode === "live") update.mode = body.mode;
  if (typeof body.publishableKey === "string") update.publishableKey = body.publishableKey;
  if (typeof body.secretKey === "string" && body.secretKey.trim()) update.secretKey = body.secretKey.trim();
  if (typeof body.webhookSecret === "string" && body.webhookSecret.trim()) update.webhookSecret = body.webhookSecret.trim();

  await connectDB();
  const doc = await PaymentSettings.findOneAndUpdate(
    { key: "main" },
    { $set: update },
    { new: true, upsert: true }
  ).lean();

  return NextResponse.json(sanitize(doc));
}
