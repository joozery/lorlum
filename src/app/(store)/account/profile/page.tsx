"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { useStoreLang } from "@/contexts/store-language-context";
import ST from "@/lib/store-translations";

interface Address {
  label: string; line1: string; line2: string;
  province: string; city: string; zip: string; country: string; isDefault: boolean;
}
interface Customer {
  _id: string; name: string; firstName: string; lastName: string;
  email: string; phone: string; addresses: Address[]; createdAt: string;
}

const inputCls = "w-full h-10 border-none border-b border-gold/30 bg-transparent font-jost text-[13px] text-espresso outline-none px-1 placeholder:text-muted/50";
const labelCls = "block text-[8.5px] tracking-[0.25em] uppercase text-muted mb-2";

export default function ProfilePage() {
  const router  = useRouter();
  const { lang } = useStoreLang();
  const t = ST[lang];

  const NAV = [
    { href: "/account/profile",  label: t.profNavProfile },
    { href: "/account/orders",   label: t.profNavOrders },
    { href: "/account/wishlist", label: t.profNavWishlist },
  ];

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState<"info"|"address"|"pw"|null>(null);
  const [pwErr,    setPwErr]    = useState("");

  const [info, setInfo] = useState({ firstName: "", lastName: "", phone: "" });
  const [addr, setAddr] = useState({ line1: "", province: "", city: "", zip: "" });
  const [pw, setPw] = useState({ password: "", confirm: "" });

  useEffect(() => {
    fetch("/api/store/account")
      .then(r => { if (r.status === 401) { router.push("/account"); return null; } return r.json(); })
      .then((d: Customer | null) => {
        if (!d) return;
        setCustomer(d);
        const first = d.firstName || d.name?.split(" ")[0] || "";
        const last  = d.lastName  || d.name?.split(" ").slice(1).join(" ") || "";
        setInfo({ firstName: first, lastName: last, phone: d.phone ?? "" });
        const a = d.addresses?.[0];
        setAddr({ line1: a?.line1 ?? "", province: a?.province ?? "", city: a?.city ?? "", zip: a?.zip ?? "" });
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function saveInfo() {
    setSaving(true);
    await fetch("/api/store/account", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: info.firstName, lastName: info.lastName, phone: info.phone }),
    });
    setSaving(false); setSaved("info");
    setTimeout(() => setSaved(null), 2500);
  }

  async function saveAddr() {
    setSaving(true);
    const res  = await fetch("/api/store/account", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addr }),
    });
    const data = await res.json();
    const a = data.addresses?.[0];
    if (a !== undefined) {
      setAddr({ line1: a.line1 ?? "", province: a.province ?? "", city: a.city ?? "", zip: a.zip ?? "" });
    }
    setSaving(false); setSaved("address");
    setTimeout(() => setSaved(null), 2500);
  }

  async function savePw() {
    setPwErr("");
    if (pw.password !== pw.confirm) { setPwErr(t.errPwMismatch); return; }
    if (pw.password.length < 6)     { setPwErr(t.errPwTooShort); return; }
    setSaving(true);
    await fetch("/api/store/account", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw.password }),
    });
    setSaving(false); setPw({ password: "", confirm: "" });
    setSaved("pw"); setTimeout(() => setSaved(null), 2500);
  }

  const handleLogout = async () => {
    await fetch("/api/store/auth/logout", { method: "POST" });
    router.push("/account");
  };

  if (loading) return (
    <div className="font-jost bg-ivory min-h-screen flex items-center justify-center">
      <StoreNav active="home" cartCount={0} />
      <span className="text-[11px] tracking-[0.3em] uppercase text-muted">{t.loadingLabel}</span>
    </div>
  );

  const displayName = [customer?.firstName || info.firstName, customer?.lastName || info.lastName].filter(Boolean).join(" ") || customer?.name || t.welcome;

  return (
    <div className="font-jost bg-ivory min-h-screen">
      <StoreNav active="home" cartCount={0} />

      <div className="max-w-[900px] mx-auto px-5 md:px-8 pt-28 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="block text-[8px] tracking-[0.5em] uppercase text-gold mb-2">{t.myAccount}</span>
            <h1 className="font-cormorant text-[32px] font-normal text-espresso">{displayName}</h1>
            <p className="text-xs text-muted mt-1">{customer?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="text-[9px] tracking-[0.22em] uppercase text-muted border border-gold/25 px-4 py-2 bg-transparent cursor-pointer hover:border-gold/50 transition-colors font-jost">
            {t.signOut}
          </button>
        </div>

        {/* Sub nav */}
        <div className="flex gap-0 border-b border-gold/20 mb-10">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`px-5 pb-3 text-[9px] tracking-[0.28em] uppercase no-underline transition-colors font-jost ${
                n.href === "/account/profile" ? "text-espresso border-b-2 border-gold -mb-px" : "text-muted hover:text-espresso"
              }`}>
              {n.label}
            </Link>
          ))}
        </div>

        <div className="space-y-6">

          {/* Personal Information */}
          <div className="bg-cream border border-gold/[0.15] p-6 space-y-5">
            <h2 className="text-[10px] tracking-[0.35em] uppercase text-gold">{t.personalInfo}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t.profFirstName}</label>
                <input value={info.firstName} onChange={e => setInfo(f => ({ ...f, firstName: e.target.value }))}
                  placeholder={t.profFirstName} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.profLastName}</label>
                <input value={info.lastName} onChange={e => setInfo(f => ({ ...f, lastName: e.target.value }))}
                  placeholder={t.profLastName} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>E-mail</label>
              <input value={customer?.email ?? ""} disabled
                className="w-full h-10 border-none border-b border-gold/15 bg-transparent font-jost text-[13px] text-muted outline-none px-1 cursor-not-allowed" />
            </div>

            <div>
              <label className={labelCls}>{t.profPhone}</label>
              <input value={info.phone} onChange={e => setInfo(f => ({ ...f, phone: e.target.value }))}
                placeholder="+66 81 234 5678" className={inputCls} />
            </div>

            <button onClick={saveInfo} disabled={saving}
              className="w-full h-10 bg-espresso text-gold-lt border-none font-jost text-[9px] tracking-[0.3em] uppercase cursor-pointer disabled:opacity-50 transition-all">
              {saved === "info" ? t.profSaved : saving ? t.profSaving : t.saveChanges}
            </button>
          </div>

          {/* Shipping Address */}
          <div className="bg-cream border border-gold/[0.15] p-6 space-y-5">
            <h2 className="text-[10px] tracking-[0.35em] uppercase text-gold">{t.shippingAddr}</h2>

            <div>
              <label className={labelCls}>{t.profAddress}</label>
              <input value={addr.line1} onChange={e => setAddr(f => ({ ...f, line1: e.target.value }))}
                placeholder={t.addrStreet} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t.profProvince}</label>
                <input value={addr.province} onChange={e => setAddr(f => ({ ...f, province: e.target.value }))}
                  placeholder={t.profProvince} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.profDistrict}</label>
                <input value={addr.city} onChange={e => setAddr(f => ({ ...f, city: e.target.value }))}
                  placeholder={t.profDistrict} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t.profPostcode}</label>
                <input value={addr.zip} onChange={e => setAddr(f => ({ ...f, zip: e.target.value }))}
                  placeholder="10110" maxLength={5} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.addrCountry}</label>
                <input value={t.addrCountryVal} disabled
                  className="w-full h-10 border-none border-b border-gold/15 bg-transparent font-jost text-[13px] text-muted outline-none px-1 cursor-not-allowed" />
              </div>
            </div>

            <button onClick={saveAddr} disabled={saving}
              className="w-full h-10 bg-espresso text-gold-lt border-none font-jost text-[9px] tracking-[0.3em] uppercase cursor-pointer disabled:opacity-50 transition-all">
              {saved === "address" ? t.profSaved : saving ? t.profSaving : t.saveAddress}
            </button>
          </div>

          {/* Change Password */}
          <div className="bg-cream border border-gold/[0.15] p-6 space-y-5">
            <h2 className="text-[10px] tracking-[0.35em] uppercase text-gold">{t.changePassword}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t.newPassword}</label>
                <input type="password" value={pw.password}
                  onChange={e => setPw(f => ({ ...f, password: e.target.value }))}
                  placeholder={lang === "en" ? "At least 6 characters" : "อย่างน้อย 6 ตัวอักษร"} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.confirmPassword}</label>
                <input type="password" value={pw.confirm}
                  onChange={e => setPw(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="••••••••" className={inputCls} />
              </div>
            </div>
            {pwErr && <p className="text-[11px] text-red-500">{pwErr}</p>}
            <button onClick={savePw} disabled={saving || !pw.password}
              className="w-full h-10 bg-transparent border border-gold/30 text-muted font-jost text-[9px] tracking-[0.3em] uppercase cursor-pointer hover:border-gold/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {saved === "pw" ? t.profUpdated : saving ? t.profSaving : t.updatePassword}
            </button>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { href: "/account/orders",   label: t.quickLinkOrders,   desc: t.quickLinkOrdersDesc },
              { href: "/account/wishlist", label: t.quickLinkWishlist,  desc: t.quickLinkWishlistDesc },
              { href: "/collection",       label: t.quickLinkShop,      desc: t.quickLinkShopDesc },
            ].map(c => (
              <Link key={c.href} href={c.href}
                className="bg-cream border border-gold/[0.15] p-5 no-underline group hover:border-gold/35 transition-colors">
                <p className="text-[9px] tracking-[0.28em] uppercase text-gold mb-1.5">{c.label}</p>
                <p className="text-xs text-muted group-hover:text-espresso transition-colors">{c.desc}</p>
              </Link>
            ))}
          </div>

        </div>
      </div>

      <StoreFooter />
    </div>
  );
}
