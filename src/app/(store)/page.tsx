import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { HomeContent } from "@/components/store/home-content";

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
      : h.bgImageUrl ? [h.bgImageUrl as string] : [];
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

export default async function StoreLandingPage() {
  const [products, hero] = await Promise.all([fetchFeaturedProducts(), fetchHeroSettings()]);
  return (
    <div className="font-jost bg-ivory text-ltext overflow-x-hidden min-h-screen">
      <StoreNav active="home" />
      <HomeContent products={products} hero={hero} />
      <StoreFooter />
    </div>
  );
}
