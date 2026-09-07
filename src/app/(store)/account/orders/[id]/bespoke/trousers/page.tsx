"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const RI = (delay: number): React.CSSProperties => ({
  opacity: 0,
  animation: `rise-in 0.9s cubic-bezier(0.23,1,0.32,1) ${delay}s forwards`,
});

const FIELDS = [
  { key: "waist",   label: "Waist",                   placeholder: "e.g. 82" },
  { key: "hip",     label: "Hip",                     placeholder: "e.g. 98" },
  { key: "rise",    label: "Rise / Crotch Depth",     placeholder: "e.g. 27" },
  { key: "thigh",   label: "Thigh",                   placeholder: "e.g. 58" },
  { key: "outseam", label: "Outseam / Inseam Length", placeholder: "e.g. 104" },
  { key: "hem",     label: "Hem / Leg Opening",       placeholder: "e.g. 18" },
] as const;

type FK = "waist" | "hip" | "rise" | "thigh" | "outseam" | "hem";
type FS = Record<FK, string> & { note: string };

export default function BespokeTrousersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [orderNumber, setOrderNumber] = useState("");
  const [hasShirt,    setHasShirt]    = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState("");
  const [visible,     setVisible]     = useState(false);

  const [form, setForm] = useState<FS>({ waist: "", hip: "", rise: "", thigh: "", outseam: "", hem: "", note: "" });

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/store/orders/${id}/bespoke`)
      .then(r => { if (r.status === 401) { router.push("/account"); return null; } return r.json(); })
      .then(d => {
        if (!d) return;
        if (!d.hasBespoke) { router.push("/account/orders"); return; }
        setOrderNumber(d.orderNumber ?? "");
        const types: string[] = (d.bespokeItems ?? []).map((i: { garmentType: string }) => i.garmentType);
        setHasShirt(types.includes("shirt"));
        const trousers = (d.bespokeItems ?? []).find((i: { garmentType: string }) => i.garmentType === "trousers");
        if (trousers?.measurements) {
          const m = trousers.measurements;
          setForm({ waist: String(m.waist ?? ""), hip: String(m.hip ?? ""), rise: String(m.rise ?? ""), thigh: String(m.thigh ?? ""), outseam: String(m.outseam ?? ""), hem: String(m.hem ?? ""), note: String(m.note ?? "") });
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { waist, hip, rise, thigh, outseam, hem } = form;
    if (!waist || !hip || !rise || !thigh || !outseam || !hem) { setError("Please fill in all measurements."); return; }
    setSaving(true);
    const res = await fetch(`/api/store/orders/${id}/bespoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garmentType: "trousers", waist: Number(waist), hip: Number(hip), rise: Number(rise), thigh: Number(thigh), outseam: Number(outseam), hem: Number(hem), note: form.note }),
    });
    const data = await res.json();
    setSaving(false);
    if (!data.ok) { setError(data.error ?? "An error occurred."); return; }
    setSaved(true);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F7F2E8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Jost, sans-serif" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "#C9A752" }}>Loading…</p>
    </div>
  );

  return (
    <div style={{
      fontFamily: "Jost, sans-serif",
      background: "#F7F2E8",
      color: "#3A2C1A",
      minHeight: "100vh",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.6s cubic-bezier(0.23,1,0.32,1)",
    }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        height: 68, padding: "0 52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(247,242,232,0.96)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(201,167,82,0.12)",
      }}>
        <ul style={{ display: "flex", gap: 36, listStyle: "none", padding: 0, margin: 0 }} className="bespoke-nav-links">
          <li><Link href="/" style={{ fontWeight: 300, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8C7355", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#C9A752")} onMouseLeave={e => (e.currentTarget.style.color = "#8C7355")}>Maison</Link></li>
          {hasShirt && <li><Link href={`/account/orders/${id}/bespoke/shirt`} style={{ fontWeight: 300, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8C7355", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#C9A752")} onMouseLeave={e => (e.currentTarget.style.color = "#8C7355")}>Shirt</Link></li>}
        </ul>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 30, letterSpacing: "0.06em", color: "#4A3219", textDecoration: "none", lineHeight: 1 }}>
          LORLUM
        </Link>
        <ul style={{ display: "flex", gap: 36, listStyle: "none", padding: 0, margin: 0 }} className="bespoke-nav-links">
          <li><Link href="/account/orders" style={{ fontWeight: 300, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8C7355", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#C9A752")} onMouseLeave={e => (e.currentTarget.style.color = "#8C7355")}>My Orders</Link></li>
          <li><Link href="/account" style={{ fontWeight: 300, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8C7355", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#C9A752")} onMouseLeave={e => (e.currentTarget.style.color = "#8C7355")}>Account</Link></li>
        </ul>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "180px 40px 120px" }}>
        <div style={{ width: "100%", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>

          {/* ── CONFIRMATION ── */}
          {saved ? (
            <div style={{ animation: "rise-in 0.8s cubic-bezier(0.23,1,0.32,1) forwards" }}>
              <div style={{ width: 74, height: 74, borderRadius: "50%", border: "1px solid #C9A752", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 34px", position: "relative" }}>
                <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid rgba(201,167,82,0.25)", pointerEvents: "none" }} />
                <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                  <path d="M4 12.5L9.5 18 20 6" style={{ fill: "none", stroke: "#C9A752", strokeWidth: 1.4, strokeDasharray: 40, strokeDashoffset: 40, animation: "draw-check 0.7s ease-out 0.3s forwards" }} />
                </svg>
              </div>
              <p style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.5em", textTransform: "uppercase", color: "#C9A752", marginBottom: 22 }}>Measurements Received</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(28px,4vw,38px)", color: "#4A3219", lineHeight: 1.15, marginBottom: 20 }}>
                Your Trousers Are Now<br /><em style={{ fontStyle: "italic", color: "#6B4E2A", fontWeight: 400 }}>In the Making</em>
              </h2>
              <p style={{ fontWeight: 300, fontSize: 13, lineHeight: 1.9, color: "#8C7355", maxWidth: 400, margin: "0 auto 32px" }}>
                Your measurements have been sent to our atelier. Our tailoring team will reach out within 3 business days to confirm fit before your trousers go into production.
              </p>
              <div style={{ display: "inline-block", fontFamily: "'Cormorant Garamond', serif", fontSize: 15, letterSpacing: "0.12em", color: "#4A3219", borderTop: "1px solid rgba(201,167,82,0.3)", borderBottom: "1px solid rgba(201,167,82,0.3)", padding: "12px 26px", marginBottom: 38 }}>
                Reference No. <span style={{ color: "#C9A752" }}>{orderNumber}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
                {hasShirt && (
                  <Link href={`/account/orders/${id}/bespoke/shirt`} style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", color: "#C9A752", textDecoration: "none", borderBottom: "1px solid #C9A752", paddingBottom: 6 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                    Add Shirt Measurements →
                  </Link>
                )}
                <Link href="/account/orders" style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", color: "#4A3219", textDecoration: "none", borderBottom: "1px solid rgba(201,167,82,0.4)", paddingBottom: 6 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#C9A752")} onMouseLeave={e => (e.currentTarget.style.color = "#4A3219")}>
                  ← Return to Orders
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── EYEBROW ── */}
              <span style={{ ...RI(0.1), display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 9, fontWeight: 400, letterSpacing: "0.55em", textTransform: "uppercase", color: "#C9A752", marginBottom: 30 }}>
                <span style={{ width: 20, height: 1, background: "#C9A752", display: "block" }} />
                Bespoke Order Confirmed
                <span style={{ width: 20, height: 1, background: "#C9A752", display: "block" }} />
              </span>

              <h1 style={{ ...RI(0.25), fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(34px,4.8vw,52px)", lineHeight: 1.08, color: "#4A3219", letterSpacing: "0.01em", textTransform: "uppercase", marginBottom: 22 }}>
                Your Perfect<br /><em style={{ fontStyle: "italic", color: "#6B4E2A", fontWeight: 400, textTransform: "none" }}>Fit</em>
              </h1>

              <p style={{ ...RI(0.4), fontWeight: 300, fontSize: 13.5, lineHeight: 1.95, letterSpacing: "0.02em", color: "#8C7355", maxWidth: 420, margin: "0 auto 34px" }}>
                Thank you for your order. Before our atelier begins cutting your trousers, please provide your measurements below so they can be tailored precisely to you.
              </p>

              <div style={{ ...RI(0.5), display: "inline-block", fontFamily: "'Cormorant Garamond', serif", fontSize: 13.5, letterSpacing: "0.1em", color: "#4A3219", borderTop: "1px solid rgba(201,167,82,0.3)", borderBottom: "1px solid rgba(201,167,82,0.3)", padding: "10px 24px", marginBottom: 44 }}>
                Order No. <span style={{ color: "#C9A752" }}>{orderNumber}</span> · Bespoke Trousers
              </div>

              {/* ── GUIDE ── */}
              <div style={{ ...RI(0.58), textAlign: "left", border: "1px solid rgba(201,167,82,0.25)", background: "#FAF7F0", padding: "22px 26px", marginBottom: 48 }}>
                <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", color: "#C9A752", marginBottom: 10, display: "block" }}>Measuring Guide</span>
                <p style={{ fontSize: 12, fontWeight: 300, lineHeight: 1.85, color: "#8C7355" }}>
                  For the most accurate result, measure over light clothing with a soft tape measure, standing naturally. All measurements should be entered in centimetres (cm). If you&rsquo;re unsure of a figure, your concierge tailor is happy to confirm it with you before cutting begins.
                </p>
              </div>

              {/* ── FORM ── */}
              <form style={{ ...RI(0.66), textAlign: "left" }} onSubmit={handleSubmit} noValidate>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }} className="bespoke-field-grid">
                  {FIELDS.map(f => (
                    <div key={f.key} style={{ position: "relative", marginBottom: 34 }}>
                      <label style={{ display: "block", fontSize: 9, fontWeight: 400, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8C7355", marginBottom: 12 }}>
                        {f.label}
                      </label>
                      <BespokeInput
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={v => setForm(p => ({ ...p, [f.key]: v }))}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 34 }}>
                  <label style={{ display: "block", fontSize: 9, fontWeight: 400, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8C7355", marginBottom: 12 }}>
                    Additional Notes <span style={{ fontSize: 8.5, letterSpacing: "0.08em", color: "#8C7355", opacity: 0.7, textTransform: "none", marginLeft: 6 }}>(optional)</span>
                  </label>
                  <textarea
                    value={form.note}
                    onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="e.g. I prefer a slightly relaxed fit through the thigh."
                    style={{ width: "100%", resize: "vertical", minHeight: 96, fontFamily: "Jost, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.8, letterSpacing: "0.01em", color: "#3A2C1A", background: "transparent", border: "1px solid rgba(201,167,82,0.3)", padding: "14px 16px", outline: "none", transition: "border-color 0.35s" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#C9A752")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(201,167,82,0.3)")}
                  />
                </div>

                {error && <p style={{ fontSize: 11, color: "#ef4444", marginBottom: 16 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={saving}
                  style={{ width: "100%", display: "block", background: saving ? "#6B4E2A" : "#4A3219", color: "#E8D5A3", border: "none", fontFamily: "Jost, sans-serif", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", padding: "19px 20px", marginTop: 16, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s, background 0.35s" }}
                  onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = "#2C1F0F"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(44,31,15,0.24)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#4A3219"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {saving ? "Submitting…" : "Submit My Measurements"}
                </button>
              </form>

              <p style={{ ...RI(0.8), marginTop: 32, textAlign: "center", fontSize: 10.5, fontWeight: 300, lineHeight: 1.9, letterSpacing: "0.03em", color: "#8C7355" }}>
                Your measurements are reviewed personally by our tailoring team.<br />
                A member of our atelier may contact you to confirm details before cutting begins.
              </p>
            </>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#2C1F0F", padding: "48px 80px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(201,167,82,0.12)", flexWrap: "wrap", gap: 20 }} className="bespoke-footer">
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 22, letterSpacing: "0.06em", color: "#E8D5A3" }}>LORLUM</span>
        <span style={{ fontSize: 9.5, fontWeight: 300, letterSpacing: "0.14em", color: "#8C7355" }}>© {new Date().getFullYear()} LORLUM. All rights reserved.</span>
      </footer>

      <style>{`
        @media(max-width:640px){
          .bespoke-nav-links { display: none !important; }
          .bespoke-field-grid { grid-template-columns: 1fr !important; }
          .bespoke-footer { padding: 36px 24px !important; flex-direction: column !important; text-align: center !important; }
        }
      `}</style>
    </div>
  );
}

function BespokeInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, borderBottom: `1px solid ${focused ? "#C9A752" : "rgba(201,167,82,0.3)"}`, transition: "border-color 0.35s" }}>
      <input
        type="number"
        min={0}
        step={0.5}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        inputMode="decimal"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex: 1, minWidth: 0, fontFamily: "Jost, sans-serif", fontSize: 14.5, fontWeight: 300, letterSpacing: "0.01em", color: "#3A2C1A", background: "transparent", border: "none", padding: "0 0 12px", appearance: "none", outline: "none" }}
      />
      <span style={{ fontSize: 10.5, letterSpacing: "0.06em", color: "#8C7355", paddingBottom: 13, whiteSpace: "nowrap" }}>cm</span>
    </div>
  );
}
