"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Phone, MessageCircle, Mail } from "lucide-react";

const COUNTRY_CODES = ["+66 Thailand", "+1 USA", "+44 UK", "+39 Italy", "+81 Japan", "+65 Singapore", "+60 Malaysia"];
const OBJECTS = ["General Enquiry", "Order Status", "Made-to-Order Fitting", "Returns & Care", "Press & Media", "Trade & Wholesale"];
const TOPICS  = ["Linen Collection", "Sizing & Fit", "Shipping & Delivery", "Private Appointment", "Other"];
const TITLES  = ["Mr.", "Mrs.", "Ms.", "Dr."];

interface ContactCfg { phone: string; phoneDisplay: string; whatsappLink: string; email: string; hours: string; }
const DEFAULT_CFG: ContactCfg = {
  phone: "+66960824578", phoneDisplay: "+66 96 082 4578",
  whatsappLink: "#", email: "support@lorlum.com",
  hours: "Monday to Friday, 4am–11am CET\nSaturday and Sunday, 5am–10am CET",
};

export function ContactSection() {
  const [cfg, setCfg] = useState<ContactCfg>(DEFAULT_CFG);

  useEffect(() => {
    fetch("/api/site-settings")
      .then(r => r.json())
      .then(d => { if (d.contact) setCfg({ ...DEFAULT_CFG, ...d.contact }); })
      .catch(() => {});
  }, []);

  const otherContacts = [
    { title: "Phone",        value: cfg.phoneDisplay || cfg.phone, href: `tel:${cfg.phone}`,         icon: Phone },
    { title: "Chat With Us", value: "WhatsApp",                   href: cfg.whatsappLink,            icon: MessageCircle },
    { title: "Email",        value: cfg.email,                    href: `mailto:${cfg.email}`,       icon: Mail },
  ];

  const [title,    setTitle]    = useState("");
  const [first,    setFirst]    = useState("");
  const [last,     setLast]     = useState("");
  const [email,    setEmail]    = useState("");
  const [code,     setCode]     = useState("+66 Thailand");
  const [phone,    setPhone]    = useState("");
  const [object,   setObject]   = useState("");
  const [topic,    setTopic]    = useState("");
  const [message,  setMessage]  = useState("");
  const [file,     setFile]     = useState<File | null>(null);
  const [fileName, setFileName] = useState("+ Select file");
  const [privacy,  setPrivacy]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [sending,  setSending]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileName(f ? f.name : "+ Select file");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      let attachmentUrl = "";
      let attachmentName = "";
      if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("productId", "contact");
        const up = await fetch("/api/upload", { method: "POST", body: form });
        if (up.ok) {
          const { url } = await up.json();
          attachmentUrl  = url ?? "";
          attachmentName = file.name;
        }
      }
      await fetch("/api/store/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, first, last, email, phone: `${code} ${phone}`, object, topic, message, attachmentUrl, attachmentName }),
      });
    } catch { /* fire-and-forget */ }
    setSending(false);
    setSent(true);
  }

  function reset() {
    setSent(false);
    setFirst(""); setLast(""); setEmail(""); setPhone(""); setMessage("");
    setTitle(""); setObject(""); setTopic(""); setPrivacy(false);
    setFile(null); setFileName("+ Select file");
  }

  const inputClass = "w-full bg-transparent border-b border-muted/30 py-2 pb-3 font-jost text-[13px] font-light text-ltext placeholder:text-muted/50 focus:outline-none focus:border-gold transition-colors duration-300";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;
  const labelClass  = "block text-[10.5px] font-normal tracking-[0.06em] text-oak-d mb-2.5";

  return (
    <section id="contact" className="border-t border-gold/[0.15] px-5 md:px-20 py-24 md:py-36" style={{ background: "#F1E9D8" }}>
      <div className="max-w-[1180px] mx-auto">

        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="block text-[9px] tracking-[0.6em] uppercase text-gold mb-4">We&apos;re Here to Help</span>
          <h2 className="font-cormorant font-light text-oak-d leading-[1.05]" style={{ fontSize: "clamp(34px,4vw,50px)" }}>
            Contact <em className="italic text-oak">Us</em>
          </h2>
          <div className="w-px h-10 mx-auto mt-8" style={{ background: "linear-gradient(180deg,#C9A752 0%,transparent 100%)" }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-16 lg:gap-24">

          {/* ── FORM ── */}
          <div>
            <div className="mb-9">
              <h3 className="font-cormorant font-normal text-[26px] text-oak-d mb-3">Contact Form</h3>
              <p className="font-light text-[12.5px] tracking-[0.02em] leading-[1.85] text-muted max-w-[460px]">
                Please fill in this form to send us a message. Our Client Advisors will respond within one to two business days.
              </p>
            </div>

            {sent ? (
              <div className="py-16 text-center border border-gold/20 bg-white/50">
                <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h4 className="font-cormorant font-normal text-[22px] text-oak-d mb-2">Message Sent</h4>
                <p className="text-[12px] font-light text-muted leading-relaxed">
                  Thank you for reaching out.<br />Our Client Advisors will respond within 1–2 business days.
                </p>
                <button onClick={reset} className="mt-8 text-[10px] tracking-[0.22em] uppercase text-oak-d border-b border-gold/40 pb-0.5 hover:text-gold transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
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
                    value={message} onChange={e => setMessage(e.target.value)}
                    maxLength={2000} placeholder="Write your message here"
                    required rows={4}
                    className={`${inputClass} resize-y min-h-[88px] leading-[1.7]`}
                  />
                  <span className="absolute right-0.5 -bottom-5 text-[9.5px] text-muted tracking-[0.04em]">{message.length} / 2,000</span>
                </div>

                {/* File */}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-between border border-muted/35 px-5 py-[18px] mb-8 hover:border-gold transition-colors duration-300 cursor-pointer">
                  <span className="text-[12px] font-medium text-oak-d">{fileName}</span>
                  <span className="text-[9.5px] text-muted tracking-[0.03em]">Max file size: 4 mb</span>
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />

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
                    I acknowledge that my data will be processed by LORLUM in accordance with the{" "}
                    <Link href="/privacy" className="text-oak underline underline-offset-2 hover:text-gold transition-colors">Privacy Policy</Link>.
                  </span>
                </label>

                {/* Submit */}
                <div className="max-w-[280px]">
                  <button type="submit" disabled={sending}
                    className="w-full bg-oak-d text-gold-lt text-[10.5px] font-medium tracking-[0.28em] uppercase py-[19px] px-10 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-espresso hover:shadow-[0_16px_40px_rgba(74,50,25,0.35)] disabled:opacity-60">
                    {sending ? "Sending…" : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── OTHER CONTACT ── */}
          <div>
            <h3 className="font-cormorant font-normal text-[26px] text-oak-d mb-6">Other Contact</h3>
            <p className="font-light text-[12px] leading-[1.85] text-muted mb-6 whitespace-pre-line">
              {cfg.hours}
            </p>

            <div className="space-y-3 mt-8">
              {otherContacts.map(({ title, value, href, icon: Icon }) => (
                <a key={title} href={href}
                  className="flex items-center justify-between border border-gold/20 bg-cream px-[22px] py-5 no-underline group transition-all duration-300 hover:border-gold hover:-translate-y-0.5">
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

        </div>
      </div>
    </section>
  );
}
