import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getPaymentSettings } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId } = body;

  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const { stripe, enabled } = await getPaymentSettings();
  if (!enabled || !stripe) {
    return NextResponse.json({ error: "Payment is currently unavailable" }, { status: 503 });
  }

  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const amountSatang = Math.round(order.total * 100); // THB → satang

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   amountSatang,
    currency: "thb",
    metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    automatic_payment_methods: { enabled: true },
  });

  // Save payment intent ID on order for webhook lookup
  await Order.findByIdAndUpdate(orderId, { $set: { stripePaymentIntentId: paymentIntent.id } });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
