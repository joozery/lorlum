"use client";

import Image from "next/image";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
/* ── Category chip colours ──────────────────── */
const catChip: Record<string, string> = {
  "เสื้อผ้า": "bg-blue-50 text-blue-700 border-blue-100",
  "กางเกง":   "bg-violet-50 text-violet-700 border-violet-100",
  "รองเท้า":  "bg-amber-50 text-amber-700 border-amber-100",
  "กระเป๋า":  "bg-rose-50 text-rose-700 border-rose-100",
};

export interface StockItem {
  id: string; sku: string; name: string; category: string;
  stock: number; minStock: number; maxStock: number;
  imageUrl?: string; lastUpdated: string;
}

function StockBar({ stock, min, max }: { stock: number; min: number; max: number }) {
  const pct     = Math.min((stock / max) * 100, 100);
  const isCrit  = stock <= 3;
  const isLow   = stock <= min;
  const barColor = isCrit ? "bg-red-500" : isLow ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
    </div>
  );
}

interface StockTableProps {
  items: StockItem[];
  onAdjust: (item: StockItem) => void;
}

export function StockTable({ items, onAdjust }: StockTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-gray-400">
        <p className="text-sm font-medium">ไม่พบสินค้าที่ค้นหา</p>
        <p className="mt-1 text-xs">ลองปรับคำค้นหาหรือหมวดหมู่</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">สินค้า</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">หมวดหมู่</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 w-52">คงเหลือ</th>
            <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">สถานะ</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">อัปเดตล่าสุด</th>
            <th className="w-24 px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item) => {
            const isCrit   = item.stock <= 3;
            const isLow    = item.stock <= item.minStock;
            const imgSrc   = item.imageUrl;
            const chipCls  = catChip[item.category] ?? "bg-gray-50 text-gray-600 border-gray-200";

            return (
              <tr key={item.id} className="group hover:bg-gray-50/60 transition-colors">

                {/* Product */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      {imgSrc ? (
                        <Image src={imgSrc} alt={item.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300 text-xs">?</div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-gray-400">{item.sku}</p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-5 py-4">
                  <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", chipCls)}>
                    {item.category}
                  </span>
                </td>

                {/* Stock + bar */}
                <td className="px-5 py-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn(
                      "text-lg font-bold leading-none",
                      isCrit ? "text-red-500" : isLow ? "text-amber-500" : "text-gray-900"
                    )}>
                      {item.stock}
                    </span>
                    <span className="text-xs text-gray-400">/ {item.maxStock} ชิ้น</span>
                  </div>
                  <StockBar stock={item.stock} min={item.minStock} max={item.maxStock} />
                  <p className="mt-1 text-[10px] text-gray-400">Min: {item.minStock} ชิ้น</p>
                </td>

                {/* Status */}
                <td className="px-5 py-4 text-center">
                  <Badge variant={isCrit ? "destructive" : isLow ? "warning" : "success"}>
                    {isCrit ? "วิกฤต" : isLow ? "ใกล้หมด" : "ปกติ"}
                  </Badge>
                </td>

                {/* Last updated */}
                <td className="px-5 py-4">
                  <p className="text-xs text-gray-700">{item.lastUpdated}</p>
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onAdjust(item)}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    ปรับ
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
