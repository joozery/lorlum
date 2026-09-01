"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { mockStockItems, type StockItem } from "@/lib/data/inventory";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "in",         label: "รับเข้า (+)",   icon: ArrowUp,    color: "text-emerald-600 bg-emerald-50" },
  { value: "out",        label: "จ่ายออก (-)",   icon: ArrowDown,  color: "text-red-500 bg-red-50" },
  { value: "adjustment", label: "ปรับยอด",        icon: ArrowUpDown, color: "text-gray-600 bg-gray-100" },
];

interface StockAdjustDialogProps {
  open: boolean;
  selectedItem: StockItem | null;
  onClose: () => void;
}

export function StockAdjustDialog({ open, selectedItem, onClose }: StockAdjustDialogProps) {
  const [type, setType]   = useState("in");
  const [qty, setQty]     = useState("");
  const activeType = TYPE_OPTIONS.find((t) => t.value === type) ?? TYPE_OPTIONS[0];
  const TypeIcon = activeType.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <ArrowUpDown className="h-4 w-4 text-gray-600" />
            </div>
            ปรับ Stock สินค้า
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">

          {/* Product selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">สินค้า</Label>
            <Select defaultValue={selectedItem?.id}>
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="เลือกสินค้า" />
              </SelectTrigger>
              <SelectContent>
                {mockStockItems.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-gray-400" />
                      <span>{i.sku} — {i.name}</span>
                      <span className="ml-auto text-xs text-gray-400">({i.stock} ชิ้น)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current stock display */}
          {selectedItem && (
            <div className="rounded-2xl bg-gray-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">สต็อกปัจจุบัน</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-gray-900">{selectedItem.stock}</span>
                <span className="text-xs text-gray-400">/ {selectedItem.maxStock} ชิ้น</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={cn(
                    "h-full rounded-full",
                    selectedItem.stock <= 3 ? "bg-red-500" :
                    selectedItem.stock <= selectedItem.minStock ? "bg-amber-400" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min((selectedItem.stock / selectedItem.maxStock) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Type selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">ประเภทการปรับ</Label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center text-xs font-semibold transition-all",
                      type === opt.value
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">จำนวน</Label>
            <div className="flex items-center gap-2">
              <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg font-bold", activeType.color)}>
                <TypeIcon className="h-4 w-4" />
              </div>
              <Input
                type="number"
                placeholder="0"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="border-gray-200 text-lg font-bold"
              />
              <span className="text-xs text-gray-400">ชิ้น</span>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">หมายเหตุ</Label>
            <Textarea
              placeholder="เหตุผลหรือรายละเอียดเพิ่มเติม..."
              rows={2}
              className="resize-none border-gray-200 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button size="sm" className="flex-1 text-xs" onClick={onClose}>
              บันทึกการปรับ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
