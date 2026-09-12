import { NextResponse } from "next/server";

// Fallback multipliers: approx <currency> per 1 THB, updated 2026-09
const FALLBACK_RATES: Record<string, number> = {
  USD: 0.0274,
  EUR: 0.0253,
  SGD: 0.0365,
  GBP: 0.0217,
  AED: 0.1006,
};
const CACHE_MS = 60 * 60 * 1000; // 1 hour

let cache: { rates: Record<string, number>; updatedAt: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.updatedAt < CACHE_MS) {
    return NextResponse.json(cache);
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/THB", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    const rates = data?.rates;
    if (!rates || typeof rates !== "object") throw new Error("bad payload");
    cache = { rates, updatedAt: Date.now() };
    return NextResponse.json(cache);
  } catch (err) {
    console.error("[GET /api/store/exchange-rate]", err);
    return NextResponse.json(cache ?? { rates: FALLBACK_RATES, updatedAt: Date.now() });
  }
}
