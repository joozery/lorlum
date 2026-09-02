import Link from "next/link";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { HeroBackground } from "@/components/store/hero-background";

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

export default async function StoreLandingPage() {
  const hero = await fetchHeroSettings();

  return (
    <div className="font-jost bg-espresso text-ltext overflow-x-hidden">
      <StoreNav active="home" />

      {/* ── HERO (full viewport) ─────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-espresso">

        {/* Background */}
        {hero.bgImages.length > 0 ? (
          <HeroBackground images={hero.bgImages} />
        ) : (
          <div
            className="absolute inset-0 anim-hero"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 30% 20%, rgba(201,167,82,0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 75% 70%, rgba(201,167,82,0.22) 0%, transparent 60%), linear-gradient(155deg,#1A1208 0%,#2C1F0F 40%,#4A3219 75%,#6B4E2A 100%)",
              backgroundSize: "200% 200%, 200% 200%, 100% 100%",
            }}
          />
        )}

        {/* Sweep shimmer */}
        <div
          className="absolute inset-[-20%] anim-sweep mix-blend-screen pointer-events-none"
          style={{ background: "linear-gradient(115deg, transparent 40%, rgba(232,213,163,0.14) 48%, rgba(255,255,255,0.05) 50%, transparent 58%)" }}
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: hero.bgImages.length > 0
              ? "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(26,18,8,0.45) 20%, rgba(26,18,8,0.72) 100%)"
              : "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(26,18,8,0.55) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <span className="block text-[9.5px] font-normal tracking-[0.6em] uppercase text-gold-lt mb-6 anim-rise-1">
            {hero.badge}
          </span>

          <h1
            className="font-cormorant font-light leading-[0.92] uppercase"
            style={{ fontSize: "clamp(56px,9vw,140px)" }}
          >
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
            <Link
              href="/collection"
              className="inline-block bg-gold text-espresso text-[10px] font-medium tracking-[0.28em] uppercase px-10 py-[17px] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(201,167,82,0.35)]"
            >
              {hero.ctaLabel}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 border border-gold-lt/35 text-gold-pl text-[10px] font-normal tracking-[0.28em] uppercase px-8 py-[17px] no-underline transition-all duration-300 hover:border-gold hover:text-gold-lt"
            >
              <span className="w-2 h-2 rounded-full bg-gold anim-pulse" />
              Contact Us
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2.5 anim-rise-5">
          <span className="text-[8px] tracking-[0.4em] uppercase text-gold-pl/55">Scroll</span>
          <div
            className="w-px h-9 relative overflow-hidden"
            style={{ background: "linear-gradient(180deg,#C9A752 0%,transparent 100%)" }}
          >
            <div className="absolute left-0 w-full h-full bg-gold-lt anim-scroll" />
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────── */}
      <div className="bg-oak-d border-y border-gold/25 overflow-hidden py-4">
        <div className="flex w-max anim-marquee">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="font-cormorant italic font-normal text-[20px] text-gold-lt tracking-[0.04em] px-16 whitespace-nowrap flex items-center gap-16"
            >
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

      {/* ── NAV TILES ─────────────────────────────────────────── */}
      <section className="bg-espresso px-5 md:px-20 py-20 md:py-28 max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Collection */}
          <Link href="/collection" className="no-underline group relative overflow-hidden border border-gold/20 bg-oak-d/40 flex flex-col justify-end p-8 md:p-10" style={{ minHeight: 320 }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-espresso/30 to-espresso/80 transition-opacity duration-500 group-hover:opacity-70" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 80%, rgba(201,167,82,0.12) 0%, transparent 70%)" }} />
            <span className="relative z-10 block text-[9px] tracking-[0.5em] uppercase text-gold mb-3">01</span>
            <h3 className="relative z-10 font-cormorant font-light text-[32px] text-gold-pl leading-[1.05] mb-3">
              The Collection
            </h3>
            <p className="relative z-10 text-[11.5px] tracking-[0.04em] leading-[1.8] text-gold-pl/55 mb-5 max-w-[240px]">
              Browse the full season — linen shirts, trousers, and tailored pieces.
            </p>
            <span className="relative z-10 text-[9px] tracking-[0.25em] uppercase text-gold inline-flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
              Explore →
            </span>
          </Link>

          {/* About / Atelier */}
          <Link href="/about" className="no-underline group relative overflow-hidden border border-gold/20 bg-oak-d/40 flex flex-col justify-end p-8 md:p-10" style={{ minHeight: 320 }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-espresso/30 to-espresso/80 transition-opacity duration-500 group-hover:opacity-70" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 80%, rgba(201,167,82,0.12) 0%, transparent 70%)" }} />
            <span className="relative z-10 block text-[9px] tracking-[0.5em] uppercase text-gold mb-3">02</span>
            <h3 className="relative z-10 font-cormorant font-light text-[32px] text-gold-pl leading-[1.05] mb-3">
              The Atelier
            </h3>
            <p className="relative z-10 text-[11.5px] tracking-[0.04em] leading-[1.8] text-gold-pl/55 mb-5 max-w-[240px]">
              Handcrafted with quiet precision — the story behind every piece.
            </p>
            <span className="relative z-10 text-[9px] tracking-[0.25em] uppercase text-gold inline-flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
              Discover →
            </span>
          </Link>

          {/* Contact */}
          <Link href="/contact" className="no-underline group relative overflow-hidden border border-gold/20 bg-oak-d/40 flex flex-col justify-end p-8 md:p-10" style={{ minHeight: 320 }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-espresso/30 to-espresso/80 transition-opacity duration-500 group-hover:opacity-70" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 80%, rgba(201,167,82,0.12) 0%, transparent 70%)" }} />
            <span className="relative z-10 block text-[9px] tracking-[0.5em] uppercase text-gold mb-3">03</span>
            <h3 className="relative z-10 font-cormorant font-light text-[32px] text-gold-pl leading-[1.05] mb-3">
              Private Preview
            </h3>
            <p className="relative z-10 text-[11.5px] tracking-[0.04em] leading-[1.8] text-gold-pl/55 mb-5 max-w-[240px]">
              Request a private appointment or reach us directly.
            </p>
            <span className="relative z-10 text-[9px] tracking-[0.25em] uppercase text-gold inline-flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
              Contact →
            </span>
          </Link>

        </div>
      </section>

      {/* ── PRESS QUOTE ──────────────────────────────────────── */}
      <section className="bg-espresso px-5 md:px-20 py-16 md:py-24 text-center relative overflow-hidden border-t border-gold/10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px]" style={{ background: "radial-gradient(ellipse, rgba(201,167,82,0.08) 0%, transparent 70%)" }} />
        <p
          className="relative z-[1] font-cormorant italic font-light text-gold-pl max-w-[820px] mx-auto mb-7 leading-[1.4]"
          style={{ fontSize: "clamp(26px,3.2vw,42px)" }}
        >
          "Linen, shell buttons, and hours of patient hand-work — this is{" "}
          <span className="text-gold">handcrafted</span> in its truest form."
        </p>
        <span className="relative z-[1] text-[10px] tracking-[0.3em] uppercase text-muted">— James LORLUM</span>
      </section>

      <StoreFooter />
    </div>
  );
}
