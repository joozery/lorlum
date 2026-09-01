import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-08-26.dahlia" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi     = event.data.object as Stripe.PaymentIntent;
    const orderId = pi.metadata?.orderId;
    if (orderId) {
      await connectDB();
      await Order.findByIdAndUpdate(orderId, {
        $set: { paymentStatus: "paid", status: "confirmed", paidAt: new Date() },
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi     = event.data.object as Stripe.PaymentIntent;
    const orderId = pi.metadata?.orderId;
    if (orderId) {
      await connectDB();
      await Order.findByIdAndUpdate(orderId, { $set: { status: "cancelled" } });
    }
  }

  return NextResponse.json({ received: true });
}

// Stripe webhooks send raw body — must disable body parsing
export const config = { api: { bodyParser: false } };
