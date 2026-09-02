import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { RevealSection } from "@/components/store/reveal-section";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="font-jost bg-ivory text-ltext overflow-x-hidden min-h-screen">
      <StoreNav active="about" />

      {/* ── INTRO ─────────────────────────────────────────────── */}
      <section className="pt-[170px] pb-[90px] px-6 text-center max-w-[760px] mx-auto">
        <RevealSection>
          <span className="block text-[9px] font-normal tracking-[0.6em] uppercase text-gold mb-5">
            The Atelier
          </span>
          <h1 className="font-cormorant font-light text-oak-d leading-[1.05] mb-7" style={{ fontSize: "clamp(38px,5vw,58px)" }}>
            From Hide to <em className="italic text-oak">Heirloom</em>
          </h1>
          <p className="font-light text-[14px] tracking-[0.02em] leading-[1.95] text-muted">
            Every piece begins in silence — measured, cut, and stitched by hands that have spent years learning the patience that perfection demands. This is not manufacturing. This is craft.
          </p>
          <div className="w-px h-11 mx-auto mt-9" style={{ background: "linear-gradient(180deg,#C9A752 0%,transparent 100%)" }} />
        </RevealSection>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────── */}
      <section className="bg-cream border-y border-gold/[0.15] px-5 md:px-20 py-24 md:py-36">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 relative">
          <div className="hidden md:block absolute top-[34px] left-[8%] right-[8%] h-px" style={{ background: "repeating-linear-gradient(90deg, rgba(201,167,82,0.4) 0 6px, transparent 6px 14px)" }} />
          {[
            {
              num: "01",
              title: "The Cut",
              text: "Every linen shirt and every linen trouser is cut and hand-sewn with quiet precision, each stage unhurried and given the hours it deserves.",
            },
            {
              num: "02",
              title: "The Stitch",
              text: "The buttons are genuine shell — the rarest in the world — drawn from the depths of the ocean floor and reserved for those who understand true rarity.",
            },
            {
              num: "03",
              title: "The Finish",
              text: "To set the most beautiful shell upon each shirt demands an artisan's discerning eye, selecting one by one, until nothing short of perfection remains.",
            },
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

      {/* ── PRESS QUOTE ──────────────────────────────────────── */}
      <section className="bg-espresso px-5 md:px-20 py-20 md:py-32 text-center relative overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px]"
          style={{ background: "radial-gradient(ellipse, rgba(201,167,82,0.1) 0%, transparent 70%)" }}
        />
        <RevealSection>
          <p
            className="relative z-[1] font-cormorant italic font-light text-gold-pl max-w-[820px] mx-auto mb-7 leading-[1.4]"
            style={{ fontSize: "clamp(26px,3.2vw,42px)" }}
          >
            "Linen, shell buttons, and hours of patient hand-work — this is{" "}
            <span className="text-gold">handcrafted</span> in its truest form."
          </p>
          <span className="relative z-[1] text-[10px] tracking-[0.3em] uppercase text-muted">— James LORLUM</span>
        </RevealSection>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-cream border-t border-gold/[0.15] px-5 md:px-20 py-20 md:py-32 text-center">
        <RevealSection>
          <span className="block text-[9px] tracking-[0.6em] uppercase text-gold mb-5">Private Preview</span>
          <h2
            className="font-cormorant font-light text-oak-d leading-[1.05] mb-9"
            style={{ fontSize: "clamp(34px,5vw,64px)" }}
          >
            Own a Piece Before<br />It&apos;s <em className="italic text-oak">Gone</em>
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/collection"
              className="inline-block bg-gold text-espresso text-[10px] font-medium tracking-[0.28em] uppercase px-10 py-[17px] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(201,167,82,0.35)]"
            >
              Explore Collection
            </Link>
            <Link
              href="/contact"
              className="inline-block border border-oak-d/40 text-oak-d text-[10px] font-medium tracking-[0.28em] uppercase px-10 py-[17px] no-underline transition-all duration-300 hover:border-gold hover:text-gold"
            >
              Request Private Preview
            </Link>
          </div>
        </RevealSection>
      </section>

      <StoreFooter />
    </div>
  );
}
