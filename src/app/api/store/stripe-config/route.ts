import { NextResponse } from "next/server";
import { getPaymentSettings } from "@/lib/stripe";

export async function GET() {
  const { enabled, publishableKey } = await getPaymentSettings();
  return NextResponse.json({ enabled, publishableKey: publishableKey || null });
}
