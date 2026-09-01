"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [detail,  setDetail]  = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false });

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const accept = (all: boolean) => {
    localStorage.setItem("cookie_consent", JSON.stringify({
      necessary: true,
      analytics: all ? true : prefs.analytics,
      marketing: all ? true : prefs.marketing,
      ts: Date.now(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] px-4 pb-4 md:px-8 md:pb-6 pointer-events-none">
      <div className="max-w-[680px] mx-auto pointer-events-auto bg-espresso border border-gold/25 shadow-2xl">

        {/* Main banner */}
        {!detail && (
          <div className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-1.5">Cookie Policy</p>
              <p className="text-[12px] font-light text-gold-lt/80 leading-[1.7]">
                เราใช้คุกกี้เพื่อมอบประสบการณ์ที่ดีที่สุด{" "}
                <Link href="/cookies" className="text-gold underline underline-offset-2">นโยบายคุกกี้</Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => setDetail(true)}
                className="h-9 px-4 bg-transparent border border-gold/30 text-gold-lt/70 font-jost text-[9px] tracking-[0.22em] uppercase cursor-pointer hover:border-gold/60 transition-colors"
              >
                ปรับแต่ง
              </button>
              <button
                onClick={() => accept(false)}
                className="h-9 px-4 bg-transparent border border-gold/30 text-gold-lt/70 font-jost text-[9px] tracking-[0.22em] uppercase cursor-pointer hover:border-gold/60 transition-colors"
              >
                จำเป็นเท่านั้น
              </button>
              <button
                onClick={() => accept(true)}
                className="h-9 px-5 bg-gold text-espresso font-jost text-[9px] tracking-[0.22em] uppercase cursor-pointer hover:bg-gold/90 transition-colors font-medium"
              >
                ยอมรับทั้งหมด
              </button>
            </div>
          </div>
        )}

        {/* Detail / preference panel */}
        {detail && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold">ตั้งค่าคุกกี้</p>
              <button onClick={() => setDetail(false)} className="text-gold-lt/50 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
            </div>

            {[
              { key: "necessary", label: "จำเป็น (Necessary)", desc: "คุกกี้สำหรับการทำงานพื้นฐานของเว็บไซต์ ไม่สามารถปิดได้", fixed: true },
              { key: "analytics", label: "วิเคราะห์ (Analytics)", desc: "ช่วยให้เราเข้าใจว่าผู้เยี่ยมชมใช้งานเว็บไซต์อย่างไร" },
              { key: "marketing", label: "การตลาด (Marketing)", desc: "ใช้สำหรับแสดงโฆษณาที่เกี่ยวข้องกับความสนใจของคุณ" },
            ].map(({ key, label, desc, fixed }) => (
              <div key={key} className="flex items-start justify-between gap-4 border-t border-gold/10 pt-3">
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-gold-lt mb-0.5">{label}</p>
                  <p className="text-[10px] font-light text-gold-lt/55 leading-[1.6]">{desc}</p>
                </div>
                <div
                  onClick={() => { if (!fixed) setPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] })); }}
                  className={`relative w-10 h-5 rounded-full shrink-0 mt-0.5 transition-colors duration-200 ${
                    fixed || prefs[key as keyof typeof prefs]
                      ? "bg-gold cursor-default"
                      : "bg-gold/20 cursor-pointer"
                  }`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-ivory transition-all duration-200 ${
                    fixed || prefs[key as keyof typeof prefs] ? "left-5" : "left-0.5"
                  }`} />
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => accept(false)}
                className="flex-1 h-9 bg-transparent border border-gold/30 text-gold-lt/70 font-jost text-[9px] tracking-[0.22em] uppercase cursor-pointer hover:border-gold/60 transition-colors"
              >
                บันทึกการตั้งค่า
              </button>
              <button
                onClick={() => accept(true)}
                className="flex-1 h-9 bg-gold text-espresso font-jost text-[9px] tracking-[0.22em] uppercase cursor-pointer hover:bg-gold/90 transition-colors font-medium"
              >
                ยอมรับทั้งหมด
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
