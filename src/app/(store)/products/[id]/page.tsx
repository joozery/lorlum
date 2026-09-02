"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { useCart } from "@/context/cart";
import { useStoreLang } from "@/contexts/store-language-context";
import ST from "@/lib/store-translations";

// ── Types ─────────────────────────────────────────────────────────────────
interface ColorVariant { name: string; hex: string; images: string[]; stock: number }
interface Product {
  id: string;
  name: string; nameEn: string;
  description: string; descriptionEn: string;
  price: number; category: string;
  imageUrl: string;
  stock: number; isActive: boolean;
  colorVariants: ColorVariant[];
  sizes: number[];
  materials: string; fitSizing: string; careInstructions: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  return "฿" + n.toLocaleString("th-TH");
}

function toProduct(raw: Record<string, unknown>): Product {
  return {
    id:               String(raw._id ?? raw.id),
    name:             String(raw.name          ?? ""),
    nameEn:           String(raw.nameEn        ?? ""),
    description:      String(raw.description   ?? ""),
    descriptionEn:    String(raw.descriptionEn ?? ""),
    price:            Number(raw.price         ?? 0),
    category:         String(raw.category      ?? ""),
    imageUrl:         String(raw.imageUrl      ?? ""),
    stock:            Number(raw.stock         ?? 0),
    isActive:         Boolean(raw.isActive),
    colorVariants:    Array.isArray(raw.colorVariants) ? (raw.colorVariants as ColorVariant[]) : [],
    sizes:            Array.isArray(raw.sizes) ? (raw.sizes as number[]) : [],
    materials:        String(raw.materials        ?? ""),
    fitSizing:        String(raw.fitSizing        ?? ""),
    careInstructions: String(raw.careInstructions ?? ""),
  };
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, count } = useCart();
  const { lang } = useStoreLang();
  const t = ST[lang];

  const [product,      setProduct]      = useState<Product | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [toast,        setToast]        = useState("");

  const [activeImg,    setActiveImg]    = useState(0);
  const [activeColor,  setActiveColor]  = useState<ColorVariant | null>(null);
  const [activeSize,   setActiveSize]   = useState<number | null>(null);
  const [openAccord,   setOpenAccord]   = useState<number | null>(0);
  const [sizeModal,    setSizeModal]    = useState(false);
  const [qty,          setQty]          = useState(1);

  // Fetch product
  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then((raw) => { if (raw) { const p = toProduct(raw); setProduct(p); if (p.colorVariants[0]) setActiveColor(p.colorVariants[0]); } })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Gallery images — from active color or imageUrl
  const gallery: string[] = activeColor?.images?.length
    ? activeColor.images
    : product?.imageUrl
      ? [product.imageUrl]
      : [];

  // Switch active image back to 0 when color changes
  const handleColorChange = (c: ColorVariant) => {
    setActiveColor(c);
    setActiveImg(0);
  };

  const handleAddToBag = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !activeSize) {
      setToast(t.toastSelectSize);
      setTimeout(() => setToast(""), 2500);
      return;
    }
    addItem({
      productId:   product.id,
      productName: product.nameEn || product.name,
      imageUrl:    activeColor?.images?.[0] ?? product.imageUrl ?? "",
      color:       activeColor?.name ?? "",
      colorHex:    activeColor?.hex  ?? "",
      size:        activeSize,
      price:       product.price,
      qty,
    });
    setToast(t.toastAddedBag);
    setTimeout(() => setToast(""), 2500);
  };

  const handleBuyNow = () => {
    handleAddToBag();
    router.push("/cart");
  };

  const ACCORD_LABELS = {
    materials: lang === "en" ? "Materials & Construction" : "วัสดุและการตัดเย็บ",
    fitSizing: lang === "en" ? "Fit & Sizing"             : "ทรงและไซส์",
    care:      lang === "en" ? "Care Instructions"        : "การดูแลรักษา",
  };

  // Accordion data from product fields
  const accordions = product ? [
    product.materials        ? { title: ACCORD_LABELS.materials, content: product.materials }        : null,
    product.fitSizing        ? { title: ACCORD_LABELS.fitSizing, content: product.fitSizing }        : null,
    product.careInstructions ? { title: ACCORD_LABELS.care,      content: product.careInstructions } : null,
    { title: t.accordShipping,  content: t.accordShippingBody },
    { title: t.accordBespoke,   content: t.accordBespokeBody },
  ].filter(Boolean) as { title: string; content: string }[] : [];

  // ── Loading / Not found ────────────────────────────────────────────────
  if (loading) return (
    <div className="font-jost bg-ivory min-h-screen flex items-center justify-center">
      <StoreNav active="collection" cartCount={count} />
      <span className="text-[11px] tracking-[0.3em] uppercase text-muted">{t.loadingLabel}</span>
    </div>
  );

  if (notFound || !product) return (
    <div className="font-jost bg-ivory min-h-screen">
      <StoreNav active="collection" cartCount={count} />
      <div className="pt-32 text-center space-y-4">
        <p className="font-cormorant text-[32px] text-oak-d">{t.productNotFound}</p>
        <Link href="/collection" className="text-[10px] tracking-[0.2em] uppercase text-gold underline">{t.productBack}</Link>
      </div>
      <StoreFooter />
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="font-jost bg-ivory text-ltext min-h-screen">
      <StoreNav active="collection" cartCount={count} />

      {/* BREADCRUMB */}
      <div className="pt-[60px] md:pt-[68px] bg-cream border-b border-gold/[0.1]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-20 py-4 flex gap-3 items-center text-[9.5px] tracking-[0.16em] uppercase text-muted flex-wrap">
          <Link href="/" className="hover:text-gold transition-colors">{t.navMaison}</Link>
          <span className="text-gold text-[8px]">—</span>
          <Link href="/collection" className="hover:text-gold transition-colors">{t.navCollection}</Link>
          <span className="text-gold text-[8px]">—</span>
          <span className="text-oak-d">{product.nameEn || product.name}</span>
        </div>
      </div>

      {/* PRODUCT LAYOUT */}
      <div className="max-w-[1320px] mx-auto px-5 md:px-20 py-10 md:py-16 pb-20 md:pb-32 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-start">

        {/* GALLERY */}
        <div className="flex gap-3 md:gap-4">
          {/* Thumbs */}
          {gallery.length > 1 && (
            <div className="flex flex-col gap-2.5 md:gap-3 flex-shrink-0">
              {gallery.map((src, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-[60px] md:w-[72px] cursor-pointer overflow-hidden relative border transition-colors duration-300 ${activeImg === i ? "border-gold" : "border-gold/20"}`}
                  style={{ aspectRatio: "6/7" }}
                >
                  <Image src={src} alt={`thumb-${i}`} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 relative overflow-hidden border border-gold/[0.15]" style={{ aspectRatio: "4/5" }}>
            {gallery[activeImg] ? (
              <Image src={gallery[activeImg]} alt={product.nameEn || product.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 bg-cream flex items-center justify-center">
                <span className="font-cormorant font-light text-[120px] text-gold/20 leading-none">L</span>
              </div>
            )}
            {gallery.length > 1 && (
              <div className="absolute bottom-4 right-4 text-[8.5px] tracking-[0.2em] uppercase bg-ivory/88 px-3.5 py-1.5 border border-gold/25 text-oak-d backdrop-blur-sm">
                {activeImg + 1} / {gallery.length}
              </div>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="pt-0 md:pt-2">
          <span className="block text-[8px] tracking-[0.45em] uppercase text-gold mb-3.5">{product.category}</span>
          <h1 className="font-cormorant font-normal text-oak-d leading-[1.1] mb-5" style={{ fontSize: "clamp(28px,3vw,40px)" }}>
            {product.nameEn || product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-cormorant font-semibold text-[32px] text-gold">{formatPrice(product.price)}</span>
            <span className="text-[11px] text-muted font-light tracking-[0.06em]">{t.inclVAT}</span>
          </div>

          {/* Description */}
          {(product.descriptionEn || product.description) && (
            <p className="text-[12px] font-light leading-[1.9] text-muted tracking-[0.03em] mb-7 max-w-[420px]">
              {product.descriptionEn || product.description}
            </p>
          )}

          {/* Colour */}
          {product.colorVariants.length > 0 && (
            <div className="mb-6">
              <div className="text-[9px] tracking-[0.25em] uppercase text-muted mb-3">
                {t.colourLabel} &nbsp;·&nbsp; <strong className="text-oak-d font-normal">{activeColor?.name ?? "—"}</strong>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {product.colorVariants.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => handleColorChange(c)}
                    className={`w-[26px] h-[26px] rounded-full cursor-pointer p-0 transition-all duration-200 ${activeColor?.name === c.name ? "outline outline-2 outline-gold outline-offset-2" : ""}`}
                    style={{ backgroundColor: c.hex, border: c.hex === "#FFFFFF" || c.hex === "#FAF9F6" ? "1px solid rgba(201,167,82,0.4)" : "none" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes.length > 0 && (
            <div className="mb-7">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[9px] tracking-[0.25em] uppercase text-muted">
                  {t.sizeLabel} &nbsp;·&nbsp; <strong className="text-oak-d font-normal">{activeSize ? `EU ${activeSize}` : "—"}</strong>
                </div>
                <button onClick={() => setSizeModal(true)} className="text-[9px] tracking-[0.18em] uppercase text-muted bg-transparent border-none cursor-pointer border-b border-gold/35 pb-0.5 font-jost">
                  {t.sizeGuide}
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSize(s)}
                    className={`h-11 text-[11px] font-light tracking-[0.08em] cursor-pointer transition-all duration-200 border font-jost ${
                      activeSize === s
                        ? "bg-espresso text-gold-lt border-espresso"
                        : "bg-transparent text-ltext border-gold/25 hover:border-gold/50"
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Stock badge */}
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-[10px] tracking-[0.15em] uppercase text-red-400 mb-4">
              {t.lowStock.replace("{n}", String(product.stock))}
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted mb-4">{t.outOfStock}</p>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3 mb-8">
            {/* Qty */}
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[9px] tracking-[0.2em] uppercase text-muted">{t.qtyLabel}</span>
              <div className="flex items-center border border-gold/25 h-9">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-full flex items-center justify-center text-muted hover:text-oak-d transition-colors bg-transparent border-none cursor-pointer text-lg">−</button>
                <span className="w-8 text-center text-sm font-light">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-9 h-full flex items-center justify-center text-muted hover:text-oak-d transition-colors bg-transparent border-none cursor-pointer text-lg">+</button>
              </div>
            </div>
            <button
              onClick={handleAddToBag}
              disabled={product.stock === 0}
              className="w-full h-[50px] bg-gold text-espresso text-[9.5px] font-medium tracking-[0.3em] uppercase cursor-pointer border-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(201,167,82,0.3)] font-jost disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {t.addToBag}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full h-[50px] bg-espresso text-gold-lt text-[9.5px] font-medium tracking-[0.3em] uppercase cursor-pointer border-none transition-all duration-300 hover:opacity-90 font-jost disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t.buyNow}
            </button>
          </div>

          {/* Delivery */}
          <div className="flex gap-3 p-4 bg-gold/[0.06] border border-gold/[0.15] mb-7">
            <span className="text-base">📦</span>
            <div>
              <p className="text-[10px] font-normal tracking-[0.12em] uppercase text-oak-d mb-1">{t.deliveryTitle}</p>
              <p className="text-[11px] font-light text-muted leading-[1.7]">{t.deliveryDesc}</p>
            </div>
          </div>

          {/* Accordions */}
          {accordions.length > 0 && (
            <div>
              {accordions.map((a, i) => (
                <div key={i} className="border-t border-gold/[0.14]">
                  <button
                    onClick={() => setOpenAccord(openAccord === i ? null : i)}
                    className="w-full flex justify-between items-center py-[17px] bg-transparent border-none cursor-pointer text-left font-jost"
                  >
                    <span className="text-[10px] tracking-[0.22em] uppercase text-oak-d font-normal">{a.title}</span>
                    <span className={`text-gold text-xl transition-transform duration-300 ${openAccord === i ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {openAccord === i && (
                    <div className="pb-5">
                      <p className="text-[12px] font-light leading-[1.9] text-muted tracking-[0.03em] whitespace-pre-line">{a.content}</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t border-gold/[0.14]" />
            </div>
          )}
        </div>
      </div>

      {/* SIZE GUIDE MODAL */}
      {sizeModal && (
        <div onClick={() => setSizeModal(false)} className="fixed inset-0 z-[9999] bg-espresso/60 flex items-center justify-center backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="bg-cream border border-gold/20 max-w-[540px] w-[90%] p-8 md:p-11 relative">
            <button onClick={() => setSizeModal(false)} className="absolute top-4 right-5 bg-transparent border-none cursor-pointer text-xl text-muted">×</button>
            <span className="block text-[9px] tracking-[0.6em] uppercase text-gold mb-3">{t.sizeGuideEye}</span>
            <h3 className="font-cormorant font-normal text-[28px] text-oak-d mb-6">{t.sizeGuideFinding}</h3>
            <table className="w-full border-collapse text-[12px] text-ltext">
              <thead>
                <tr className="border-b border-gold/20">
                  {["EU","UK","US", t.footLengthHeader].map((h) => (
                    <th key={h} className="py-2.5 px-3 text-left text-[9px] tracking-[0.2em] uppercase text-gold font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[[36,"3","5","22.5"],[37,"4","6","23.5"],[38,"5","7","24.0"],[39,"6","8","24.5"],[40,"6.5","8.5","25.0"],[41,"7","9","25.5"],[42,"8","10","26.0"],[43,"9","11","27.0"],[44,"9.5","11.5","27.5"],[45,"10","12","28.0"]].map(([eu,uk,us,cm]) => (
                  <tr key={eu} className="border-b border-gold/10">
                    <td className="py-2.5 px-3 font-normal text-oak-d">{eu}</td>
                    <td className="py-2.5 px-3 font-light text-muted">{uk}</td>
                    <td className="py-2.5 px-3 font-light text-muted">{us}</td>
                    <td className="py-2.5 px-3 font-light text-muted">{cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <StoreFooter />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-espresso text-gold-lt px-7 py-3 text-[11px] tracking-[0.18em] uppercase border border-gold/20 flex items-center gap-3">
          {toast}
          {toast === t.toastAddedBag && (
            <button onClick={() => router.push("/cart")}
              className="text-gold text-[9px] tracking-[0.15em] uppercase border-b border-gold/50 bg-transparent cursor-pointer font-jost">
              {t.toastViewBag}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
