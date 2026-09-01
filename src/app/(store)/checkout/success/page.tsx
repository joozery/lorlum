"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/context/cart";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type State = "loading" | "success" | "pending" | "failed";

function CheckoutSuccessContent() {
  const params         = useSearchParams();
  const { clearCart }  = useCart();
  const [state,        setState]       = useState<State>("loading");
  const [orderNumber,  setOrderNumber] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const orderId         = params.get("orderId")                      ?? "";
    const orderNum        = params.get("orderNumber")                   ?? "";
    const paymentIntentId = params.get("payment_intent")               ?? "";
    const clientSecret    = params.get("payment_intent_client_secret") ?? "";

    setOrderNumber(orderNum);

    if (!orderId || !paymentIntentId) { setState("failed"); return; }

    stripePromise.then(async (stripe) => {
      if (!stripe) { setState("failed"); return; }

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

      if (paymentIntent?.status === "succeeded") {
        await fetch("/api/store/orders/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, paymentIntentId }),
        });
        clearCart();
        setState("success");
      } else if (paymentIntent?.status === "processing") {
        setState("pending");
      } else {
        setState("failed");
      }
    }).catch(() => setState("failed"));
  }, [params, clearCart]);

  if (state === "loading") return (
    <div className="min-h-screen bg-ivory flex items-center justify-center font-jost">
      <p className="text-[11px] tracking-[0.3em] uppercase text-muted animate-pulse">กำลังตรวจสอบการชำระเงิน…</p>
    </div>
  );

  if (state === "pending") return (
    <div className="min-h-screen bg-ivory flex items-center justify-center font-jost px-5">
      <div className="text-center max-w-[420px]">
        <div className="w-[72px] h-[72px] rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-7 text-[28px]">⏳</div>
        <h2 className="font-cormorant font-normal text-[30px] text-oak-d mb-3">รอยืนยันการชำระเงิน</h2>
        <p className="text-[12px] font-light text-muted leading-[1.8] mb-9">
          ระบบกำลังรอรับการยืนยันจากธนาคาร — อาจใช้เวลาสักครู่<br/>
          เราจะส่งอีเมลยืนยันเมื่อการชำระเงินสมบูรณ์
        </p>
        <Link href="/account/orders" className="inline-block bg-espresso text-gold-lt text-[9.5px] font-medium tracking-[0.28em] uppercase px-8 py-[17px] no-underline">
          ดูสถานะออเดอร์
        </Link>
      </div>
    </div>
  );

  if (state === "failed") return (
    <div className="min-h-screen bg-ivory flex items-center justify-center font-jost px-5">
      <div className="text-center max-w-[420px]">
        <div className="w-[72px] h-[72px] rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-7 text-[28px]">✕</div>
        <h2 className="font-cormorant font-normal text-[30px] text-oak-d mb-3">การชำระเงินไม่สำเร็จ</h2>
        <p className="text-[12px] font-light text-muted leading-[1.8] mb-9">กรุณาลองชำระเงินอีกครั้ง</p>
        <Link href="/cart" className="inline-block bg-espresso text-gold-lt text-[9.5px] font-medium tracking-[0.28em] uppercase px-8 py-[17px] no-underline">
          กลับไปที่ตะกร้า
        </Link>
      </div>
    </div>
  );

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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center font-jost">
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted animate-pulse">กำลังโหลด…</p>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
