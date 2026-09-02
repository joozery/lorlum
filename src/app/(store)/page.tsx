import Link from "next/link";
import Image from "next/image";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { RevealSection } from "@/components/store/reveal-section";
import { HeroBackground } from "@/components/store/hero-background";

interface ProductCard {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  category: string;
  imageUrl: string;
  featured: boolean;
}

interface HeroSettings {
  bgImages: string[];
  headingLine1: string;
  headingLine2: string;
  subtext: string;
  ctaLabel: string;
  badge: string;
}

const HERO_DEFAULTS: HeroSettings = {
  bgImages:     [],
  headingLine1: "Linen",
  headingLine2: "Collection",
  subtext:      "Thomas Mason Gold Linen, hand-lasted by masterpiece artisans on the exclusive private curated.",
  ctaLabel:     "Explore the Collection",
  badge:        "Season 2026 · Exclusive Release",
};

async function fetchHeroSettings(): Promise<HeroSettings> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res  = await fetch(`${base}/api/site-settings`, { cache: "no-store" });
    if (!res.ok) return HERO_DEFAULTS;
    const data = await res.json();
    const h = data.hero ?? {};
    const bgImages: string[] = Array.isArray(h.bgImages)
      ? (h.bgImages as string[]).filter(Boolean)
      : h.bgImageUrl
      ? [h.bgImageUrl as string]
      : [];
    return { ...HERO_DEFAULTS, ...h, bgImages };
  } catch {
    return HERO_DEFAULTS;
  }
}

async function fetchFeaturedProducts(): Promise<ProductCard[]> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res  = await fetch(`${base}/api/products?status=active&limit=6`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products ?? []).map((p: Record<string, unknown>) => {
      const variants = p.colorVariants as Array<{ images?: string[] }> | undefined;
      const firstVariantImg = variants?.[0]?.images?.[0] ?? "";
      return {
        id:       String(p._id ?? p.id),
        name:     String(p.name     ?? ""),
        nameEn:   String(p.nameEn   ?? ""),
        price:    Number(p.price    ?? 0),
        category: String(p.category ?? ""),
        imageUrl: String(p.imageUrl || firstVariantImg),
        featured: Boolean(p.featured),
      };
    });
  } catch {
    return [];
  }
}

function formatPrice(n: number) {
  return "฿" + n.toLocaleString("th-TH");
}

export default async function StoreLandingPage() {
  const [products, hero] = await Promise.all([fetchFeaturedProducts(), fetchHeroSettings()]);
  const sorted = [...products.filter((p) => p.featured), ...products.filter((p) => !p.featured)].slice(0, 6);
  const spotlight = sorted[0] ?? null;

  return (
    <div className="font-jost bg-ivory text-ltext overflow-x-hidden min-h-screen">
      <StoreNav active="home" />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-espresso">
        {hero.bgImages.length > 0 ? (
          <HeroBackground images={hero.bgImages} />
        ) : (
          <div className="absolute inset-0 anim-hero" style={{ background:"radial-gradient(ellipse 60% 50% at 30% 20%, rgba(201,167,82,0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 75% 70%, rgba(201,167,82,0.22) 0%, transparent 60%), linear-gradient(155deg,#1A1208 0%,#2C1F0F 40%,#4A3219 75%,#6B4E2A 100%)", backgroundSize:"200% 200%, 200% 200%, 100% 100%" }} />
        )}
        <div className="absolute inset-[-20%] anim-sweep mix-blend-screen pointer-events-none" style={{ background:"linear-gradient(115deg, transparent 40%, rgba(232,213,163,0.14) 48%, rgba(255,255,255,0.05) 50%, transparent 58%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: hero.bgImages.length > 0 ? "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(26,18,8,0.45) 20%, rgba(26,18,8,0.72) 100%)" : "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(26,18,8,0.55) 100%)" }} />

        <div className="relative z-10 text-center px-6">
          <span className="block text-[9.5px] font-normal tracking-[0.6em] uppercase text-gold-lt mb-6 anim-rise-1">
            {hero.badge}
          </span>
          <h1 className="font-cormorant font-light leading-[0.92] uppercase" style={{ fontSize:"clamp(56px,9vw,140px)" }}>
            <span className="block overflow-hidden">
              <span className="inline-block text-gold-pl anim-rise-2">{hero.headingLine1}</span>
            </span>
            <span className="block overflow-hidden">
              <span className="inline-block italic text-gold anim-rise-2i">{hero.headingLine2}</span>
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-[460px] font-light text-[13.5px] tracking-[0.06em] leading-[1.9] text-gold-pl/70 anim-rise-3">
            {hero.subtext}
          </p>
          <div className="mt-11 flex gap-4 justify-center flex-wrap anim-rise-4">
            <Link href="/collection" className="inline-block bg-gold text-espresso text-[10px] font-medium tracking-[0.28em] uppercase px-10 py-[17px] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(201,167,82,0.35)]">
              {hero.ctaLabel}
            </Link>
            <a href="#spotlight" className="inline-flex items-center gap-3 border border-gold-lt/35 text-gold-pl text-[10px] font-normal tracking-[0.28em] uppercase px-8 py-[17px] no-underline transition-all duration-300 hover:border-gold hover:text-gold-lt">
              <span className="w-2 h-2 rounded-full bg-gold anim-pulse" />
              Watch the Film
            </a>
          </div>
        </div>

        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2.5 anim-rise-5">
          <span className="text-[8px] tracking-[0.4em] uppercase text-gold-pl/55">Scroll</span>
          <div className="w-px h-9 relative overflow-hidden" style={{ background:"linear-gradient(180deg,#C9A752 0%,transparent 100%)" }}>
            <div className="absolute left-0 w-full h-full bg-gold-lt anim-scroll" />
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────── */}
      <div className="bg-oak-d border-y border-gold/25 overflow-hidden py-4">
        <div className="flex w-max anim-marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="font-cormorant italic font-normal text-[20px] text-gold-lt tracking-[0.04em] px-16 whitespace-nowrap flex items-center gap-16">
              Masterpiece Handcrafted
              <span className="not-italic text-[8px] text-gold">◆</span>
              LORLUM LINEN
              <span className="not-italic text-[8px] text-gold">◆</span>
              LIMITED SEASON
              <span className="not-italic text-[8px] text-gold">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── SPOTLIGHT ─────────────────────────────────────────── */}
      <section id="spotlight" className="px-5 md:px-20 py-24 md:py-36 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
        <RevealSection>
          <div className="relative overflow-hidden border border-gold/[0.18]" style={{ aspectRatio:"4/5" }}>
            {spotlight?.imageUrl ? (
              <Image src={spotlight.imageUrl} alt={spotlight.nameEn || spotlight.name} fill className="object-cover" unoptimized priority />
            ) : (
              <>
                <div className="absolute inset-0 anim-film" style={{ background:"linear-gradient(150deg,#EDD9A3 0%,#C9A752 35%,#8B6532 70%,#4A3219 100%)" }} />
                <div className="absolute inset-[-30%] anim-sweep mix-blend-overlay" style={{ background:"linear-gradient(120deg, transparent 42%, rgba(255,255,255,0.32) 50%, transparent 58%)" }} />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-cormorant font-light text-[150px] text-white/25 z-[1] select-none leading-none">L</span>
              </>
            )}
            <span className="absolute top-5 left-5 z-10 text-[8px] font-normal tracking-[0.22em] uppercase bg-espresso text-gold-lt px-3 py-1.5">New Arrival</span>
          </div>
        </RevealSection>
        <RevealSection>
          <div>
            <span className="block text-[9px] tracking-[0.6em] uppercase text-gold mb-5">The Signature Piece</span>
            {spotlight ? (
              <>
                <h2 className="font-cormorant font-light tracking-[0.02em] text-oak-d leading-[1.05] mb-6" style={{ fontSize:"clamp(38px,4vw,54px)" }}>
                  {spotlight.nameEn || spotlight.name}
                </h2>
                <p className="font-light text-[13.5px] tracking-[0.03em] leading-[1.95] text-muted max-w-[420px] mb-9">
                  {spotlight.category}
                </p>
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="font-cormorant font-semibold text-[34px] text-gold">{formatPrice(spotlight.price)}</span>
                </div>
                <Link href={`/products/${spotlight.id}`} className="inline-block bg-oak-d text-gold-lt text-[10px] font-medium tracking-[0.28em] uppercase px-10 py-[17px] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(44,31,15,0.25)]">
                  Reserve This Piece
                </Link>
              </>
            ) : (
              <>
                <h2 className="font-cormorant font-light tracking-[0.02em] text-oak-d leading-[1.05] mb-6" style={{ fontSize:"clamp(38px,4vw,54px)" }}>
                  LORLUM &amp; THOMAS MASON<br/>GOLD LINEN <em className="italic text-oak">No. 01</em>
                </h2>
                <p className="font-light text-[13.5px] tracking-[0.03em] leading-[1.95] text-muted max-w-[420px] mb-9">
                  Cut from the finest linen and handcrafted to absolute perfection.
                </p>
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="font-cormorant font-semibold text-[34px] text-gold">฿77,777</span>
                </div>
                <Link href="/collection" className="inline-block bg-oak-d text-gold-lt text-[10px] font-medium tracking-[0.28em] uppercase px-10 py-[17px] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(44,31,15,0.25)]">
                  Explore Collection
                </Link>
              </>
            )}
          </div>
        </RevealSection>
      </section>

      {/* ── ATELIER ───────────────────────────────────────────── */}
      <section id="atelier" className="bg-cream border-y border-gold/[0.15] px-5 md:px-20 py-24 md:py-36">
        <RevealSection>
          <div className="max-w-[640px] mx-auto text-center mb-20 md:mb-24">
            <span className="block text-[9px] tracking-[0.6em] uppercase text-gold mb-5">The Atelier</span>
            <h2 className="font-cormorant font-light text-oak-d leading-[1.05]" style={{ fontSize:"clamp(34px,4vw,50px)" }}>
              From Hide to <em className="italic text-oak">Heirloom</em>
            </h2>
          </div>
        </RevealSection>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 relative">
          <div className="hidden md:block absolute top-[34px] left-[8%] right-[8%] h-px" style={{ background:"repeating-linear-gradient(90deg, rgba(201,167,82,0.4) 0 6px, transparent 6px 14px)" }} />
          {[
            { num:"01", title:"The Cut", text:"Every linen shirt and every linen trouser is cut and hand-sewn with quiet precision, each stage unhurried and given the hours it deserves." },
            { num:"02", title:"The Stitch", text:"The buttons are genuine shell — the rarest in the world — drawn from the depths of the ocean floor and reserved for those who understand true rarity." },
            { num:"03", title:"The Finish", text:"To set the most beautiful shell upon each shirt demands an artisan's discerning eye, selecting one by one, until nothing short of perfection remains." },
          ].map((s) => (
            <RevealSection key={s.num}>
              <div className="px-7 text-center">
                <div className="w-[68px] h-[68px] rounded-full bg-cream border border-gold/40 flex items-center justify-center mx-auto mb-6 relative z-[1] font-cormorant text-[22px] text-gold">
                  {s.num}
                </div>
                <h3 className="font-cormorant font-medium text-[21px] text-oak-d mb-3 tracking-[0.02em]">{s.title}</h3>
                <p className="font-light text-[12px] leading-[1.85] text-muted max-w-[260px] mx-auto">{s.text}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── PREVIEW GRID ─────────────────────────────────────── */}
      <section id="preview" className="px-5 md:px-20 py-24 md:py-36 max-w-[1320px] mx-auto">
        <RevealSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-5">
            <div>
              <span className="block text-[9px] tracking-[0.6em] uppercase text-gold mb-4">The Full Collection</span>
              <h2 className="font-cormorant font-light text-oak-d leading-none" style={{ fontSize:"clamp(32px,3.6vw,46px)" }}>
                The Collection, <em className="italic text-oak">Without Limit</em>
              </h2>
            </div>
            <Link href="/collection" className="text-[10px] tracking-[0.2em] uppercase text-oak-d no-underline inline-flex items-center gap-2 border-b border-gold/40 pb-1.5 hover:text-gold hover:gap-4 transition-all duration-300">
              View All Pieces →
            </Link>
          </div>
        </RevealSection>
        {sorted.length === 0 ? (
          <div className="col-span-3 py-20 text-center">
            <span className="text-[11px] tracking-[0.2em] uppercase text-muted">ยังไม่มีสินค้า — เพิ่มสินค้าได้ที่หน้าหลังบ้าน</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {sorted.map((p, i) => (
              <RevealSection key={p.id}>
                <Link href={`/products/${p.id}`} className="no-underline block">
                  <div className="p-card bg-white border border-gold/[0.15] overflow-hidden relative transition-all duration-500 cursor-pointer group">
                    <div className="p-img relative flex items-center justify-center overflow-hidden bg-cream" style={{ aspectRatio:"3/3.5" }}>
                      {i === 0 && (
                        <span className="p-badge absolute top-3 left-3 z-[4] text-[8px] tracking-[0.22em] uppercase bg-gold text-espresso px-3 py-1">New</span>
                      )}
                      {p.featured && i !== 0 && (
                        <span className="p-badge absolute top-3 left-3 z-[4] text-[8px] tracking-[0.22em] uppercase bg-espresso text-gold-lt px-3 py-1">Featured</span>
                      )}
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.nameEn || p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                      ) : (
                        <span className="font-cormorant font-light text-[68px] text-gold/20 leading-none select-none">L</span>
                      )}
                      <span className="p-quick absolute bottom-3.5 right-3.5 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-[8.5px] tracking-[0.2em] uppercase text-oak-d bg-ivory/90 px-3 py-1.5 border border-gold/30 backdrop-blur-sm whitespace-nowrap z-10">
                        Quick View
                      </span>
                    </div>
                    <div className="p-info relative px-5 pt-5 pb-6 border-t border-gold/10">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-cormorant font-medium text-[17px] tracking-[0.03em] text-oak-d leading-[1.25] flex-1 line-clamp-2">
                          {p.nameEn || p.name}
                        </span>
                        <span className="font-cormorant font-semibold text-[17px] tracking-[0.06em] text-gold ml-3 whitespace-nowrap">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-light tracking-[0.16em] uppercase text-muted">{p.category}</span>
                    </div>
                  </div>
                </Link>
              </RevealSection>
            ))}
          </div>
        )}
      </section>

      {/* ── PRESS QUOTE ──────────────────────────────────────── */}
      <section className="bg-espresso px-5 md:px-20 py-20 md:py-32 text-center relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px]" style={{ background:"radial-gradient(ellipse, rgba(201,167,82,0.1) 0%, transparent 70%)" }} />
        <RevealSection>
          <p className="relative z-[1] font-cormorant italic font-light text-gold-pl max-w-[820px] mx-auto mb-7 leading-[1.4]" style={{ fontSize:"clamp(26px,3.2vw,42px)" }}>
            "Linen, shell buttons, and hours of patient hand-work — this is <span className="text-gold">handcrafted</span> in its truest form."
          </p>
          <span className="relative z-[1] text-[10px] tracking-[0.3em] uppercase text-muted">— James LORLUM</span>
        </RevealSection>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────── */}
      <section className="bg-cream border-t border-gold/[0.15] px-5 md:px-20 py-20 md:py-32 text-center">
        <RevealSection>
          <span className="block text-[9px] tracking-[0.6em] uppercase text-gold mb-5">Private Preview</span>
          <h2 className="font-cormorant font-light text-oak-d leading-[1.05] mb-9" style={{ fontSize:"clamp(34px,5vw,64px)" }}>
            Own a Piece Before<br/>It&apos;s <em className="italic text-oak">Gone</em>
          </h2>
          <Link href="/contact" className="inline-block bg-gold text-espresso text-[10px] font-medium tracking-[0.28em] uppercase px-10 py-[17px] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(201,167,82,0.35)]">
            Request Private Preview
          </Link>
        </RevealSection>
      </section>

      <StoreFooter />
    </div>
  );
}
