import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CurrencySettings } from "@/models/CurrencySettings";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { isStoreCurrency } from "@/lib/currencies";

export async function GET(req: NextRequest) {
  if (!verifyAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  let doc = await CurrencySettings.findOne({ key: "main" }).lean();
  if (!doc) doc = await CurrencySettings.create({ key: "main" });
  return NextResponse.json({
    enabledCurrencies: doc.enabledCurrencies,
    allowCustomerSwitch: doc.allowCustomerSwitch,
  });
}

export async function PUT(req: NextRequest) {
  if (!verifyAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (Array.isArray(body.enabledCurrencies)) {
    const valid = body.enabledCurrencies.filter(isStoreCurrency);
    update.enabledCurrencies = Array.from(new Set(["THB", ...valid]));
  }
  if (typeof body.allowCustomerSwitch === "boolean") update.allowCustomerSwitch = body.allowCustomerSwitch;

  await connectDB();
  const doc = await CurrencySettings.findOneAndUpdate(
    { key: "main" },
    { $set: update },
    { new: true, upsert: true }
  ).lean();

  return NextResponse.json({
    enabledCurrencies: doc.enabledCurrencies,
    allowCustomerSwitch: doc.allowCustomerSwitch,
  });
}
