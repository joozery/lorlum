import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { StoreLanguageProvider } from "@/contexts/store-language-context";
import { CurrencyProvider } from "@/contexts/store-currency-context";
import { CartProvider } from "@/context/cart";
import { CookieBanner } from "@/components/store/cookie-banner";
import "./store.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = "/logolorlum.svg";
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";
    const res = await fetch(`${base}/api/site-settings`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.faviconUrl) faviconUrl = data.faviconUrl;
    }
  } catch {
    // fallback to default
  }
  return {
    title: "LORLUM — Luxury Footwear",
    description: "Masterpiece handcrafted luxury shore footwear.",
    icons: { icon: faviconUrl },
  };
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreLanguageProvider>
      <CurrencyProvider>
        <CartProvider>
          <div className={`${cormorant.variable} ${jost.variable} store-body`}>
            {children}
            <CookieBanner />
          </div>
        </CartProvider>
      </CurrencyProvider>
    </StoreLanguageProvider>
  );
}
