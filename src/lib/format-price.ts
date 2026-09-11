import { CURRENCY_META, StoreCurrency } from "@/lib/currencies";

export type { StoreCurrency };

export function formatPrice(amountThb: number, currency: StoreCurrency, rate: number): string {
  if (currency === "THB") return "฿" + amountThb.toLocaleString("en-US");
  const converted = amountThb * rate; // rate = <currency> per 1 THB
  return CURRENCY_META[currency].symbol + converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
