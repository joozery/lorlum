"use client";

import { CheckCircle2, Circle, Package, FileText, Truck, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { purchaseStatusConfig, type Purchase } from "@/lib/data/purchases";

/* ── Supplier avatar colours ─────────────────── */
const avatarPalette = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
];

/* ── Status stepper ──────────────────────────── */
const STEPS = [
  { key: "draft",    label: "ร่าง" },
  { key: "ordered",  label: "สั่งซื้อ" },
  { key: "received", label: "รับสินค้า" },
];

function StatusStepper({ status, step }: { status: string; step: number }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-xs text-red-500">
        <Ban className="h-3.5 w-3.5" />
        <span className="font-medium">ยกเลิกใบสั่งซื้อ</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => {
        const done    = i <= step;
        const current = i === step;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-0.5">
              {done ? (
                <CheckCircle2 className={cn("h-4 w-4", current ? "text-blue-600" : "text-emerald-500")} />
              ) : (
                <Circle className="h-4 w-4 text-gray-300" />
              )}
              <span className={cn(
                "text-[10px] font-medium",
                done ? (current ? "text-blue-600" : "text-emerald-600") : "text-gray-400"
              )}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "mx-1.5 mb-3.5 h-px w-10",
                i < step ? "bg-emerald-400" : "bg-gray-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface PurchaseCardProps {
  purchase: Purchase;
  index?: number;
}

export function PurchaseCard({ purchase, index = 0 }: PurchaseCardProps) {
  const status      = purchaseStatusConfig[purchase.status];
  const avatarColor = avatarPalette[index % avatarPalette.length];
  const isCancelled = purchase.status === "cancelled";

  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md",
      isCancelled ? "border-gray-100 opacity-70" : "border-gray-100"
    )}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="flex items-start gap-3">
          {/* Supplier avatar */}
          <div className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold",
            avatarColor
          )}>
            {purchase.supplier.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-sm font-bold text-gray-900">{purchase.id}</p>
              <Badge variant={status.variant} className="text-[11px]">{status.label}</Badge>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-gray-700">{purchase.supplier}</p>
            <p className="text-[11px] text-gray-400">{purchase.supplierContact}</p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-gray-900">{formatCurrency(purchase.total)}</p>
          <p className="mt-0.5 text-[11px] text-gray-400">{formatDate(purchase.createdAt)}</p>
        </div>
      </div>

      {/* ── Status stepper ── */}
      <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3">
        <StatusStepper status={purchase.status} step={status.step} />
      </div>

      {/* ── Items table ── */}
      <div className="border-t border-gray-50">
        <div className="grid grid-cols-12 bg-gray-50/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          <div className="col-span-5">สินค้า</div>
          <div className="col-span-2 text-center">SKU</div>
          <div className="col-span-2 text-center">จำนวน</div>
          <div className="col-span-1 text-right">ราคา/ชิ้น</div>
          <div className="col-span-2 text-right">รวม</div>
        </div>
        <div className="divide-y divide-gray-50">
          {purchase.items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 items-center px-5 py-2.5 text-xs">
              <div className="col-span-5 flex items-center gap-2">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Package className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <span className="font-medium text-gray-800">{item.name}</span>
              </div>
              <div className="col-span-2 text-center font-mono text-[11px] text-gray-400">{item.sku}</div>
              <div className="col-span-2 text-center text-gray-700">
                <span className="font-semibold">{item.qty}</span>
                <span className="text-gray-400"> ชิ้น</span>
              </div>
              <div className="col-span-1 text-right text-gray-500">{formatCurrency(item.cost)}</div>
              <div className="col-span-2 text-right font-bold text-gray-900">
                {formatCurrency(item.qty * item.cost)}
              </div>
            </div>
          ))}
        </div>

        {/* Total row */}
        <div className="flex items-center justify-between border-t border-dashed border-gray-100 px-5 py-2.5">
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            {purchase.note && (
              <span className="italic">"{purchase.note}"</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">ยอดรวมทั้งสิ้น</span>
            <span className="text-base font-bold text-gray-900">{formatCurrency(purchase.total)}</span>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      {!isCancelled && (
        <div className="flex items-center gap-2 border-t border-gray-50 bg-gray-50/30 px-5 py-3">
          {purchase.status === "draft" && (
            <Button size="sm" className="gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ยืนยันสั่งซื้อ
            </Button>
          )}
          {purchase.status === "ordered" && (
            <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700">
              <Truck className="h-3.5 w-3.5" />
              รับสินค้า + อัปเดต Stock
            </Button>
          )}
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-gray-500 hover:text-gray-800 ml-auto">
            <FileText className="h-3.5 w-3.5" />
            ดูรายละเอียด
          </Button>
        </div>
      )}
    </div>
  );
}
