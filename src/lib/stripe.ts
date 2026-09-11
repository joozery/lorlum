import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { PaymentSettings } from "@/models/PaymentSettings";

interface CachedPaymentSettings {
  stripe: Stripe | null;
  webhookSecret: string;
  enabled: boolean;
  publishableKey: string;
  expiresAt: number;
}

const CACHE_MS = 60 * 1000;

let cache: CachedPaymentSettings | null = null;

export async function getPaymentSettings(): Promise<CachedPaymentSettings> {
  if (cache && Date.now() < cache.expiresAt) return cache;

  await connectDB();
  let doc = await PaymentSettings.findOne({ key: "main" }).lean();
  if (!doc) doc = await PaymentSettings.create({ key: "main" });
  const secretKey = doc?.secretKey || "";

  cache = {
    stripe: secretKey ? new Stripe(secretKey, { apiVersion: "2026-08-26.dahlia" }) : null,
    webhookSecret: doc?.webhookSecret || "",
    enabled: doc?.enabled ?? true,
    publishableKey: doc?.publishableKey || "",
    expiresAt: Date.now() + CACHE_MS,
  };
  return cache;
}
