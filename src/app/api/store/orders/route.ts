import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getSession } from "@/lib/store-auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  // Exclude orders that were created but payment was never completed
  const orders = await Order.find({
    customerId: session.customerId,
    $nor: [{ status: "pending", paymentStatus: "unpaid" }],
  }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getSession();
  const body = await req.json();

  const { contact, shipping, items, paymentMethod, note } = body;
  if (!items?.length) return NextResponse.json({ error: "No items" }, { status: 400 });

  const subtotal: number = items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0);
  const orderNumber = "LM" + Date.now().toString().slice(-8);

  const order = await Order.create({
    customerId:    session?.customerId ?? null,
    guestEmail:    session ? "" : (contact?.email ?? ""),
    items:         items.map((i: { productId: string; productName: string; imageUrl?: string; color?: string; size?: number; price: number; qty: number }) => ({
      productId:   i.productId,
      productName: i.productName,
      imageUrl:    i.imageUrl ?? "",
      color:       i.color ?? "",
      size:        i.size,
      price:       i.price,
      qty:         i.qty,
    })),
    subtotal,
    shippingFee:   0,
    total:         subtotal,
    paymentMethod: paymentMethod ?? "",
    paymentStatus: "unpaid",
    status:        "pending",
    orderNumber,
    shippingAddress: {
      name:     [contact?.firstName ?? "", contact?.lastName ?? ""].filter(Boolean).join(" "),
      phone:    contact?.phone ?? "",
      line1:    shipping?.line1    ?? "",
      line2:    shipping?.line2    ?? "",
      province: shipping?.province ?? "",
      city:     shipping?.city     ?? "",
      zip:      shipping?.zip      ?? "",
      country:  "Thailand",
    },
    note: note ?? "",
  });

  return NextResponse.json({ orderNumber: order.orderNumber, orderId: order._id });
}
