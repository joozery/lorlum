"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StoreCurrency, isStoreCurrency } from "@/lib/currencies";

export type { StoreCurrency };

const CACHE_KEY = "store-currency-rates";
const CACHE_MS = 60 * 60 * 1000;

interface StoreCurrencyCtxValue {
  currency: StoreCurrency;
  setCurrency: (c: StoreCurrency) => void;
  rate: number; // <currency> per 1 THB (1 when currency is THB)
  rateLoading: boolean;
  availableCurrencies: StoreCurrency[];
  allowSwitch: boolean;
}

const StoreCurrencyCtx = createContext<StoreCurrencyCtxValue>({
  currency: "THB",
  setCurrency: () => {},
  rate: 1,
  rateLoading: false,
  availableCurrencies: ["THB"],
  allowSwitch: false,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<StoreCurrency>("THB");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [rateLoading, setRateLoading] = useState(true);
  const [availableCurrencies, setAvailableCurrencies] = useState<StoreCurrency[]>(["THB"]);
  const [allowSwitch, setAllowSwitch] = useState(false);

  useEffect(() => {
    const savedCur = localStorage.getItem("store-currency");

    let cachedRates: { rates: Record<string, number>; updatedAt: number } | null = null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      cachedRates = raw ? JSON.parse(raw) : null;
    } catch {
      cachedRates = null;
    }
    if (cachedRates && Date.now() - cachedRates.updatedAt < CACHE_MS) {
      setRates(cachedRates.rates);
      setRateLoading(false);
    } else {
      fetch("/api/store/exchange-rate")
        .then((r) => r.json())
        .then((d) => {
          if (d?.rates) {
            setRates(d.rates);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: d.rates, updatedAt: Date.now() }));
          } else if (cachedRates) {
            setRates(cachedRates.rates);
          }
        })
        .catch(() => {
          if (cachedRates) setRates(cachedRates.rates);
        })
        .finally(() => setRateLoading(false));
    }

    fetch("/api/store/currency-options")
      .then((r) => r.json())
      .then((d) => {
        const enabled: StoreCurrency[] = Array.isArray(d?.enabledCurrencies)
          ? d.enabledCurrencies.filter(isStoreCurrency)
          : ["THB"];
        setAvailableCurrencies(enabled.length ? enabled : ["THB"]);
        setAllowSwitch(!!d?.allowCustomerSwitch);

        if (savedCur && isStoreCurrency(savedCur) && enabled.includes(savedCur)) {
          setCurrencyState(savedCur);
          return;
        }

        // No saved preference yet — try to guess from the visitor's country.
        fetch("/api/store/geo-currency")
          .then((r) => r.json())
          .then((g) => {
            if (isStoreCurrency(g?.currency) && enabled.includes(g.currency)) {
              setCurrency(g.currency);
            } else {
              setCurrencyState("THB");
            }
          })
          .catch(() => setCurrencyState("THB"));
      })
      .catch(() => {});
  }, []);

  const setCurrency = (c: StoreCurrency) => {
    setCurrencyState(c);
    localStorage.setItem("store-currency", c);
  };

  const rate = currency === "THB" ? 1 : rates[currency] ?? 0;

  return (
    <StoreCurrencyCtx.Provider value={{ currency, setCurrency, rate, rateLoading, availableCurrencies, allowSwitch }}>
      {children}
    </StoreCurrencyCtx.Provider>
  );
}

export const useStoreCurrency = () => useContext(StoreCurrencyCtx);
