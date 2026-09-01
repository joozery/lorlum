import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Customer from "@/models/Customer";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 50);
  const skip = (page - 1) * limit;

  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const customerIds = [...new Set(orders.map((o) => o.customerId?.toString()).filter(Boolean))];
  const customers = customerIds.length
    ? await Customer.find({ _id: { $in: customerIds } }).select("name email phone").lean()
    : [];
  const custMap: Record<string, { name: string; email: string; phone: string }> = {};
  customers.forEach((c) => { custMap[c._id.toString()] = { name: c.name, email: c.email, phone: c.phone }; });

  const result = orders.map((o) => {
    const cid = o.customerId?.toString() ?? "";
    const cust = custMap[cid];
    return {
      ...o,
      id:            o._id.toString(),
      customerName:  cust?.name  ?? o.shippingAddress?.name  ?? o.guestEmail ?? "Guest",
      customerEmail: cust?.email ?? o.guestEmail ?? "",
      customerPhone: cust?.phone ?? o.shippingAddress?.phone ?? "",
      currency:      "THB",
      items: (o.items ?? []).map((item: { productId: unknown; productName: string; imageUrl?: string; color?: string; size?: number; price: number; qty: number }) => ({
        productId:   item.productId,
        productName: item.productName,
        imageUrl:    item.imageUrl,
        color:       item.color,
        size:        item.size,
        price:       item.price,
        quantity:    item.qty,
      })),
    };
  });

  const total = await Order.countDocuments({});
  return NextResponse.json({ orders: result, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { id, status, trackingNumber, trackingUrl } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (status)         update.status = status;
  if (trackingNumber) update.trackingNumber = trackingNumber;
  if (trackingUrl)    update.trackingUrl = trackingUrl;
  if (status === "shipped") update.shippedAt = new Date();
  if (status === "paid")    update.paidAt = new Date();

  const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  return NextResponse.json(order);
}
