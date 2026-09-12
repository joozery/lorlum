import { NextRequest, NextResponse } from "next/server";
import { isStoreCurrency } from "@/lib/currencies";

const CACHE_MS = 24 * 60 * 60 * 1000; // 24 hours

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
    const res = await fetch(`https://ipwho.is/${ip}?fields=success,currency`);
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    const code = data?.success ? data?.currency?.code : null;
    const currency = isStoreCurrency(code) ? code : "USD"; // default for unsupported currencies
    cache.set(ip, { currency, expiresAt: Date.now() + CACHE_MS });
    return NextResponse.json({ currency });
  } catch (err) {
    console.error("[GET /api/store/geo-currency]", err);
    return NextResponse.json({ currency: null });
  }
}
