export type StoreCurrency = "THB" | "USD" | "EUR" | "SGD" | "GBP";

export const CURRENCY_META: Record<StoreCurrency, { symbol: string; flag: string; label: string }> = {
  THB: { symbol: "฿", flag: "🇹🇭", label: "THB" },
  USD: { symbol: "$", flag: "🇺🇸", label: "USD" },
  EUR: { symbol: "€", flag: "🇪🇺", label: "EUR" },
  SGD: { symbol: "S$", flag: "🇸🇬", label: "SGD" },
  GBP: { symbol: "£", flag: "🇬🇧", label: "GBP" },
};

export const ALL_CURRENCIES: StoreCurrency[] = ["THB", "USD", "EUR", "SGD", "GBP"];

export function isStoreCurrency(v: unknown): v is StoreCurrency {
  return typeof v === "string" && (ALL_CURRENCIES as string[]).includes(v);
}
