"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Circle, Ban, Truck, Package,
  Phone, Building2, FileText, Calendar, Printer,
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { purchaseStatusConfig, type Purchase } from "@/lib/data/purchases";
import { printPO } from "@/lib/po-print";

/* ── Status stepper ─────────────────────────── */
const STEPS = [
  { key: "draft",    label: "ร่าง" },
  { key: "ordered",  label: "สั่งซื้อแล้ว" },
  { key: "received", label: "รับสินค้าแล้ว" },
];

const avatarPalette = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
];

const statusDot: Record<string, string> = {
  draft:     "bg-gray-400",
  ordered:   "bg-blue-400",
  received:  "bg-emerald-500",
  cancelled: "bg-red-500",
};

const BUYER = {
  name: "บริษัท อีคอมเจม จำกัด",
  nameEn: "ECOMJAME CO., LTD.",
  address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110",
  taxId: "0105566012345",
  phone: "02-123-4567",
  email: "purchase@ecomjame.com",
};

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  purchase: Purchase | null;
  index?: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRefresh?: () => void;
}

export function PurchaseDetailDialog({ purchase: po, index = 0, open, onOpenChange, onRefresh }: Props) {
  const [updating, setUpdating] = useState(false);

  if (!po) return null;
  const purchase = po; // capture for closures — po is non-null past this point

  const status      = purchaseStatusConfig[purchase.status];
  const avatarColor = avatarPalette[index % avatarPalette.length];
  const isCancelled = purchase.status === "cancelled";

  const subtotal  = purchase.items.reduce((s, it) => s + it.qty * it.cost, 0);
  const vatAmount = purchase.items.reduce((s, it) => {
    const vatRate = (it as { vatRate?: number }).vatRate ?? 7;
    return s + (vatRate === 7 ? it.qty * it.cost * 0.07 : 0);
  }, 0);
  const discountPct = (purchase as unknown as { discountPct?: number }).discountPct ?? 0;
  const discount    = subtotal * (discountPct / 100);
  const total       = subtotal - discount + vatAmount;

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    const dbId = (purchase as unknown as { _id?: string })._id ?? purchase.id;
    await fetch(`/api/purchases/${dbId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(false);
    onOpenChange(false);
    onRefresh?.();
  }

  function handlePrint() {
    const ext = purchase as unknown as {
      deliveryDate?: string; paymentTerms?: string; shippingMethod?: string;
      buyerInfo?: typeof BUYER; supplierInfo?: { address?: string; taxId?: string; phone?: string; email?: string };
      discountPct?: number;
    };
    const poData = {
      poNumber:       purchase.id,
      issueDate:      purchase.createdAt,
      deliveryDate:   ext.deliveryDate ?? "",
      paymentTerms:   ext.paymentTerms ?? "เครดิต 30 วัน",
      shippingMethod: ext.shippingMethod ?? "จัดส่งโดยผู้จัดจำหน่าย",
      buyer:          ext.buyerInfo ?? BUYER,
      supplier: {
        name:    purchase.supplier,
        address: ext.supplierInfo?.address ?? "",
        taxId:   ext.supplierInfo?.taxId ?? "",
        contact: purchase.supplierContact ?? "",
        phone:   ext.supplierInfo?.phone ?? "",
        email:   ext.supplierInfo?.email ?? "",
      },
      items: purchase.items.map(it => ({
        name:      it.name,
        sku:       it.sku,
        unit:      (it as { unit?: string }).unit ?? "ชิ้น",
        qty:       it.qty,
        unitPrice: it.cost,
        vatRate:   (it as { vatRate?: number }).vatRate ?? 7,
      })),
      discountPct: ext.discountPct ?? 0,
      note: purchase.note ?? "",
    };
    printPO(poData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">

        {/* ── Header hero ── */}
        <div className="bg-gray-50 px-6 pt-6 pb-5 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle asChild>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold", avatarColor)}>
                    {purchase.supplier.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-gray-900">{purchase.id}</span>
                      <Badge variant={status.variant} className="inline-flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[purchase.status])} />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-gray-700">{purchase.supplier}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(total || purchase.total)}</p>
                  <p className="text-xs text-gray-400">{formatDate(purchase.createdAt)}</p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          {!isCancelled ? (
            <div className="mt-5 flex items-center">
              {STEPS.map((s, i) => {
                const done    = i <= status.step;
                const current = i === status.step;
                return (
                  <div key={s.key} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      {done ? (
                        <CheckCircle2 className={cn("h-5 w-5", current ? "text-blue-600" : "text-emerald-500")} />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                      <span className={cn("text-[11px] font-medium whitespace-nowrap", done ? (current ? "text-blue-600" : "text-emerald-600") : "text-gray-400")}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn("mx-3 mb-4 h-px w-20", i < status.step ? "bg-emerald-400" : "bg-gray-200")} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 text-sm text-red-500">
              <Ban className="h-4 w-4" />
              <span className="font-medium">ยกเลิกใบสั่งซื้อ</span>
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Supplier info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3">
              <Building2 className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">ผู้จำหน่าย</p>
                <p className="text-sm font-semibold text-gray-800">{po.supplier}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 px-4 py-3">
              <Phone className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">ติดต่อ</p>
                <p className="text-sm font-semibold text-gray-800">{po.supplierContact || "—"}</p>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">รายการสินค้า</p>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">สินค้า</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">SKU</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">จำนวน</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">ราคา/ชิ้น</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {po.items.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50/60"}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <Package className="h-3.5 w-3.5 text-gray-400" />
                          </div>
                          <span className="text-xs font-medium text-gray-800">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-[11px] text-gray-400">{item.sku || "—"}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-700">
                        <span className="font-bold">{item.qty}</span>{" "}
                        <span className="text-gray-400">{(item as { unit?: string }).unit ?? "ชิ้น"}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500">{formatCurrency(item.cost)}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-gray-900">{formatCurrency(item.qty * item.cost)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-dashed border-gray-200 bg-gray-50/50">
                    <td colSpan={3} className="px-4 py-2.5">
                      {po.note && (
                        <div className="flex items-center gap-1.5 text-xs italic text-gray-400">
                          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                          {po.note}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-[11px] text-gray-500">ยอดรวมก่อนภาษี</td>
                    <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">{formatCurrency(subtotal)}</td>
                  </tr>
                  {vatAmount > 0 && (
                    <tr className="bg-gray-50/30">
                      <td colSpan={3} />
                      <td className="px-4 py-1.5 text-right text-[11px] text-gray-400">ภาษีมูลค่าเพิ่ม 7%</td>
                      <td className="px-4 py-1.5 text-right text-xs text-gray-500">{formatCurrency(vatAmount)}</td>
                    </tr>
                  )}
                  <tr className="bg-gray-900 text-white">
                    <td colSpan={3} />
                    <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-300">ยอดรวมสุทธิ</td>
                    <td className="px-4 py-2.5 text-right text-sm font-bold">{formatCurrency(total || po.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            สร้างเมื่อ {formatDate(po.createdAt)}
          </div>
        </div>

        {/* Actions footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <div className="flex gap-2">
            {!isCancelled && po.status === "draft" && (
              <>
                <Button variant="outline" size="sm" className="text-xs text-red-500 border-red-200 hover:bg-red-50"
                  disabled={updating}
                  onClick={() => updateStatus("cancelled")}>
                  ยกเลิก PO
                </Button>
                <Button size="sm" className="gap-1.5 text-xs"
                  disabled={updating}
                  onClick={() => updateStatus("ordered")}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {updating ? "กำลังบันทึก..." : "ยืนยันสั่งซื้อ"}
                </Button>
              </>
            )}
            {!isCancelled && po.status === "ordered" && (
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs"
                disabled={updating}
                onClick={() => updateStatus("received")}>
                <Truck className="h-3.5 w-3.5" />
                {updating ? "กำลังบันทึก..." : "รับสินค้า + อัปเดต Stock"}
              </Button>
            )}
            {!isCancelled && po.status === "received" && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                รับสินค้าครบถ้วนแล้ว
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Print button */}
            <Button variant="outline" size="sm" className="gap-1.5 text-xs"
              onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" />
              พิมพ์ PO
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-gray-400"
              onClick={() => onOpenChange(false)}>
              ปิด
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
