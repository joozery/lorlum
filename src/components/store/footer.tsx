"use client";

import Link from "next/link";
import { useStoreLang } from "@/contexts/store-language-context";
import ST from "@/lib/store-translations";

export function StoreFooter() {
  const { lang } = useStoreLang();
  const t = ST[lang];

  return (
    <footer className="bg-espresso border-t border-gold/[0.12] px-5 md:px-20 pt-10 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="font-cormorant font-normal text-2xl tracking-[0.34em] text-gold-lt">
          LORLUM
          <small className="block font-jost text-[7px] font-light tracking-[0.6em] text-gold mt-1">
            {t.footerTagline}
          </small>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { href: "/",           label: t.footerHome },
            { href: "/collection", label: t.navCollection },
            { href: "/account",    label: t.footerAccount },
            { href: "/cart",       label: t.navCart },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="text-[9px] tracking-[0.2em] uppercase text-muted hover:text-gold transition-colors no-underline font-jost">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-gold/[0.08] pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="text-[9px] font-light tracking-[0.12em] text-muted/60">{t.footerCopy}</span>
        <div className="flex gap-5">
          {[
            { href: "/terms",   label: t.footerTerms },
            { href: "/privacy", label: t.footerPrivacy },
            { href: "/cookies", label: t.footerCookies },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="text-[8.5px] tracking-[0.15em] uppercase text-muted/50 hover:text-gold transition-colors no-underline font-jost">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
