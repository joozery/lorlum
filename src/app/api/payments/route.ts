import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";

function mapStatus(paymentStatus: string, orderStatus: string): string {
  if (paymentStatus === "paid")     return "success";
  if (paymentStatus === "refunded") return "refunded";
  if (orderStatus   === "cancelled") return "failed";
  return "pending";
}

export async function GET() {
  await connectDB();

  const col = mongoose.connection.collection("orders");

  // Only show orders that reached the Stripe payment step (have a paymentIntentId)
  const orders = await col
    .find(
      { stripePaymentIntentId: { $exists: true, $ne: "" } },
      { sort: { createdAt: -1 }, limit: 200 }
    )
    .toArray();

  // Batch-fetch customer names — customerId is ObjectId in DB
  const custOids = [
    ...new Set(
      orders
        .filter(o => o.customerId)
        .map(o => {
          try { return new mongoose.Types.ObjectId(String(o.customerId)); }
          catch { return null; }
        })
        .filter(Boolean)
    ),
  ] as mongoose.Types.ObjectId[];

  const customers = custOids.length
    ? (await Customer.find({ _id: { $in: custOids } })
        .select("firstName lastName name email")
        .lean()) as Array<{ _id: mongoose.Types.ObjectId; firstName?: string; lastName?: string; name?: string; email: string }>
    : [];

  const custMap: Record<string, { name: string; email: string }> = {};
  for (const c of customers) {
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.name || c.email;
    custMap[c._id.toString()] = { name, email: c.email };
  }

  const transactions = orders.map((o, i) => {
    const cidStr   = o.customerId ? String(o.customerId) : "";
    const custInfo = custMap[cidStr];
    const addr     = o.shippingAddress as { name?: string } | undefined;
    const customer = custInfo?.name || addr?.name || String(o.guestEmail || "Guest");
    const email    = custInfo?.email || String(o.guestEmail || "");

    const status = mapStatus(
      String(o.paymentStatus ?? "unpaid"),
      String(o.status ?? "pending")
    );

    return {
      id:        `pi_${String(o.stripePaymentIntentId).slice(-8)}`,
      orderId:   String(o.orderNumber ?? `ORD-${String(i + 1).padStart(3, "0")}`),
      customer,
      email,
      amount:    Number(o.total ?? 0),
      currency:  "THB",
      method:    "Credit Card",
      gateway:   "Stripe",
      status,
      txRef:     String(o.stripePaymentIntentId ?? ""),
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    };
  });

  const receipts = transactions
    .filter(t => t.status === "success")
    .map(t => ({
      id:        `RCP-${t.orderId}`,
      orderId:   t.orderId,
      customer:  t.customer,
      email:     t.email,
      amount:    t.amount,
      sentAt:    t.createdAt,
      sentCount: 1,
    }));

  return NextResponse.json({ transactions, receipts });
}
