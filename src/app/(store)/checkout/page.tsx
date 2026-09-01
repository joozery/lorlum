"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/context/cart";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const STEPS = ["Contact", "Delivery", "Payment"];

const inputCls = "w-full h-[52px] border-none border-b border-gold/30 bg-transparent font-jost text-[14px] font-light text-ltext tracking-[0.04em] outline-none px-1 transition-colors duration-300 focus:border-gold/60";
const labelCls = "block text-[8.5px] tracking-[0.28em] uppercase text-muted font-light mb-2";

interface ContactInfo {
  firstName: string; lastName: string; email: string; phone: string; note: string;
}
interface ShippingInfo {
  line1: string; line2: string; city: string; province: string; zip: string;
}

// ── Stripe payment form (rendered inside <Elements>) ──────────────────────
function StripePayForm({
  clientSecret, orderId, orderNumber, onSuccess, onError,
}: {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  onSuccess: (num: string) => void;
  onError: (msg: string) => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}&orderNumber=${orderNumber}`,
      },
      redirect: "if_required",
    });
    if (error) {
      onError(error.message ?? "การชำระเงินล้มเหลว");
      setPaying(false);
      return;
    }
    // Confirm order on server without waiting for webhook
    if (paymentIntent?.id) {
      await fetch("/api/store/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentIntentId: paymentIntent.id }),
      });
    }
    onSuccess(orderNumber);
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-cream border border-gold/[0.15]">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      <button
        onClick={handlePay}
        disabled={paying || !stripe}
        className="w-full flex items-center justify-center gap-3 bg-gold text-espresso text-[9.5px] font-medium tracking-[0.28em] uppercase px-9 py-[17px] border-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5 font-jost disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {paying ? "Processing…" : "Pay & Confirm Order →"}
      </button>
    </div>
  );
}

// ── Main checkout page ────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep]         = useState(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderId, setOrderId]   = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");

  const [contact, setContact] = useState<ContactInfo>({
    firstName: "", lastName: "", email: "", phone: "", note: "",
  });
  const [shipping, setShipping] = useState<ShippingInfo>({
    line1: "", line2: "", city: "", province: "", zip: "",
  });

  const fmt = (n: number) => "฿" + n.toLocaleString("th-TH");

  // Pre-fill from account if logged in
  useEffect(() => {
    fetch("/api/store/account")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        setContact((c) => ({
          ...c,
          firstName: d.firstName || d.name?.split(" ")[0] || "",
          lastName:  d.lastName  || d.name?.split(" ").slice(1).join(" ") || "",
          email:     d.email     || "",
          phone:     d.phone     || "",
        }));
        const a = d.addresses?.[0];
        if (a) setShipping({ line1: a.line1 ?? "", line2: a.line2 ?? "", city: a.city ?? "", province: a.province ?? "", zip: a.zip ?? "" });
      })
      .catch(() => {});
  }, []);

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  // Step 2 → 3: create order + payment intent
  const proceedToPayment = async () => {
    setSubmitting(true);
    setError("");
    try {
      // 1. Create order
      const orderRes = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact,
          shipping,
          items: items.length ? items.map((i) => ({
            productId:   i.productId,
            productName: i.productName,
            imageUrl:    i.imageUrl,
            color:       i.color,
            size:        i.size,
            price:       i.price,
            qty:         i.qty,
          })) : [{ productId: "000000000000000000000000", productName: "LORLUM Item", price: subtotal || 0, qty: 1 }],
          note: contact.note,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Failed to create order");

      setOrderNumber(orderData.orderNumber);
      setOrderId(orderData.orderId);

      // 2. Create payment intent
      const piRes = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });
      const piData = await piRes.json();
      if (!piRes.ok) throw new Error(piData.error ?? "Failed to create payment");

      setClientSecret(piData.clientSecret);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccess = (num: string) => {
    clearCart();
    setOrderNumber(num);
    setStep(4); // success state
  };

  // ── Success screen ────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center font-jost px-5">
        <div className="text-center p-10 md:p-16 max-w-[480px]">
          <div className="w-[72px] h-[72px] rounded-full bg-gold/[0.12] border border-gold/30 flex items-center justify-center mx-auto mb-7 text-[28px] text-gold">✓</div>
          <h2 className="font-cormorant font-normal text-[34px] text-oak-d mb-3 tracking-[0.04em]">Order Confirmed</h2>
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold mb-4">{orderNumber}</p>
          <p className="text-[13px] font-light text-muted leading-[1.8] mb-9">
            Thank you for your trust. Your LORLUM piece is being carefully prepared and will be dispatched within 1–2 working days.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/account/orders" className="inline-block bg-espresso text-gold-lt text-[9.5px] font-medium tracking-[0.28em] uppercase px-8 py-[17px] no-underline">
              ดูออเดอร์
            </Link>
            <Link href="/" className="inline-block border border-gold/30 text-espresso text-[9.5px] font-medium tracking-[0.28em] uppercase px-8 py-[17px] no-underline">
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-jost bg-ivory text-ltext min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[999] h-16 px-5 md:px-[52px] flex items-center justify-between bg-ivory/[0.97] backdrop-blur-[18px] border-b border-gold/[0.12]">
        <Link href="/cart" className="text-[9.5px] tracking-[0.18em] uppercase text-muted no-underline flex items-center gap-2">← Back to Bag</Link>
        <Link href="/" className="font-cormorant font-normal text-[22px] md:text-[26px] tracking-[0.06em] text-oak-d no-underline text-center leading-none">
          LORLUM
          <small className="block font-jost text-[6.5px] tracking-[0.55em] text-gold mt-0.5 font-light uppercase">Luxury Shore Footwear</small>
        </Link>
        <div className="flex items-center gap-1.5 text-[9px] tracking-[0.18em] uppercase text-muted">
          <span className="text-sm">🔒</span> Secure Checkout
        </div>
      </nav>

      {/* Progress */}
      <div className="fixed top-16 left-0 right-0 h-[3px] bg-gold/[0.15] z-[998]">
        <div className="h-full bg-gradient-to-r from-gold to-gold-lt transition-all duration-[600ms]" style={{ width:`${progress}%` }} />
      </div>

      <div className="pt-[67px] min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_420px] items-start">

        {/* FORM SIDE */}
        <div className="px-5 md:px-16 py-12 md:py-14 max-w-[640px] mx-auto w-full">

          {/* Step tracker */}
          <div className="flex items-center mb-12">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const isDone   = n < step;
              const isActive = n === step;
              return (
                <div key={s} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5 cursor-pointer"
                    onClick={() => { if (n < step && step < 3) setStep(n); }}>
                    <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-normal transition-all ${
                      isDone ? "bg-espresso text-gold-lt text-sm" : isActive ? "bg-gold text-espresso" : "bg-transparent border border-gold/30 text-muted"
                    }`}>
                      {isDone ? "✓" : n}
                    </div>
                    <span className={`text-[9px] tracking-[0.2em] uppercase whitespace-nowrap ${isActive ? "text-oak-d font-normal" : "text-muted font-light"}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-16 md:w-20 h-px mx-3 mb-5 transition-all ${n < step ? "bg-gold" : "bg-gold/20"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* STEP 1 — CONTACT */}
          {step === 1 && (
            <div>
              <span className="block text-[9px] tracking-[0.4em] uppercase text-gold mb-2.5">Step 1 of 3</span>
              <h1 className="font-cormorant font-light text-oak-d mb-2" style={{ fontSize:"clamp(28px,4vw,42px)" }}>Contact Information</h1>
              <p className="text-[12px] font-light text-muted mb-9 leading-[1.7]">Your details for order confirmation &amp; updates</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div><label className={labelCls}>First Name</label>
                  <input className={inputCls} type="text" placeholder="Given name"
                    value={contact.firstName} onChange={e => setContact(c => ({ ...c, firstName: e.target.value }))} /></div>
                <div><label className={labelCls}>Last Name</label>
                  <input className={inputCls} type="text" placeholder="Family name"
                    value={contact.lastName} onChange={e => setContact(c => ({ ...c, lastName: e.target.value }))} /></div>
              </div>
              <div className="mb-6"><label className={labelCls}>Email Address</label>
                <input className={inputCls} type="email" placeholder="your@email.com"
                  value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} /></div>
              <div className="mb-6"><label className={labelCls}>Phone Number</label>
                <div className="flex border-b border-gold/30">
                  <span className="h-[52px] px-3 flex items-center text-[13px] font-light text-muted border-r border-gold/20 mr-3 whitespace-nowrap">+66</span>
                  <input className="flex-1 h-[52px] border-none bg-transparent font-jost text-[14px] font-light text-ltext outline-none px-1" type="tel" placeholder="81 234 5678"
                    value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} />
                </div>
              </div>
              <div className="h-px bg-gold/[0.12] my-2 mb-6" />
              <div><label className={labelCls}>Order Notes <em className="text-[9px] not-italic text-muted/50">(optional)</em></label>
                <input className={inputCls} type="text" placeholder="Gift message, special instructions…"
                  value={contact.note} onChange={e => setContact(c => ({ ...c, note: e.target.value }))} /></div>
            </div>
          )}

          {/* STEP 2 — DELIVERY */}
          {step === 2 && (
            <div>
              <span className="block text-[9px] tracking-[0.4em] uppercase text-gold mb-2.5">Step 2 of 3</span>
              <h1 className="font-cormorant font-light text-oak-d mb-2" style={{ fontSize:"clamp(28px,4vw,42px)" }}>ที่อยู่จัดส่ง</h1>
              <p className="text-[12px] font-light text-muted mb-9 leading-[1.7]">จัดส่ง EMS ฟรีทั่วประเทศไทย พร้อมประกันการจัดส่ง</p>

              {/* Recipient */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={labelCls}>ชื่อผู้รับ</label>
                  <input className={inputCls} type="text" placeholder="ชื่อ-นามสกุล"
                    value={[contact.firstName, contact.lastName].filter(Boolean).join(" ")}
                    onChange={e => {
                      const parts = e.target.value.split(" ");
                      setContact(c => ({ ...c, firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") }));
                    }} />
                </div>
                <div>
                  <label className={labelCls}>เบอร์โทรผู้รับ</label>
                  <input className={inputCls} type="tel" placeholder="08X-XXX-XXXX"
                    value={contact.phone}
                    onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} />
                </div>
              </div>

              <div className="h-px bg-gold/[0.1] mb-6" />

              {/* Address */}
              <div className="mb-6">
                <label className={labelCls}>ที่อยู่ (บ้านเลขที่ / ซอย / ถนน)</label>
                <input className={inputCls} type="text" placeholder="เช่น 123 ซอยสุขุมวิท 11"
                  value={shipping.line1} onChange={e => setShipping(s => ({ ...s, line1: e.target.value }))} />
              </div>
              <div className="mb-6">
                <label className={labelCls}>อาคาร / ชั้น / ห้อง <em className="not-italic text-muted/50">(ถ้ามี)</em></label>
                <input className={inputCls} type="text" placeholder="เช่น ชั้น 5 ห้อง 502"
                  value={shipping.line2} onChange={e => setShipping(s => ({ ...s, line2: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={labelCls}>จังหวัด</label>
                  <input className={inputCls} type="text" placeholder="เช่น กรุงเทพมหานคร"
                    value={shipping.province} onChange={e => setShipping(s => ({ ...s, province: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>เขต / อำเภอ</label>
                  <input className={inputCls} type="text" placeholder="เช่น วัฒนา"
                    value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>รหัสไปรษณีย์</label>
                  <input className={inputCls} type="text" placeholder="10110" maxLength={5}
                    value={shipping.zip} onChange={e => setShipping(s => ({ ...s, zip: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>ประเทศ</label>
                  <input className={`${inputCls} text-muted cursor-not-allowed`} type="text" value="ประเทศไทย" readOnly />
                </div>
              </div>

              {error && <p className="text-red-500 text-[11px] mt-5">{error}</p>}
            </div>
          )}

          {/* STEP 3 — PAYMENT (Stripe Elements) */}
          {step === 3 && clientSecret && (
            <div>
              <span className="block text-[9px] tracking-[0.4em] uppercase text-gold mb-2.5">Step 3 of 3</span>
              <h1 className="font-cormorant font-light text-oak-d mb-2" style={{ fontSize:"clamp(28px,4vw,42px)" }}>Payment</h1>
              <p className="text-[12px] font-light text-muted mb-9 leading-[1.7]">All transactions are secured and encrypted by Stripe</p>

              {/* Shipping summary */}
              {(shipping.line1 || shipping.city || shipping.province) && (
                <div className="mb-6 p-4 bg-cream border border-gold/[0.15] text-[11px] text-muted leading-[1.9]">
                  <p className="text-[8.5px] tracking-[0.25em] uppercase text-gold mb-2">ที่อยู่จัดส่ง</p>
                  <p className="text-espresso font-normal">{[contact.firstName, contact.lastName].filter(Boolean).join(" ")}</p>
                  {contact.phone && <p>{contact.phone}</p>}
                  <p>{[shipping.line1, shipping.line2].filter(Boolean).join(" ")}</p>
                  <p>{[shipping.city && `เขต${shipping.city}`, shipping.province, shipping.zip].filter(Boolean).join(" ")}</p>
                  <p>ประเทศไทย</p>
                </div>
              )}

              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "flat", variables: { colorPrimary: "#C9A752", fontFamily: "Jost, sans-serif" } } }}>
                <StripePayForm
                  clientSecret={clientSecret}
                  orderId={orderId}
                  orderNumber={orderNumber}
                  onSuccess={handleSuccess}
                  onError={(msg) => setError(msg)}
                />
              </Elements>
              {error && <p className="text-red-500 text-[11px] mt-4">{error}</p>}
            </div>
          )}

          {/* Navigation (Steps 1-2 only) */}
          {step < 3 && (
            <div className="flex justify-between items-center mt-11">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="flex items-center gap-2.5 text-[9.5px] tracking-[0.22em] uppercase text-muted bg-transparent border-none cursor-pointer font-jost">
                  ← Back
                </button>
              ) : (
                <Link href="/cart" className="flex items-center gap-2.5 text-[9.5px] tracking-[0.22em] uppercase text-muted no-underline">
                  ← Back to Bag
                </Link>
              )}
              <button
                onClick={step === 1 ? () => setStep(2) : proceedToPayment}
                disabled={submitting}
                className="flex items-center gap-3.5 bg-gold text-espresso text-[9.5px] font-medium tracking-[0.28em] uppercase px-9 py-[17px] border-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5 font-jost disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {step === 1 ? "Continue →" : submitting ? "Processing…" : "Continue to Payment →"}
              </button>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="lg:sticky lg:top-[67px] px-5 md:px-12 pb-12 md:py-14">
          <div className="bg-cream border border-gold/[0.18] p-7 md:p-8">
            <h3 className="font-cormorant font-normal text-[20px] text-oak-d mb-5 tracking-[0.03em]">Your Order</h3>

            {/* Items */}
            {items.length > 0 ? (
              <div className="space-y-3 mb-5 border-b border-gold/[0.12] pb-5">
                {items.map((item) => (
                  <div key={`${item.productId}::${item.color}::${item.size}`} className="flex gap-3">
                    <div className="w-14 h-[66px] flex-shrink-0 border border-gold/[0.15] overflow-hidden relative bg-gold/[0.06]">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-cormorant text-[20px] text-gold/30">L</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cormorant text-[13px] text-oak-d leading-tight mb-0.5">{item.productName}</p>
                      <p className="text-[9px] text-muted">
                        {[item.color, item.size ? `EU ${item.size}` : "", `×${item.qty}`].filter(Boolean).join(" · ")}
                      </p>
                      <p className="text-[11px] text-gold mt-0.5">฿{(item.price * item.qty).toLocaleString("th-TH")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Shipping address summary (shows once filled) */}
            {(shipping.line1 || shipping.city || shipping.province) && (
              <div className="mb-5 p-3 bg-gold/[0.05] border border-gold/[0.15] text-[11px] text-muted leading-[1.8]">
                <p className="text-[8px] tracking-[0.28em] uppercase text-gold mb-1.5">ที่อยู่จัดส่ง</p>
                {(contact.firstName || contact.lastName) && (
                  <p className="text-espresso font-normal">{[contact.firstName, contact.lastName].filter(Boolean).join(" ")}</p>
                )}
                {contact.phone && <p>{contact.phone}</p>}
                {shipping.line1 && <p>{shipping.line1}{shipping.line2 ? ` ${shipping.line2}` : ""}</p>}
                <p>{[shipping.city, shipping.province, shipping.zip].filter(Boolean).join(", ")}</p>
                <p>Thailand</p>
              </div>
            )}

            <div className="border-t border-gold/[0.12] pt-4 space-y-3">
              {[["Subtotal", fmt(subtotal || 0)], ["Shipping", "Complimentary"]].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-[9.5px] tracking-[0.14em] uppercase text-muted font-light">{l}</span>
                  <span className={`text-[12px] font-light ${l === "Shipping" ? "text-gold" : "text-ltext"}`}>{v}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gold/20 pt-4 mt-3 flex justify-between items-baseline">
              <span className="text-[9.5px] tracking-[0.22em] uppercase text-oak-d font-normal">Total</span>
              <span className="font-cormorant font-semibold text-[24px] text-gold">{fmt(subtotal || 0)}</span>
            </div>
            <p className="text-[10px] font-light text-muted mt-4 leading-[1.7] text-center">🔒 Secured by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
