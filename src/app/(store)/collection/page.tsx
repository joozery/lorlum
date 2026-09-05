"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { useStoreLang } from "@/contexts/store-language-context";
import ST from "@/lib/store-translations";

interface ProductItem {
  _id: string;
  name: string;
  nameEn: string;
  price: number;
  category: string;
  isActive: boolean;
  featured: boolean;
  imageUrl: string;
  colorVariants?: { name: string; images: string[] }[];
  sizes?: number[];
}

interface CategoryItem {
  _id: string;
  name: string;
  nameEn: string;
  slug: string;
}

const fmt = (n: number) => "฿" + n.toLocaleString("th-TH");

function ProductCard({ product }: { product: ProductItem }) {
  const { lang } = useStoreLang();
  const t = ST[lang];

  const firstImage =
    product.colorVariants?.find((v) => v.images?.[0])?.images[0] ??
    product.imageUrl ??
    "";

  return (
    <Link href={`/products/${product._id}`} className="no-underline block">
      <div className="p-card relative bg-white border border-gold/[0.15] overflow-hidden transition-all duration-500 cursor-pointer group">
        <div className="relative overflow-hidden" style={{ aspectRatio: "3/3.5" }}>
          {firstImage ? (
            <Image
              src={firstImage}
              alt={product.nameEn || product.name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="g2 absolute inset-0 flex items-center justify-center flex-col">
              <span className="font-cormorant font-light text-[68px] tracking-[0.08em] text-white/38 leading-none select-none">L</span>
              <span className="w-5 h-px bg-white/32 mt-2.5" />
            </div>
          )}
          {product.featured && (
            <span className="absolute top-3 left-3 z-[4] text-[8px] tracking-[0.22em] uppercase bg-gold text-espresso px-3 py-1">{t.badgeNew}</span>
          )}
          <span className="p-quick absolute bottom-3.5 right-3.5 z-[4] opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-[8.5px] tracking-[0.2em] uppercase text-oak-d bg-ivory/90 px-4 py-2 border border-gold/30 backdrop-blur-sm whitespace-nowrap">
            {t.quickView}
          </span>
        </div>
        <div className="px-5 pt-5 pb-6 border-t border-gold/10">
          <div className="flex justify-between items-start mb-1.5">
            <span className="font-cormorant font-medium text-[17px] tracking-[0.03em] text-oak-d leading-[1.25] flex-1">
              {product.nameEn || product.name}
            </span>
            <span className="font-cormorant font-semibold text-[17px] tracking-[0.06em] text-gold ml-3 whitespace-nowrap">
              {fmt(product.price)}
            </span>
          </div>
          <span className="text-[9.5px] font-light tracking-[0.16em] uppercase text-muted">
            {product.category}
            {product.sizes?.length ? ` · EU ${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5 mb-11">
      <span className="text-[9px] tracking-[0.55em] uppercase text-gold whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gold/[0.18]" />
    </div>
  );
}

export default function CollectionPage() {
  const { lang } = useStoreLang();
  const t = ST[lang];
  const [products, setProducts]     = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?status=active&limit=100").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([prodData, catData]) => {
      setProducts(prodData.products ?? []);
      setCategories(catData.categories ?? catData ?? []);
    }).finally(() => setLoading(false));
  }, []);

  // products.category stores category name (Thai)
  const usedCategoryNames = useMemo(() => new Set(products.map((p) => p.category)), [products]);

  const filters = useMemo(() => {
    const cats = categories.filter((c) => usedCategoryNames.has(c.name));
    return [{ id: "all", label: t.colFilterAll }, ...cats.map((c) => ({ id: c.name, label: c.nameEn || c.name }))];
  }, [categories, usedCategoryNames]);

  // Filtered products for count display
  const visibleProducts = useMemo(() => {
    if (activeFilter === "all") return products;
    return products.filter((p) => p.category === activeFilter);
  }, [products, activeFilter]);

  // Group by category for sections
  const sections = useMemo(() => {
    if (activeFilter !== "all") {
      const cat = categories.find((c) => c.name === activeFilter);
      return [{ label: cat?.nameEn || cat?.name || activeFilter, items: visibleProducts }];
    }
    const map = new Map<string, ProductItem[]>();
    products.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    });
    return Array.from(map.entries()).map(([catName, items]) => {
      const cat = categories.find((c) => c.name === catName);
      return { label: cat?.nameEn || cat?.name || catName, items };
    });
  }, [products, categories, activeFilter, visibleProducts]);

  return (
    <div className="font-jost bg-ivory text-ltext min-h-screen">
      <StoreNav active="collection" />

      {/* HERO */}
      <div className="pt-[68px] bg-cream text-center border-b border-gold/[0.15] relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] pointer-events-none" style={{ background:"radial-gradient(ellipse,rgba(201,167,82,0.09) 0%,transparent 72%)" }} />
        <div className="px-5 md:px-[52px] py-16 md:py-20 relative z-[1]">
          <span className="block text-[9px] tracking-[0.6em] uppercase text-gold mb-5">{t.colHeroEye}</span>
          <h1 className="font-cormorant font-light uppercase text-oak-d leading-[0.95] mb-7" style={{ fontSize:"clamp(52px,6vw,82px)" }}>
            {t.colTitle1 && <>{t.colTitle1}&nbsp;</>}<em className="italic text-oak">{t.colTitle2}</em><br/>{t.colTitle3}
          </h1>
          <div className="w-[34px] h-px bg-gold mx-auto mb-7" />
          <p className="font-light text-[13.5px] tracking-[0.07em] text-muted leading-[1.9] max-w-[440px] mx-auto">
            {t.colDesc}
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="sticky top-[60px] md:top-[68px] z-[90] bg-ivory/[0.97] backdrop-blur-[12px] border-b border-gold/[0.12] px-5 md:px-20 py-[14px] flex items-center justify-between gap-4">
        <ul className="flex flex-wrap gap-1 list-none">
          {filters.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => setActiveFilter(f.id)}
                className={`text-[9.5px] tracking-[0.2em] uppercase px-4 md:px-[22px] py-[9px] border transition-all duration-300 cursor-pointer font-jost ${
                  activeFilter === f.id
                    ? "text-oak-d border-gold/35 bg-gold/[0.06]"
                    : "text-muted border-transparent bg-transparent hover:text-oak-d"
                }`}
              >{f.label}</button>
            </li>
          ))}
        </ul>
        <span className="text-[10px] font-light tracking-[0.14em] text-muted whitespace-nowrap">
          <strong className="font-medium text-gold">{visibleProducts.length}</strong>&nbsp;{t.colPieces}
        </span>
      </div>

      {/* COLLECTION GRID */}
      <div className="max-w-[1320px] mx-auto px-5 md:px-20 py-16 md:py-20 pb-24 md:pb-32">

        {loading ? (
          <div className="flex items-center justify-center py-28 text-[11px] tracking-[0.3em] uppercase text-muted">
            {t.collLoading}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-28">
            <p className="font-cormorant text-[28px] text-muted mb-3">{t.collNoPieces}</p>
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted/60">{t.collNoPiecesDesc}</p>
          </div>
        ) : (
          sections.map((section, si) => (
            <div key={section.label}>
              <SectionLabel label={section.label} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-7 mb-16 md:mb-[72px]">
                {section.items.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
              {si < sections.length - 1 && (
                <hr className="border-none border-t border-gold/[0.14] mt-3 mb-16 md:mb-[72px]" />
              )}
            </div>
          ))
        )}

        {!loading && products.length > 0 && (
          <div className="text-center pt-6">
            <Link href="/request-access" className="inline-block border border-oak-d text-oak-d text-[10px] tracking-[0.3em] uppercase px-10 md:px-[52px] py-4 bg-transparent cursor-pointer transition-all duration-300 hover:bg-oak-d hover:text-gold-lt font-jost no-underline">
              {t.colRequestBtn}
            </Link>
          </div>
        )}
      </div>

      <StoreFooter />
    </div>
  );
}
