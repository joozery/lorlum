import { NextRequest, NextResponse } from "next/server";
import { StoreCurrency } from "@/lib/currencies";

const CACHE_MS = 24 * 60 * 60 * 1000; // 24 hours

const EUROZONE_COUNTRIES = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

function currencyForCountry(countryCode: string | null | undefined): StoreCurrency {
  if (!countryCode) return "USD";
  const cc = countryCode.toUpperCase();
  if (cc === "TH") return "THB";
  if (cc === "SG") return "SGD";
  if (cc === "GB") return "GBP";
  if (cc === "AE") return "AED";
  if (EUROZONE_COUNTRIES.has(cc)) return "EUR";
  return "USD";
}

function getVisitorIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

const cache = new Map<string, { currency: string | null; expiresAt: number }>();

export async function GET(req: NextRequest) {
  const ip = getVisitorIp(req);
  if (!ip) return NextResponse.json({ currency: null });

  const cached = cache.get(ip);
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json({ currency: cached.currency });
  }

  try {
    const res = await fetch(`https://ipwho.is/${ip}?fields=success,country_code`);
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    const currency = data?.success ? currencyForCountry(data?.country_code) : "USD";
    cache.set(ip, { currency, expiresAt: Date.now() + CACHE_MS });
    return NextResponse.json({ currency });
  } catch (err) {
    console.error("[GET /api/store/geo-currency]", err);
    return NextResponse.json({ currency: null });
  }
}
