import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import { sendOrderConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-08-26.dahlia" });

export async function POST(req: NextRequest) {
  const { orderId, paymentIntentId } = await req.json();
  if (!orderId || !paymentIntentId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectDB();
  const order = await Order.findById(orderId).lean();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Skip if already confirmed (idempotent)
  if (order.paymentStatus === "paid") return NextResponse.json({ ok: true });

  // Verify with Stripe that payment actually succeeded
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== "succeeded") {
    return NextResponse.json({ error: "Payment not confirmed by Stripe" }, { status: 400 });
  }

  // Confirm the order
  await Order.findByIdAndUpdate(orderId, {
    $set: { status: "confirmed", paymentStatus: "paid", stripePaymentIntentId: paymentIntentId },
  });

  // Deduct stock for each item using native driver (supports arrayFilters on nested arrays)
  const products = mongoose.connection.collection("products");

  await Promise.all(
    (order.items as Array<{ productId: string; color: string; size: number | null; qty: number }>).map(async (item) => {
      const pid = new mongoose.Types.ObjectId(String(item.productId));
      const qty = item.qty ?? 1;

      if (item.color && item.size != null) {
        // Deduct from: product.stock, variant.stock, and variant.sizeStocks entry
        await products.updateOne(
          { _id: pid },
          {
            $inc: {
              stock: -qty,
              "colorVariants.$[v].stock": -qty,
              "colorVariants.$[v].sizeStocks.$[s].stock": -qty,
            },
          },
          {
            arrayFilters: [
              { "v.name": item.color },
              { "s.size": item.size },
            ],
          }
        );
      } else if (item.color) {
        // No size tracking — deduct product.stock and variant.stock only
        await products.updateOne(
          { _id: pid },
          {
            $inc: {
              stock: -qty,
              "colorVariants.$[v].stock": -qty,
            },
          },
          { arrayFilters: [{ "v.name": item.color }] }
        );
      } else {
        // Fallback: deduct top-level stock only
        await products.updateOne({ _id: pid }, { $inc: { stock: -qty } });
      }
    })
  );

  // Send order confirmation email (non-blocking)
  try {
    let toEmail = order.guestEmail as string | undefined;
    if (!toEmail && order.customerId) {
      const cust = await Customer.findById(order.customerId).select("email").lean() as { email?: string } | null;
      toEmail = cust?.email;
    }
    if (toEmail) {
      const addr = order.shippingAddress as {
        name?: string; phone?: string; line1?: string; line2?: string;
        city?: string; province?: string; zip?: string;
      };
      await sendOrderConfirmationEmail({
        to:          toEmail,
        orderNumber: order.orderNumber as string,
        items:       (order.items as Array<{ productName: string; imageUrl?: string; color: string; size: number | null; qty: number; price: number }>).map(i => ({
          productName: i.productName,
          imageUrl:    i.imageUrl ?? "",
          color:       i.color,
          size:        i.size ?? null,
          qty:         i.qty,
          price:       i.price,
        })),
        total:    order.total as number,
        shipping: {
          name:     addr?.name     ?? "",
          phone:    addr?.phone    ?? "",
          line1:    addr?.line1    ?? "",
          line2:    addr?.line2    ?? "",
          city:     addr?.city     ?? "",
          province: addr?.province ?? "",
          zip:      addr?.zip      ?? "",
        },
      });
    }
  } catch (emailErr) {
    console.error("Order email failed:", emailErr);
  }

  return NextResponse.json({ ok: true });
}
