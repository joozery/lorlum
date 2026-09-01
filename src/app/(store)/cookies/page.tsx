"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";

interface Section { title: string; body: string }

const FALLBACK: Section[] = [
  { title: "คุกกี้จำเป็น (Strictly Necessary)", body: "คุกกี้เหล่านี้จำเป็นสำหรับการทำงานของเว็บไซต์ ไม่สามารถปิดได้" },
  { title: "คุกกี้วิเคราะห์ (Analytics)", body: "ช่วยให้เราเข้าใจว่าผู้เยี่ยมชมใช้งานเว็บไซต์อย่างไร เพื่อปรับปรุงประสบการณ์" },
  { title: "คุกกี้การตลาด (Marketing)", body: "ใช้สำหรับแสดงโฆษณาที่เกี่ยวข้องและติดตามประสิทธิภาพของแคมเปญ" },
];

export default function CookiesPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/legal?type=cookies")
      .then(r => r.json())
      .then(d => setSections(d.sections?.length ? d.sections : FALLBACK))
      .catch(() => setSections(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const resetConsent = () => {
    localStorage.removeItem("cookie_consent");
    window.location.reload();
  };

  return (
    <div className="font-jost bg-ivory min-h-screen">
      <StoreNav cartCount={0} />
      <div className="max-w-[780px] mx-auto px-5 md:px-8 pt-28 pb-24">
        <div className="mb-12">
          <span className="block text-[8px] tracking-[0.5em] uppercase text-gold mb-3">Legal</span>
          <h1 className="font-cormorant text-[40px] md:text-[52px] font-normal text-espresso leading-[1.1] mb-4">
            นโยบายคุกกี้
          </h1>
          <p className="text-xs text-muted">เราใช้คุกกี้เพื่อมอบประสบการณ์ที่ดีที่สุดให้กับท่าน</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[11px] tracking-[0.2em] uppercase text-muted">Loading...</div>
        ) : (
          <div className="space-y-8">
            {sections.map((s, i) => (
              <div key={i} className="border-t border-gold/[0.12] pt-7">
                <h2 className="font-cormorant text-[22px] font-normal text-espresso mb-3">{s.title}</h2>
                <p className="text-[13px] font-light text-muted leading-[1.9] whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reset consent */}
        <div className="mt-10 border border-gold/[0.15] bg-cream p-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-2">จัดการความยินยอม</p>
          <p className="text-[12px] font-light text-muted leading-[1.8] mb-4">
            คลิกปุ่มด้านล่างเพื่อเปิด cookie banner และปรับการตั้งค่าใหม่
          </p>
          <button
            onClick={resetConsent}
            className="h-9 px-5 bg-espresso text-gold-lt font-jost text-[9px] tracking-[0.25em] uppercase cursor-pointer border-none hover:bg-oak-d transition-colors"
          >
            เปิดการตั้งค่าคุกกี้
          </button>
        </div>

        <div className="mt-10 border-t border-gold/[0.12] pt-8 flex flex-wrap gap-4 text-[9px] tracking-[0.2em] uppercase text-muted">
          <Link href="/terms"   className="hover:text-gold transition-colors">เงื่อนไขการให้บริการ</Link>
          <span className="text-gold/30">·</span>
          <Link href="/privacy" className="hover:text-gold transition-colors">นโยบายความเป็นส่วนตัว</Link>
          <span className="text-gold/30">·</span>
          <Link href="/"        className="hover:text-gold transition-colors">กลับหน้าหลัก</Link>
        </div>
      </div>
      <StoreFooter />
    </div>
  );
}
