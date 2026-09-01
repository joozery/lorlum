import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET() {
  await connectDB();

  const products = await Product.find({})
    .select("sku name category stock colorVariants imageUrl updatedAt")
    .lean();

  const items = products.map(p => {
    const img = (p.imageUrl as string) ||
      ((p.colorVariants as Array<{ images?: string[] }>)?.[0]?.images?.[0]) || "";

    return {
      id:          String((p as { _id: unknown })._id),
      sku:         p.sku as string,
      name:        p.name as string,
      category:    p.category as string,
      stock:       (p.stock as number) ?? 0,
      minStock:    10,
      maxStock:    100,
      imageUrl:    img,
      lastUpdated: p.updatedAt
        ? new Date(p.updatedAt as Date).toISOString().split("T")[0]
        : "-",
    };
  });

  // Stock-out history from confirmed orders
  const col = mongoose.connection.collection("orders");
  const orders = await col.find(
    { paymentStatus: "paid", status: { $in: ["confirmed", "processing", "shipped", "delivered"] } },
    { projection: { items: 1, orderNumber: 1, createdAt: 1 } }
  ).sort({ createdAt: -1 }).limit(100).toArray();

  const history: Array<{
    id: string; sku: string; name: string; type: string;
    qty: number; note: string; date: string;
  }> = [];

  for (const o of orders) {
    const items2 = o.items as Array<{ productName: string; qty: number; color?: string; size?: number }>;
    for (const item of items2 ?? []) {
      history.push({
        id:   `${String(o._id)}-${item.productName}`,
        sku:  "-",
        name: item.productName,
        type: "out",
        qty:  -(item.qty ?? 1),
        note: `ขายออก · ${o.orderNumber ?? ""}`,
        date: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
      });
    }
  }

  return NextResponse.json({ items, history });
}

// PATCH /api/inventory — adjust stock for a product
export async function PATCH(req: NextRequest) {
  const { productId, delta, note } = await req.json();
  if (!productId || delta === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectDB();
  const col = mongoose.connection.collection("products");
  const oid = new mongoose.Types.ObjectId(String(productId));

  await col.updateOne({ _id: oid }, { $inc: { stock: delta } });
  const updated = await col.findOne({ _id: oid }, { projection: { stock: 1, name: 1 } });

  console.log(`[inventory] adjust ${productId} by ${delta} (${note})`);
  return NextResponse.json({ ok: true, stock: updated?.stock });
}
