import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CurrencySettings } from "@/models/CurrencySettings";

export async function GET() {
  await connectDB();
  let doc = await CurrencySettings.findOne({ key: "main" }).lean();
  if (!doc) doc = await CurrencySettings.create({ key: "main" });
  return NextResponse.json({
    enabledCurrencies: doc.enabledCurrencies,
    allowCustomerSwitch: doc.allowCustomerSwitch,
  });
}
