import Link from "next/link";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";

interface Section { title: string; body: string }

const FALLBACK: Section[] = [
  { title: "1. ข้อมูลที่เราเก็บรวบรวม", body: "เราเก็บข้อมูลที่ท่านให้ไว้โดยตรง เช่น ชื่อ อีเมล เบอร์โทรศัพท์ และที่อยู่จัดส่ง" },
  { title: "2. วัตถุประสงค์การใช้ข้อมูล", body: "เราใช้ข้อมูลของท่านเพื่อประมวลผลและจัดส่งคำสั่งซื้อ และปรับปรุงบริการ" },
  { title: "3. การแบ่งปันข้อมูล", body: "เราไม่ขายข้อมูลส่วนบุคคลของท่าน เราแบ่งปันกับบุคคลที่สามเฉพาะในกรณีจำเป็น" },
  { title: "4. สิทธิ์ของเจ้าของข้อมูล", body: "ท่านมีสิทธิ์เข้าถึง แก้ไข ลบ และคัดค้านการประมวลผลข้อมูลส่วนบุคคลของท่าน" },
  { title: "5. ติดต่อเรา", body: "หากมีคำถามเกี่ยวกับนโยบายนี้ ติดต่อ privacy@lorlum.com" },
];

async function getSections(): Promise<Section[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/legal?type=privacy`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return data.sections?.length ? data.sections : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export default async function PrivacyPage() {
  const sections = await getSections();

  return (
    <div className="font-jost bg-ivory min-h-screen">
      <StoreNav cartCount={0} />
      <div className="max-w-[780px] mx-auto px-5 md:px-8 pt-28 pb-24">
        <div className="mb-12">
          <span className="block text-[8px] tracking-[0.5em] uppercase text-gold mb-3">Legal</span>
          <h1 className="font-cormorant text-[40px] md:text-[52px] font-normal text-espresso leading-[1.1] mb-4">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="text-xs text-muted">ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)</p>
        </div>
        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i} className="border-t border-gold/[0.12] pt-7">
              <h2 className="font-cormorant text-[22px] font-normal text-espresso mb-3">{s.title}</h2>
              <p className="text-[13px] font-light text-muted leading-[1.9] whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 border-t border-gold/[0.12] pt-8 flex flex-wrap gap-4 text-[9px] tracking-[0.2em] uppercase text-muted">
          <Link href="/terms"   className="hover:text-gold transition-colors">เงื่อนไขการให้บริการ</Link>
          <span className="text-gold/30">·</span>
          <Link href="/cookies" className="hover:text-gold transition-colors">นโยบายคุกกี้</Link>
          <span className="text-gold/30">·</span>
          <Link href="/"        className="hover:text-gold transition-colors">กลับหน้าหลัก</Link>
        </div>
      </div>
      <StoreFooter />
    </div>
  );
}
