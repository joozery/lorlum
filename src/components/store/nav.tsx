"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, ChevronDown } from "lucide-react";
import { useStoreLang } from "@/contexts/store-language-context";
import { useStoreCurrency } from "@/contexts/store-currency-context";
import { CURRENCY_META, StoreCurrency } from "@/lib/currencies";
import ST from "@/lib/store-translations";

interface StoreNavProps {
  active?: "home" | "collection" | "cart" | "contact";
  cartCount?: number;
}

function CurrencyDropdown({
  currency, setCurrency, options, compact = false,
}: {
  currency: StoreCurrency;
  setCurrency: (c: StoreCurrency) => void;
  options: StoreCurrency[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 font-light uppercase text-muted hover:text-gold transition-colors duration-300 bg-transparent border border-gold/25 hover:border-gold/60 cursor-pointer font-jost ${
          compact ? "text-[9px] tracking-[0.15em] px-2 py-1" : "text-[10px] tracking-[0.18em] px-2.5 py-1"
        }`}
      >
        <span>{CURRENCY_META[currency].flag} {CURRENCY_META[currency].label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-full mt-1.5 z-[1000] min-w-[110px] bg-ivory border border-gold/25 shadow-lg list-none py-1">
          {options.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => { setCurrency(c); setOpen(false); }}
                className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-[10.5px] tracking-[0.1em] uppercase font-jost transition-colors duration-150 ${
                  c === currency ? "text-gold bg-gold/10" : "text-muted hover:text-gold hover:bg-gold/5"
                }`}
              >
                <span>{CURRENCY_META[c].flag}</span>
                <span>{CURRENCY_META[c].label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StoreNav({ active, cartCount = 0 }: StoreNavProps) {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [loggedIn,   setLoggedIn]   = useState(false);
  const { lang, setLang } = useStoreLang();
  const { currency, setCurrency, availableCurrencies, allowSwitch } = useStoreCurrency();
  const showCurrencySwitch = allowSwitch && availableCurrencies.length > 1;
  const t = ST[lang];

  useEffect(() => {
    fetch("/api/store/account").then(r => setLoggedIn(r.ok)).catch(() => setLoggedIn(false));
  }, []);

  const linkClass = (page?: string) =>
    `text-[10.5px] font-light tracking-[0.18em] uppercase no-underline transition-colors duration-300 ${
      active === page ? "text-gold" : "text-muted hover:text-gold"
    }`;

  const mobileLink = (page?: string) =>
    `block px-7 py-[18px] text-[11px] font-light tracking-[0.22em] uppercase no-underline border-b border-gold/10 transition-colors duration-200 ${
      active === page ? "text-gold bg-gold/5" : "text-muted hover:text-gold hover:bg-gold/5"
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[999] h-[60px] md:h-[68px] px-5 md:px-[52px] flex items-center justify-between bg-ivory/95 backdrop-blur-[18px] border-b border-gold/[0.12] transition-all duration-300">

        {/* Left links — desktop */}
        <ul className="hidden md:flex gap-9 list-none">
          <li><Link href="/" className={linkClass("home")}>{t.navMaison}</Link></li>
          <li><Link href="/collection" className={linkClass("collection")}>{t.navCollection}</Link></li>
          <li><a href="#atelier" className={linkClass()}>{t.navAtelier}</a></li>
        </ul>

        {/* Logo */}
        <Link href="/" className="hidden md:block font-cormorant font-normal text-[26px] md:text-[30px] tracking-[0.06em] text-oak-d no-underline text-center leading-none absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          LORLUM
        </Link>

        {/* Right links — desktop */}
        <ul className="hidden md:flex gap-7 list-none items-center">
          <li><Link href="/contact" className={linkClass("contact")}>{t.navContact}</Link></li>
          <li>
            <Link href={loggedIn ? "/account/profile" : "/account"}
              className={`flex items-center gap-1.5 ${linkClass()}`}
              title={loggedIn ? "My Account" : "Sign In"}>
              <User className="h-[14px] w-[14px]" />
              <span>{loggedIn ? "Account" : "Sign In"}</span>
            </Link>
          </li>
          <li>
            <Link href="/cart" className={linkClass("cart")}>
              {t.navCart}&nbsp;({cartCount})
            </Link>
          </li>
          {/* Language toggle */}
          <li>
            <button
              onClick={() => setLang(lang === "en" ? "th" : "en")}
              className="text-[10px] font-light tracking-[0.18em] uppercase text-muted hover:text-gold transition-colors duration-300 bg-transparent border border-gold/25 hover:border-gold/60 px-2.5 py-1 cursor-pointer font-jost"
              title={lang === "en" ? "Switch to Thai" : "เปลี่ยนเป็นภาษาอังกฤษ"}
            >
              {lang === "en" ? "🇹🇭 TH" : "🇺🇸 EN"}
            </button>
          </li>
          {/* Currency switch */}
          {showCurrencySwitch && (
            <li>
              <CurrencyDropdown currency={currency} setCurrency={setCurrency} options={availableCurrencies} />
            </li>
          )}
        </ul>

        {/* Mobile: lang toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "th" : "en")}
            className="text-[9px] tracking-[0.15em] uppercase text-muted border border-gold/25 px-2 py-1 bg-transparent cursor-pointer font-jost"
          >
            {lang === "en" ? "TH" : "EN"}
          </button>
          {showCurrencySwitch && (
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} options={availableCurrencies} compact />
          )}
          <button
            className="flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-[22px] h-px bg-oak-d transition-all duration-300 origin-center ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block w-[22px] h-px bg-oak-d transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-[22px] h-px bg-oak-d transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <div className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link href="/"            className={mobileLink("home")}       onClick={() => setMenuOpen(false)}>{t.navMaison}</Link>
        <Link href="/collection" className={mobileLink("collection")} onClick={() => setMenuOpen(false)}>{t.navCollection}</Link>
        <a    href="#atelier"          className={mobileLink()}             onClick={() => setMenuOpen(false)}>{t.navAtelier}</a>
        <Link href="/contact" className={mobileLink("contact")} onClick={() => setMenuOpen(false)}>{t.navContact}</Link>
        <Link href="/account"    className={mobileLink()}             onClick={() => setMenuOpen(false)}>{t.navAccount}</Link>
        <Link href="/cart"       className={mobileLink("cart")}       onClick={() => setMenuOpen(false)}>{t.navCart} ({cartCount})</Link>
      </div>
    </>
  );
}
