import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { StoreLanguageProvider } from "@/contexts/store-language-context";
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

export const metadata: Metadata = {
  title: "LORLUM — Luxury Footwear",
  description: "Masterpiece handcrafted luxury shore footwear.",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreLanguageProvider>
      <CartProvider>
        <div className={`${cormorant.variable} ${jost.variable} store-body`}>
          {children}
          <CookieBanner />
        </div>
      </CartProvider>
    </StoreLanguageProvider>
  );
}
