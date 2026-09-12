import { NextRequest, NextResponse } from "next/server";

const CACHE_MS = 24 * 60 * 60 * 1000; // 24 hours

const EUR_COUNTRIES = new Set([
  "DE", "FR", "IT", "ES", "NL", "BE", "AT", "PT", "IE", "FI",
  "GR", "LU", "SK", "SI", "EE", "LV", "LT", "CY", "MT", "HR",
]);

function countryToCurrency(countryCode: string): string {
  if (countryCode === "TH") return "THB";
  if (countryCode === "US") return "USD";
  if (countryCode === "GB") return "GBP";
  if (countryCode === "SG") return "SGD";
  if (countryCode === "AE") return "AED";
  if (EUR_COUNTRIES.has(countryCode)) return "EUR";
  return "USD"; // default for any other country
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
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    const currency = typeof data?.countryCode === "string" ? countryToCurrency(data.countryCode) : null;
    cache.set(ip, { currency, expiresAt: Date.now() + CACHE_MS });
    return NextResponse.json({ currency });
  } catch (err) {
    console.error("[GET /api/store/geo-currency]", err);
    return NextResponse.json({ currency: null });
  }
}
