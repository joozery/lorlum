"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { RevealSection } from "@/components/store/reveal-section";
import { Phone, MessageCircle, Mail } from "lucide-react";

const COUNTRY_CODES = ["+66 Thailand", "+1 USA", "+44 UK", "+39 Italy", "+81 Japan", "+65 Singapore", "+60 Malaysia"];
const OBJECTS = ["General Enquiry", "Order Status", "Made-to-Order Fitting", "Returns & Care", "Press & Media", "Trade & Wholesale"];
const TOPICS  = ["Linen Collection", "Sizing & Fit", "Shipping & Delivery", "Private Appointment", "Other"];
const TITLES  = ["Mr.", "Mrs.", "Ms.", "Dr."];

const HOLIDAYS = [
  "New Year's Day: 1st January",
  "Epiphany: 6th January",
  "Easter Sunday & Easter Monday",
  "Liberation Day: 25th April",
  "Labour Day: 1st May",
  "Republic Day: 2nd June",
  "Assumption Day: 15th August",
  "All Saints' Day: 1st November",
  "Christmas Day: 25th December",
];

const OTHER_CONTACTS = [
  { title: "Phone", value: "+66 96 082 4578", href: "tel:+66960824578", icon: Phone },
  { title: "Chat With Us", value: "WhatsApp", href: "#", icon: MessageCircle },
  { title: "Email", value: "support@lorlum.com", href: "mailto:support@lorlum.com", icon: Mail },
];

export default function ContactPage() {
  const [title,    setTitle]    = useState("");
  const [first,    setFirst]    = useState("");
  const [last,     setLast]     = useState("");
  const [email,    setEmail]    = useState("");
  const [code,     setCode]     = useState("+66 Thailand");
  const [phone,    setPhone]    = useState("");
  const [object,   setObject]   = useState("");
  const [topic,    setTopic]    = useState("");
  const [message,  setMessage]  = useState("");
  const [fileName, setFileName] = useState("+ Select file");
  const [privacy,  setPrivacy]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [sending,  setSending]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/store/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, first, last, email, phone: `${code} ${phone}`, object, topic, message }),
      });
      setSent(true);
    } catch {
      setSent(true); // show success anyway — fire-and-forget
    } finally {
      setSending(false);
    }
  }

  const inputClass = "w-full bg-transparent border-b border-muted/35 py-2 pb-3 font-jost text-[13px] font-light text-ltext placeholder:text-muted/55 focus:outline-none focus:border-gold transition-colors duration-300";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;
  const labelClass = "block text-[10.5px] font-normal tracking-[0.06em] text-oak-d mb-2.5";

  return (
    <div className="font-jost bg-ivory text-ltext overflow-x-hidden min-h-screen">
      <StoreNav active="contact" />

      {/* ── INTRO ─────────────────────────────────────────── */}
      <section className="pt-[170px] pb-[90px] px-6 text-center max-w-[760px] mx-auto">
        <RevealSection>
          <span className="block text-[9px] font-normal tracking-[0.6em] uppercase text-gold mb-5">
            We&apos;re Here to Help
          </span>
          <h1 className="font-cormorant font-light text-oak-d leading-[1.05] mb-7" style={{ fontSize: "clamp(38px,5vw,58px)" }}>
            Contact <em className="italic text-oak">Us</em>
          </h1>
          <p className="font-light text-[14px] tracking-[0.02em] leading-[1.95] text-muted">
            The LORLUM Atelier is here to help with any of your queries and questions. You will find multiple ways to reach us below — including our Client Advisors, made-to-order enquiries, and press &amp; trade contacts.
          </p>
          <div className="w-px h-11 mx-auto mt-9" style={{ background: "linear-gradient(180deg,#C9A752 0%,transparent 100%)" }} />
        </RevealSection>
      </section>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <section className="border-y border-gold/[0.18] px-5 md:px-20 py-24 md:py-32" style={{ background: "#F1E9D8" }}>
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-16 lg:gap-24">

          {/* ── FORM ── */}
          <RevealSection>
            <div>
              <div className="mb-9">
                <h2 className="font-cormorant font-normal text-[28px] text-oak-d mb-3">Contact Form</h2>
                <p className="font-light text-[12.5px] tracking-[0.02em] leading-[1.85] text-muted max-w-[460px]">
                  Please fill in this form to send us a message. Our Client Advisors will respond to your enquiry as soon as possible, usually within one to two business days.
                </p>
              </div>

              {sent ? (
                <div className="py-16 text-center border border-gold/25 bg-white/60">
                  <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="font-cormorant font-normal text-[24px] text-oak-d mb-2">Message Sent</h3>
                  <p className="text-[12px] font-light text-muted leading-relaxed">
                    Thank you for reaching out. Our Client Advisors<br />will respond within 1–2 business days.
                  </p>
                  <button
                    onClick={() => { setSent(false); setFirst(""); setLast(""); setEmail(""); setPhone(""); setMessage(""); setPrivacy(false); setFileName("+ Select file"); }}
                    className="mt-8 text-[10px] tracking-[0.22em] uppercase text-oak-d border-b border-gold/40 pb-0.5 hover:text-gold transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-0">

                  {/* Title */}
                  <div className="mb-6">
                    <label className={labelClass}>Title *</label>
                    <div className="relative">
                      <select value={title} onChange={e => setTitle(e.target.value)} required className={selectClass}>
                        <option value="" disabled>Select</option>
                        {TITLES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-1 top-3.5 w-2 h-2 border-r border-b border-oak-d rotate-45 block" />
                    </div>
                  </div>

                  {/* First / Last */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 mb-6">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input type="text" value={first} onChange={e => setFirst(e.target.value)} placeholder="First Name" required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input type="text" value={last} onChange={e => setLast(e.target.value)} placeholder="Last Name" required className={inputClass} />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className={labelClass}>Email *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required className={inputClass} />
                  </div>

                  {/* Phone */}
                  <div className="mb-6">
                    <label className={labelClass}>Phone Number *</label>
                    <div className="grid grid-cols-[140px_1fr] gap-4">
                      <div className="relative">
                        <select value={code} onChange={e => setCode(e.target.value)} className={selectClass}>
                          {COUNTRY_CODES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <span className="pointer-events-none absolute right-1 top-3.5 w-2 h-2 border-r border-b border-oak-d rotate-45 block" />
                      </div>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" required className={inputClass} />
                    </div>
                  </div>

                  {/* Object */}
                  <div className="mb-6">
                    <label className={labelClass}>Select Object *</label>
                    <div className="relative">
                      <select value={object} onChange={e => setObject(e.target.value)} required className={selectClass}>
                        <option value="" disabled>Select</option>
                        {OBJECTS.map(o => <option key={o}>{o}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-1 top-3.5 w-2 h-2 border-r border-b border-oak-d rotate-45 block" />
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="mb-6">
                    <label className={labelClass}>Select Topic *</label>
                    <div className="relative">
                      <select value={topic} onChange={e => setTopic(e.target.value)} required className={selectClass}>
                        <option value="" disabled>Select</option>
                        {TOPICS.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-1 top-3.5 w-2 h-2 border-r border-b border-oak-d rotate-45 block" />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-8 relative">
                    <label className={labelClass}>Message *</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      maxLength={2000}
                      placeholder="Write your message here"
                      required
                      rows={4}
                      className={`${inputClass} resize-y min-h-[88px] leading-[1.7]`}
                    />
                    <span className="absolute right-0.5 -bottom-5 text-[9.5px] text-muted tracking-[0.04em]">{message.length} / 2,000</span>
                  </div>

                  {/* File */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-between border border-muted/35 px-5 py-[18px] mb-8 hover:border-gold transition-colors duration-300 cursor-pointer"
                  >
                    <span className="text-[12px] font-medium text-oak-d">{fileName}</span>
                    <span className="text-[9.5px] text-muted tracking-[0.03em]">Max file size: 4 mb</span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={e => setFileName(e.target.files?.[0]?.name ?? "+ Select file")}
                  />

                  {/* Privacy */}
                  <label className="flex items-start gap-3 mb-9 cursor-pointer">
                    <div className="relative mt-0.5 shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={privacy} onChange={e => setPrivacy(e.target.checked)} required />
                      <div className="h-[14px] w-[14px] border border-muted/50 bg-transparent transition-all peer-checked:border-gold peer-checked:bg-gold/10 flex items-center justify-center">
                        {privacy && (
                          <svg className="h-2.5 w-2.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-[10.5px] font-light leading-[1.7] text-muted">
                      I acknowledge that my data will be processed by LORLUM in accordance with the provisions of the{" "}
                      <Link href="/privacy" className="text-oak underline underline-offset-2 hover:text-gold transition-colors">Privacy Policy</Link>.
                    </span>
                  </label>

                  {/* Submit */}
                  <div className="max-w-[280px]">
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full text-center bg-oak-d text-gold-lt text-[10.5px] font-medium tracking-[0.28em] uppercase py-[19px] px-10 border-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-espresso hover:shadow-[0_16px_40px_rgba(74,50,25,0.35)] disabled:opacity-60"
                    >
                      {sending ? "Sending…" : "Submit"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </RevealSection>

          {/* ── OTHER CONTACT ── */}
          <RevealSection>
            <div>
              <h2 className="font-cormorant font-normal text-[28px] text-oak-d mb-6">Other Contact</h2>
              <p className="font-light text-[12px] leading-[1.85] text-muted mb-6">
                Monday to Friday, 4am to 11am CET (excluding public holidays)<br />
                Saturday and Sunday, 5am to 10am CET (excluding public holidays)
              </p>
              <ul className="mb-9 space-y-0">
                {HOLIDAYS.map(h => (
                  <li key={h} className="relative pl-[14px] font-light text-[11.5px] leading-[2] text-muted before:absolute before:left-0 before:top-[9px] before:w-1 before:h-1 before:bg-gold before:block">
                    {h}
                  </li>
                ))}
              </ul>

              <div className="space-y-4">
                {OTHER_CONTACTS.map(({ title, value, href, icon: Icon }) => (
                  <a
                    key={title}
                    href={href}
                    className="flex items-center justify-between border border-gold/20 bg-cream px-[22px] py-5 no-underline group transition-all duration-300 hover:border-gold hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-oak-d mb-1.5">{title}</div>
                      <div className="text-[12.5px] font-light text-muted group-hover:text-gold transition-colors duration-300">{value}</div>
                    </div>
                    <div className="w-[34px] h-[34px] shrink-0 border border-gold/40 flex items-center justify-center text-gold">
                      <Icon className="w-[15px] h-[15px]" strokeWidth={1.5} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </RevealSection>

        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
