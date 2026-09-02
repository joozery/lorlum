"use client";

import Image from "next/image";
import Link from "next/link";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { useCart } from "@/context/cart";
import { useStoreLang } from "@/contexts/store-language-context";
import ST from "@/lib/store-translations";

const fmt = (n: number) => "฿" + n.toLocaleString("th-TH");

export default function CartPage() {
  const { items, count, subtotal, removeItem, updateQty } = useCart();
  const { lang } = useStoreLang();
  const t = ST[lang];

  return (
    <div className="font-jost bg-ivory text-ltext min-h-screen">
      <StoreNav active="cart" cartCount={count} />

      {/* BREADCRUMB */}
      <div className="pt-[60px] md:pt-[68px] bg-cream border-b border-gold/[0.1]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-20 py-3.5 flex gap-3 items-center text-[9.5px] tracking-[0.16em] uppercase text-muted flex-wrap">
          <Link href="/" className="text-muted no-underline hover:text-gold transition-colors">{t.navMaison}</Link>
          <span className="text-gold text-[8px]">—</span>
          <Link href="/collection" className="text-muted no-underline hover:text-gold transition-colors">{t.navCollection}</Link>
          <span className="text-gold text-[8px]">—</span>
          <span className="text-oak-d">{t.yourBag}</span>
        </div>
      </div>

      {/* CART HEADER */}
      <div className="bg-cream border-b border-gold/[0.1] px-5 md:px-20 pt-12 md:pt-14 pb-10 md:pb-11">
        <div className="max-w-[1320px] mx-auto">
          <span className="block text-[9px] tracking-[0.5em] uppercase text-gold mb-3">{t.yourSel}</span>
          <h1 className="font-cormorant font-light text-oak-d leading-[0.95] mb-4" style={{ fontSize:"clamp(36px,5vw,64px)" }}>{t.yourBag}</h1>
          <p className="text-[13px] font-light text-muted tracking-[0.04em]">
            {count === 0 ? t.cartEmpty : `${count} ${count === 1 ? t.cartItemSingle : t.cartItemPlural}`}
          </p>
          <div className="w-[34px] h-px bg-gold mt-6" />
        </div>
      </div>

      {/* CART CONTENT */}
      <div className="max-w-[1320px] mx-auto px-5 md:px-20 py-10 md:py-16 pb-20 md:pb-28 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 md:gap-16 items-start">

        {/* ITEMS */}
        <div>
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-cormorant text-[28px] text-muted mb-6">{t.cartNoItems}</p>
              <Link href="/collection" className="inline-block bg-gold text-espresso text-[9.5px] font-medium tracking-[0.28em] uppercase px-10 py-4 no-underline">
                {t.cartBrowse}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-between mb-6 pb-3.5 border-b border-gold/[0.12]">
                <span className="text-[9px] tracking-[0.35em] uppercase text-gold font-normal">{t.itemsInBag}</span>
                <span className="text-[9.5px] tracking-[0.14em] text-muted font-light">{count} {count === 1 ? t.cartItemSingle : t.cartItemPlural}</span>
              </div>

              <div className="space-y-0 divide-y divide-gold/[0.1]">
                {items.map((item) => (
                  <div key={`${item.productId}::${item.color}::${item.size}`} className="flex gap-5 md:gap-7 py-8">
                    {/* Image */}
                    <div className="relative flex-shrink-0 w-[110px] md:w-[140px] border border-gold/[0.15] overflow-hidden" style={{ aspectRatio:"6/7" }}>
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="g2 absolute inset-0 flex items-center justify-center">
                          <span className="font-cormorant text-[40px] text-white/38 font-light">L</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-5">
                        <h2 className="font-cormorant font-normal text-[20px] md:text-[24px] tracking-[0.03em] text-oak-d mb-2">{item.productName}</h2>
                        <div className="flex gap-4 md:gap-6 flex-wrap">
                          {item.color && (
                            <div>
                              <span className="text-[8.5px] tracking-[0.22em] uppercase text-muted block mb-0.5">{t.colourLabel}</span>
                              <div className="flex items-center gap-1.5">
                                {item.colorHex && <div className="w-3 h-3 rounded-full border border-gold/30" style={{ backgroundColor: item.colorHex }} />}
                                <span className="text-[12px] font-normal text-oak-d">{item.color}</span>
                              </div>
                            </div>
                          )}
                          {item.size && (
                            <div>
                              <span className="text-[8.5px] tracking-[0.22em] uppercase text-muted block mb-0.5">{t.cartEuSize}</span>
                              <span className="text-[12px] font-normal text-oak-d">{item.size}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center flex-wrap gap-4">
                        <span className="font-cormorant font-semibold text-[22px] md:text-[26px] text-gold">{fmt(item.price * item.qty)}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gold/25">
                            <button onClick={() => updateQty(item.productId, item.color, item.size, item.qty - 1)}
                              className="w-9 h-9 bg-transparent border-none cursor-pointer text-xl text-muted">−</button>
                            <span className="w-9 text-center text-[13px] font-light">{item.qty}</span>
                            <button onClick={() => updateQty(item.productId, item.color, item.size, item.qty + 1)}
                              className="w-9 h-9 bg-transparent border-none cursor-pointer text-xl text-muted">+</button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.color, item.size)}
                            className="text-[9px] tracking-[0.18em] uppercase text-muted bg-transparent border-none cursor-pointer border-b border-gold/25 pb-0.5 font-jost">
                            {t.cartRemove}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/collection" className="inline-block mt-5 text-[9.5px] tracking-[0.2em] uppercase text-muted no-underline border-b border-gold/25 pb-0.5">
                {t.continueShopping}
              </Link>
            </>
          )}
        </div>

        {/* ORDER SUMMARY */}
        {items.length > 0 && (
          <div className="lg:sticky lg:top-[88px] bg-cream border border-gold/[0.18] p-7 md:p-8">
            <h2 className="font-cormorant font-normal text-[22px] tracking-[0.04em] text-oak-d mb-6">{t.orderSummary}</h2>
            <div className="border-t border-gold/[0.12] pt-6">
              {[
                [t.subtotal, fmt(subtotal)],
                [t.shipping, t.complimentary],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between mb-4">
                  <span className="text-[10px] tracking-[0.18em] uppercase text-muted font-light">{label}</span>
                  <span className={`text-[12px] font-light ${label === t.shipping ? "text-gold" : "text-ltext"}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gold/25 pt-5 mb-6 flex justify-between items-baseline">
              <span className="text-[10px] tracking-[0.25em] uppercase text-oak-d font-normal">{t.total}</span>
              <span className="font-cormorant font-semibold text-[26px] text-gold">{fmt(subtotal)}</span>
            </div>
            <Link href="/checkout" className="block text-center w-full bg-gold text-espresso text-[9.5px] font-medium tracking-[0.28em] uppercase px-6 py-[17px] no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(201,167,82,0.3)]">
              {t.toCheckout}
            </Link>
            <p className="text-[10px] font-light text-muted text-center mt-4 leading-[1.7]">
              {t.cartNote}
            </p>
          </div>
        )}
      </div>

      <StoreFooter />
    </div>
  );
}
