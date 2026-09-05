"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";

export default function RequestAccessPage() {
  const [mounted, setMounted] = useState(false);
  const [fname, setFname] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [interest, setInterest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmId, setConfirmId] = useState("");

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/store/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fname, email, location, interest }),
      });
      const data = await res.json();
      if (data.ok) {
        setConfirmId(data.applicationNo);
        setConfirmed(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-transparent border-b border-[rgba(201,167,82,0.3)] py-0 pb-3 font-jost text-[14.5px] font-light tracking-[0.01em] text-ltext placeholder:text-[rgba(140,115,85,0.55)] focus:outline-none focus:border-gold transition-colors duration-300";
  const labelClass =
    "block text-[9px] font-normal tracking-[0.2em] uppercase text-muted mb-3";

  return (
    <div
      className="font-jost bg-ivory text-ltext min-h-screen overflow-x-hidden"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.6s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <StoreNav />

      <main className="min-h-screen flex items-center justify-center px-6 pt-[180px] pb-[120px]">
        <div className="w-full max-w-[460px] mx-auto text-center">

          {/* ── FORM VIEW ── */}
          {!confirmed && (
            <div>
              <span className="anim-rise-1 flex items-center justify-center gap-3.5 text-[9px] font-normal tracking-[0.55em] uppercase text-gold mb-8">
                <span className="w-5 h-px bg-gold block" />
                The Private List
                <span className="w-5 h-px bg-gold block" />
              </span>

              <h1
                className="anim-rise-2 font-cormorant font-light text-oak-d uppercase tracking-[0.01em] leading-[1.05] mb-7"
                style={{ fontSize: "clamp(38px,5.4vw,58px)" }}
              >
                Request Private<br />
                <em className="italic text-oak font-normal normal-case">Access</em>
              </h1>

              <p className="anim-rise-2i font-light text-[13.5px] leading-[1.95] tracking-[0.02em] text-muted max-w-[400px] mx-auto mb-14">
                Access to LORLUM private previews is strictly limited to maintain
                exclusivity. Please submit your details to join the allocation list.
              </p>

              {/* ── QUOTA BAR ── */}
              <div className="anim-rise-3 mb-14 max-w-[380px] mx-auto">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-[9px] font-normal tracking-[0.22em] uppercase text-muted">
                    Season 2026 Allocation
                  </span>
                  <span className="font-cormorant text-[15px] text-oak-d tracking-[0.02em]">
                    <span className="text-gold">81</span> / 100 Reserved
                  </span>
                </div>
                <div className="relative h-px bg-[rgba(201,167,82,0.22)] overflow-visible">
                  <div
                    className="absolute left-0 top-0 h-px bg-gold"
                    style={{
                      width: 0,
                      animation: "fillQuota 1.6s cubic-bezier(0.16,1,0.3,1) 0.9s forwards",
                    }}
                  >
                    <span
                      className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-gold block"
                      style={{ boxShadow: "0 0 0 4px rgba(201,167,82,0.18)" }}
                    />
                  </div>
                </div>
              </div>

              {/* ── FORM ── */}
              <form
                onSubmit={handleSubmit}
                className="anim-rise-3 text-left"
                noValidate
              >
                <div className="mb-[34px]">
                  <label className={labelClass} htmlFor="fname">First &amp; Last Name</label>
                  <input
                    id="fname"
                    type="text"
                    value={fname}
                    onChange={e => setFname(e.target.value)}
                    placeholder="e.g. Alexandra Voss"
                    required
                    autoComplete="name"
                    className={inputClass}
                  />
                </div>

                <div className="mb-[34px]">
                  <label className={labelClass} htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>

                <div className="mb-[34px]">
                  <label className={labelClass} htmlFor="location">City / Country</label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Monaco, France"
                    required
                    autoComplete="address-level2"
                    className={inputClass}
                  />
                </div>

                <div className="mb-[34px]">
                  <label className={labelClass} htmlFor="interest">
                    Select Your Interest{" "}
                    <span className="text-[8.5px] tracking-[0.1em] normal-case opacity-70 ml-1.5">
                      (optional)
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      id="interest"
                      value={interest}
                      onChange={e => setInterest(e.target.value)}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="">Choose a category</option>
                      <option value="ready-to-wear">Ready-to-Wear</option>
                      <option value="footwear">Footwear</option>
                      <option value="leather-goods">Leather Goods</option>
                    </select>
                    <span className="pointer-events-none absolute right-0.5 bottom-4 w-[7px] h-[7px] border-r border-b border-muted rotate-45 block" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full block bg-oak-d text-gold-lt border-none font-jost text-[10.5px] font-medium tracking-[0.32em] uppercase py-[19px] px-5 mt-4 cursor-pointer transition-all duration-300 hover:bg-espresso hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(44,31,15,0.24)] active:translate-y-0 disabled:opacity-60 disabled:cursor-default disabled:translate-y-0"
                >
                  {submitting ? "Submitting…" : "Request Invitation"}
                </button>
              </form>

              <p className="anim-rise-4 mt-9 text-center font-light text-[10.5px] leading-[1.9] tracking-[0.03em] text-muted">
                Applications are reviewed personally by our concierge team.<br />
                By submitting, you agree to be contacted regarding your allocation status.
              </p>
            </div>
          )}

          {/* ── CONFIRMATION VIEW ── */}
          {confirmed && (
            <div className="text-center" style={{ animation: "riseIn 0.8s cubic-bezier(0.23,1,0.32,1) forwards" }}>
              <div className="relative w-[74px] h-[74px] rounded-full border border-gold flex items-center justify-center mx-auto mb-[34px]">
                <span
                  className="absolute inset-[-8px] rounded-full border border-[rgba(201,167,82,0.25)] block"
                />
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]">
                  <path
                    d="M4 12.5L9.5 18 20 6"
                    fill="none"
                    stroke="#C9A752"
                    strokeWidth="1.4"
                    strokeDasharray="40"
                    strokeDashoffset="40"
                    style={{ animation: "drawCheck 0.7s ease-out 0.3s forwards" }}
                  />
                </svg>
              </div>

              <span className="block text-[9px] font-normal tracking-[0.5em] uppercase text-gold mb-[22px]">
                Application Received
              </span>

              <h2
                className="font-cormorant font-light text-oak-d leading-[1.15] mb-5"
                style={{ fontSize: "clamp(28px,4vw,38px)" }}
              >
                You&apos;ve Joined the<br />
                <em className="italic text-oak">Inner Circle</em>
              </h2>

              <p className="font-light text-[13px] leading-[1.9] text-muted max-w-[380px] mx-auto mb-8">
                Your request has been placed in the Season 2026 allocation queue. Our
                concierge team will review your application and notify you by email
                within 5 business days.
              </p>

              <div className="inline-block font-cormorant text-[15px] tracking-[0.12em] text-oak-d border-t border-b border-[rgba(201,167,82,0.3)] py-3 px-[26px] mb-[38px]">
                Application No. <span className="text-gold">{confirmId}</span>
              </div>

              <br />
              <Link
                href="/"
                className="inline-block text-[10px] font-normal tracking-[0.24em] uppercase text-oak-d border-b border-[rgba(201,167,82,0.4)] pb-1.5 hover:text-gold transition-colors duration-300 no-underline"
              >
                ← Return to LORLUM
              </Link>
            </div>
          )}

        </div>
      </main>

      {/* CSS animations */}
      <style>{`
        @keyframes fillQuota { to { width: 81%; } }
        @keyframes drawCheck { to { stroke-dashoffset: 0; } }
      `}</style>

      <StoreFooter />
    </div>
  );
}
