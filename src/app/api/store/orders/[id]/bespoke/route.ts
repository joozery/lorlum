import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { Product } from "@/models/Product";
import { getSession } from "@/lib/store-auth";

function detectGarmentType(category: string): "shirt" | "trousers" {
  if (/trouser|pant|slack|กางเกง/i.test(category)) return "trousers";
  return "shirt";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { garmentType = "shirt", note, ...fields } = body;

  await connectDB();

  const order = await Order.findOne({ _id: id, customerId: session.customerId });
  if (!order) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // Get product categories for bespoke items
  const bespokeItems = (order.items as unknown as Array<{ productId: unknown; size: unknown; bespokeMeasurements?: unknown }>).filter(i => i.size === "Bespoke");
  if (!bespokeItems.length) return NextResponse.json({ ok: false, error: "No bespoke item found" }, { status: 400 });

  const productIds = bespokeItems.map(i => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).select("_id category").lean() as Array<{ _id: unknown; category: string }>;
  const catMap = new Map(products.map(p => [String(p._id), p.category]));

  let updated = false;
  for (const item of order.items) {
    if (item.size !== "Bespoke") continue;
    const cat = catMap.get(String(item.productId)) ?? "";
    const itemType = detectGarmentType(cat);
    if (itemType !== garmentType) continue;

    if (garmentType === "shirt") {
      const { chest, waist, shoulder, sleeve } = fields;
      if (!chest || !waist || !shoulder || !sleeve) {
        return NextResponse.json({ ok: false, error: "กรุณากรอกขนาดให้ครบ" }, { status: 400 });
      }
      item.bespokeMeasurements = { garmentType, chest, waist, shoulder, sleeve, note: note ?? "" };
    } else {
      const { waist, hip, rise, thigh, outseam, hem } = fields;
      if (!waist || !hip || !rise || !thigh || !outseam || !hem) {
        return NextResponse.json({ ok: false, error: "กรุณากรอกขนาดให้ครบ" }, { status: 400 });
      }
      item.bespokeMeasurements = { garmentType, waist, hip, rise, thigh, outseam, hem, note: note ?? "" };
    }
    updated = true;
  }

  if (!updated) return NextResponse.json({ ok: false, error: "No matching bespoke item" }, { status: 400 });

  order.markModified("items");
  await order.save();

  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const order = await Order.findOne({ _id: id, customerId: session.customerId })
    .select("items orderNumber")
    .lean() as { items: Array<{ productId: unknown; size: unknown; bespokeMeasurements?: Record<string, unknown> }>, orderNumber: string } | null;

  if (!order) return NextResponse.json({ ok: false }, { status: 404 });

  const bespokeItems = order.items.filter(i => i.size === "Bespoke");
  if (!bespokeItems.length) {
    return NextResponse.json({ ok: true, hasBespoke: false, orderNumber: order.orderNumber, bespokeItems: [] });
  }

  const productIds = bespokeItems.map(i => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).select("_id category").lean() as Array<{ _id: unknown; category: string }>;
  const catMap = new Map(products.map(p => [String(p._id), p.category]));

  const items = bespokeItems.map(i => ({
    garmentType: detectGarmentType(catMap.get(String(i.productId)) ?? ""),
    measurements: i.bespokeMeasurements ?? null,
  }));

  // Legacy compat: return single-item fields
  const firstItem = items[0];
  return NextResponse.json({
    ok: true,
    hasBespoke: true,
    orderNumber: order.orderNumber,
    bespokeItems: items,
    // legacy
    garmentType: firstItem.garmentType,
    measurements: firstItem.measurements,
  });
}
