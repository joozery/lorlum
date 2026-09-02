"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { useStoreLang } from "@/contexts/store-language-context";
import ST from "@/lib/store-translations";

interface WishProduct {
  _id: string; name: string; nameEn: string; price: number; imageUrl: string;
  colorVariants: { images: string[] }[];
}

export default function WishlistPage() {
  const router = useRouter();
  const { lang } = useStoreLang();
  const t = ST[lang];

  const NAV = [
    { href: "/account/profile",  label: t.profNavProfile },
    { href: "/account/orders",   label: t.profNavOrders },
    { href: "/account/wishlist", label: t.profNavWishlist },
  ];

  const [items,   setItems]   = useState<WishProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/store/wishlist")
      .then(r => { if (r.status === 401) { router.push("/account"); return null; } return r.json(); })
      .then(d => { if (d) setItems(d.wishlist ?? []); })
      .finally(() => setLoading(false));
  }, [router]);

  const removeItem = async (id: string) => {
    setItems(prev => prev.filter(p => p._id !== id));
    await fetch("/api/store/wishlist", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, action: "remove" }),
    });
  };

  const getImage = (p: WishProduct) =>
    p.colorVariants?.[0]?.images?.[0] ?? p.imageUrl ?? "";

  return (
    <div className="font-jost bg-ivory min-h-screen">
      <StoreNav active="home" cartCount={0} />

      <div className="max-w-[900px] mx-auto px-5 md:px-8 pt-28 pb-24">
        <div className="mb-10">
          <span className="block text-[8px] tracking-[0.5em] uppercase text-gold mb-2">{t.myAccount}</span>
          <h1 className="font-cormorant text-[32px] font-normal text-espresso">{t.wishlistTitle}</h1>
        </div>

        <div className="flex gap-0 border-b border-gold/20 mb-10">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`px-5 pb-3 text-[9px] tracking-[0.28em] uppercase no-underline transition-colors font-jost ${
                n.href === "/account/wishlist"
                  ? "text-espresso border-b-2 border-gold -mb-px"
                  : "text-muted hover:text-espresso"
              }`}>
              {n.label}
            </Link>
          ))}
        </div>

        {loading ? (
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted text-center py-20">{t.loadingLabel}</p>
        ) : items.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <p className="font-cormorant text-[28px] text-espresso">{t.wishlistEmpty}</p>
            <Link href="/collection" className="inline-block mt-4 px-8 py-3 bg-espresso text-gold-lt font-jost text-[9px] tracking-[0.3em] uppercase no-underline">
              {t.exploreBtn}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {items.map(p => {
              const img = getImage(p);
              return (
                <div key={p._id} className="group relative bg-cream border border-gold/[0.12]">
                  <button onClick={() => removeItem(p._id)}
                    className="absolute top-2 right-2 z-10 h-7 w-7 flex items-center justify-center bg-ivory/80 border border-gold/20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3.5 w-3.5 text-muted" />
                  </button>
                  <Link href={`/products/${p._id}`} className="block no-underline">
                    <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                      {img
                        ? <img src={img} alt={p.nameEn || p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="absolute inset-0 bg-gold/10 flex items-center justify-center"><span className="font-cormorant text-[60px] text-gold/20">L</span></div>
                      }
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-espresso leading-tight mb-1">{p.nameEn || p.name}</p>
                      <p className="font-cormorant text-[18px] text-gold">฿{p.price.toLocaleString()}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StoreFooter />
    </div>
  );
}
