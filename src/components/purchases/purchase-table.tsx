"use client";

import { useState } from "react";
import { Eye, CheckCircle2, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { purchaseStatusConfig, type Purchase } from "@/lib/data/purchases";
import { PurchaseDetailDialog } from "./purchase-detail-dialog";

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

interface PurchaseTableProps {
  purchases: Purchase[];
  onRefresh?: () => void;
}

export function PurchaseTable({ purchases, onRefresh }: PurchaseTableProps) {
  const [selected, setSelected] = useState<{ po: Purchase; index: number } | null>(null);

  if (purchases.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-gray-400">
        <p className="text-sm font-medium">ไม่พบใบสั่งซื้อ</p>
        <p className="mt-1 text-xs">ลองปรับเงื่อนไขการค้นหา</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">PO</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Supplier</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">รายการสินค้า</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">ยอดรวม</th>
              <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">สถานะ</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">วันที่</th>
              <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {purchases.map((po, i) => {
              const status      = purchaseStatusConfig[po.status];
              const avatarColor = avatarPalette[i % avatarPalette.length];
              const firstItem   = po.items[0];
              const extraItems  = po.items.length - 1;

              return (
                <tr
                  key={po.id}
                  className="group cursor-pointer hover:bg-blue-50/40 transition-colors"
                  onClick={() => setSelected({ po, index: i })}
                >
                  {/* PO ID */}
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-bold text-gray-800">{po.id}</p>
                    {po.note && (
                      <p className="mt-0.5 max-w-[120px] truncate text-[11px] italic text-gray-400">
                        {po.note}
                      </p>
                    )}
                  </td>

                  {/* Supplier */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold", avatarColor)}>
                        {po.supplier.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{po.supplier}</p>
                        <p className="text-[11px] text-gray-400">{po.supplierContact}</p>
                      </div>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-5 py-4">
                    <p className="text-xs text-gray-800">
                      <span className="font-medium">{firstItem.name}</span>
                      <span className="text-gray-400"> ×{firstItem.qty}</span>
                    </p>
                    {extraItems > 0 && (
                      <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        +{extraItems} รายการ
                      </span>
                    )}
                  </td>

                  {/* Total */}
                  <td className="px-5 py-4 text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(po.total)}</p>
                    <p className="text-[11px] text-gray-400">{po.items.reduce((s, it) => s + it.qty, 0)} ชิ้น</p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 text-center">
                    <Badge variant={status.variant} className="inline-flex items-center gap-1.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[po.status])} />
                      {status.label}
                    </Badge>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4">
                    <p className="text-xs text-gray-700">{formatDate(po.createdAt)}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      {po.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-[11px] px-2.5"
                          onClick={() => setSelected({ po, index: i })}
                        >
                          <CheckCircle2 className="h-3 w-3 text-blue-500" />
                          ยืนยัน
                        </Button>
                      )}
                      {po.status === "ordered" && (
                        <Button
                          size="sm"
                          className="h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 text-[11px] px-2.5"
                          onClick={() => setSelected({ po, index: i })}
                        >
                          <Truck className="h-3 w-3" />
                          รับสินค้า
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        onClick={() => setSelected({ po, index: i })}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PurchaseDetailDialog
        purchase={selected?.po ?? null}
        index={selected?.index ?? 0}
        open={selected !== null}
        onOpenChange={(v) => { if (!v) setSelected(null); }}
        onRefresh={onRefresh}
      />
    </>
  );
}
