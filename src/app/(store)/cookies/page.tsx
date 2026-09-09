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

const NAV_LINKS = [
  { href: "/terms",   label: "Terms of Service",  th: "เงื่อนไขการให้บริการ" },
  { href: "/privacy", label: "Privacy Policy",    th: "นโยบายความเป็นส่วนตัว" },
  { href: "/cookies", label: "Cookie Policy",     th: "นโยบายคุกกี้" },
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

      {/* Hero */}
      <div className="border-b border-gold/[0.15]">
        <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-28 pb-12">
          <span className="block text-[8px] tracking-[0.6em] uppercase text-gold mb-5">Legal</span>
          <h1 className="font-cormorant text-[46px] md:text-[62px] font-normal text-espresso leading-[1.05] mb-6">
            นโยบายคุกกี้
            <span className="block text-[22px] md:text-[28px] text-muted/60 font-light mt-1">Cookie Policy</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[9.5px] tracking-[0.2em] uppercase text-muted">
            <span>LORLUM Maison</span>
            <span className="text-gold/35">—</span>
            <span>เราใช้คุกกี้เพื่อมอบประสบการณ์ที่ดีที่สุดให้กับท่าน</span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-[900px] mx-auto px-5 md:px-10 py-14">

        {loading ? (
          <div className="py-24 text-center text-[9px] tracking-[0.4em] uppercase text-muted/50">Loading…</div>
        ) : (
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
        )}

        {/* Reset consent */}
        <div className="mt-12 border border-gold/[0.18] bg-cream p-7 flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <p className="text-[9px] tracking-[0.35em] uppercase text-gold mb-2">จัดการความยินยอม</p>
            <p className="text-[12.5px] font-light text-muted leading-[1.8]">
              คลิกเพื่อเปิด cookie banner และปรับการตั้งค่าความยินยอมของท่านใหม่
            </p>
          </div>
          <button
            onClick={resetConsent}
            className="shrink-0 h-10 px-7 bg-espresso text-gold-lt font-jost text-[9px] tracking-[0.3em] uppercase cursor-pointer border-none hover:opacity-80 transition-opacity"
          >
            เปิดการตั้งค่าคุกกี้
          </button>
        </div>

        {/* Legal nav */}
        <div className="mt-16 pt-10 border-t border-gold/[0.15]">
          <p className="text-[8px] tracking-[0.5em] uppercase text-gold mb-6">เอกสารกฎหมาย</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {NAV_LINKS.map(n => (
              <Link key={n.href} href={n.href}
                className={`group block border px-5 py-4 no-underline transition-colors ${
                  n.href === "/cookies"
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
