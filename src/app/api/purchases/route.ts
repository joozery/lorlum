import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/models/Purchase";

export async function GET() {
  await connectDB();
  const purchases = await Purchase.find({}).sort({ createdAt: -1 }).lean();

  const result = purchases.map(p => ({
    id:              (p.poNumber as string) || `PO-${String((p as { _id: unknown })._id).slice(-6).toUpperCase()}`,
    _id:             String((p as { _id: unknown })._id),
    supplier:        p.supplier as string,
    supplierContact: (p.supplierContact as string) || "",
    supplierInfo:    p.supplierInfo ?? {},
    buyerInfo:       p.buyerInfo ?? {},
    issueDate:       p.issueDate instanceof Date ? p.issueDate.toISOString() : (p.issueDate ? String(p.issueDate) : ""),
    deliveryDate:    p.deliveryDate instanceof Date ? p.deliveryDate.toISOString() : (p.deliveryDate ? String(p.deliveryDate) : ""),
    paymentTerms:    (p.paymentTerms as string) || "เครดิต 30 วัน",
    shippingMethod:  (p.shippingMethod as string) || "",
    items:           p.items as Array<{ name: string; sku: string; unit: string; qty: number; cost: number; vatRate: number }>,
    discountPct:     (p.discountPct as number) || 0,
    total:           p.total as number,
    status:          p.status as string,
    note:            (p.note as string) || "",
    createdAt:       p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  }));

  return NextResponse.json({ purchases: result });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  await connectDB();

  const total = body.total ?? (body.items as Array<{ qty: number; cost: number }>)
    ?.reduce((s, i) => s + (i.qty ?? 0) * (i.cost ?? 0), 0) ?? 0;

  const po = await Purchase.create({
    poNumber:        body.poNumber ?? "",
    supplier:        body.supplier?.name ?? body.supplier ?? "",
    supplierContact: body.supplier?.contact ?? body.supplierContact ?? "",
    supplierInfo:    body.supplier ?? {},
    buyerInfo:       body.buyer ?? {},
    issueDate:       body.issueDate ? new Date(body.issueDate) : new Date(),
    deliveryDate:    body.deliveryDate ? new Date(body.deliveryDate) : undefined,
    paymentTerms:    body.paymentTerms ?? "เครดิต 30 วัน",
    shippingMethod:  body.shippingMethod ?? "",
    items:           body.items ?? [],
    discountPct:     body.discountPct ?? 0,
    total,
    status:          body.status ?? "draft",
    note:            body.note ?? "",
  });

  return NextResponse.json({ ok: true, id: po._id });
}
