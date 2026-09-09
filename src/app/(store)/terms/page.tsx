import Link from "next/link";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";

interface Section { title: string; body: string }

const FALLBACK: Section[] = [
  { title: "การยอมรับข้อกำหนด", body: "การเข้าถึงหรือใช้งานเว็บไซต์ถือว่าท่านยอมรับข้อกำหนดและเงื่อนไขการให้บริการฉบับนี้ทุกประการ" },
  { title: "สินค้าและบริการ", body: "LORLUM จำหน่ายรองเท้าและเครื่องแต่งกายระดับ Luxury ที่ผลิตด้วยมือ" },
  { title: "การจัดส่ง", body: "จัดส่งทั่วประเทศไทยผ่าน EMS (2–3 วันทำการ) พร้อมประกันการจัดส่ง" },
];

async function getSections(): Promise<Section[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001"}/api/legal?type=terms`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return data.sections?.length ? data.sections : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

const NAV_LINKS = [
  { href: "/terms",   label: "Terms of Service",  th: "เงื่อนไขการให้บริการ" },
  { href: "/privacy", label: "Privacy Policy",    th: "นโยบายความเป็นส่วนตัว" },
  { href: "/cookies", label: "Cookie Policy",     th: "นโยบายคุกกี้" },
];

export default async function TermsPage() {
  const sections = await getSections();

  return (
    <div className="font-jost bg-ivory min-h-screen">
      <StoreNav cartCount={0} />

      {/* Hero */}
      <div className="border-b border-gold/[0.15]">
        <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-28 pb-12">
          <span className="block text-[8px] tracking-[0.6em] uppercase text-gold mb-5">Legal</span>
          <h1 className="font-cormorant text-[46px] md:text-[62px] font-normal text-espresso leading-[1.05] mb-6">
            เงื่อนไขการให้บริการ
            <span className="block text-[22px] md:text-[28px] text-muted/60 font-light mt-1">Terms of Service</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[9.5px] tracking-[0.2em] uppercase text-muted">
            <span>LORLUM Maison</span>
            <span className="text-gold/35">—</span>
            <span>ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-[900px] mx-auto px-5 md:px-10 py-14">
        <div>
          {sections.map((s, i) => (
            <div key={i} className="grid grid-cols-[52px_1fr] md:grid-cols-[72px_1fr] gap-6 md:gap-10 py-10 border-b border-gold/[0.1] last:border-b-0">
              <div className="pt-1">
                <span className="font-cormorant text-[36px] md:text-[44px] font-light leading-none text-gold/25 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h2 className="font-cormorant text-[22px] md:text-[26px] font-normal text-espresso mb-3 leading-tight">
                  {s.title}
                </h2>
                <p className="text-[13px] font-light text-muted leading-[2.1] whitespace-pre-line">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Legal nav */}
        <div className="mt-16 pt-10 border-t border-gold/[0.15]">
          <p className="text-[8px] tracking-[0.5em] uppercase text-gold mb-6">เอกสารกฎหมาย</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {NAV_LINKS.map(n => (
              <Link key={n.href} href={n.href}
                className={`group block border px-5 py-4 no-underline transition-colors ${
                  n.href === "/terms"
                    ? "border-gold/40 bg-gold/[0.04]"
                    : "border-gold/[0.15] hover:border-gold/35"
                }`}>
                <span className="block text-[8px] tracking-[0.3em] uppercase text-gold mb-1.5">{n.label}</span>
                <span className="block text-[12px] text-espresso group-hover:text-oak transition-colors">{n.th}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/" className="text-[9px] tracking-[0.25em] uppercase text-muted hover:text-gold transition-colors">
              ← กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>

      <StoreFooter />
    </div>
  );
}
