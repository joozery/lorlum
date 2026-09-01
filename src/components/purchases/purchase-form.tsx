"use client";

import { useState } from "react";
import { Plus, X, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

const PRODUCTS = [
  { id: "1", name: "เสื้อยืด Basic สีขาว",  sku: "TSH-001" },
  { id: "2", name: "กางเกง Slim Fit สีดำ",   sku: "PNT-002" },
  { id: "3", name: "รองเท้า Casual",          sku: "SHO-003" },
  { id: "4", name: "กระเป๋าสะพาย",            sku: "ACC-004" },
  { id: "5", name: "เสื้อ Polo สีน้ำเงิน",   sku: "TSH-005" },
];

interface LineItem {
  productId: string;
  qty: string;
  cost: string;
}

interface PurchaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseFormDialog({ open, onOpenChange }: PurchaseFormDialogProps) {
  const [lines, setLines] = useState<LineItem[]>([{ productId: "", qty: "", cost: "" }]);

  const addLine = () => setLines((prev) => [...prev, { productId: "", qty: "", cost: "" }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof LineItem, val: string) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)));

  const grandTotal = lines.reduce((sum, l) => {
    const qty  = parseFloat(l.qty)  || 0;
    const cost = parseFloat(l.cost) || 0;
    return sum + qty * cost;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          สร้างใบสั่งซื้อ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <ShoppingBag className="h-4 w-4 text-gray-600" />
            </div>
            สร้างใบสั่งซื้อใหม่
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">

          {/* Supplier */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Supplier</Label>
            <Input placeholder="ชื่อผู้จัดจำหน่าย" className="border-gray-200" />
          </div>

          {/* Items table */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">รายการสินค้า</Label>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 bg-gray-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <div className="col-span-5">สินค้า</div>
                <div className="col-span-2 text-right">จำนวน</div>
                <div className="col-span-3 text-right">ราคา/ชิ้น (฿)</div>
                <div className="col-span-1 text-right">รวม</div>
                <div className="col-span-1" />
              </div>

              {/* Lines */}
              <div className="divide-y divide-gray-50">
                {lines.map((line, i) => {
                  const total = (parseFloat(line.qty) || 0) * (parseFloat(line.cost) || 0);
                  return (
                    <div key={i} className="grid grid-cols-12 items-center gap-2 px-4 py-2">
                      <div className="col-span-5">
                        <Select value={line.productId} onValueChange={(v) => updateLine(i, "productId", v)}>
                          <SelectTrigger className="h-8 border-gray-200 text-xs">
                            <SelectValue placeholder="เลือกสินค้า" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCTS.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                <span className="font-mono text-[11px] text-gray-400 mr-1">{p.sku}</span>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          className="h-8 border-gray-200 text-right text-xs"
                          type="number"
                          placeholder="0"
                          min="1"
                          value={line.qty}
                          onChange={(e) => updateLine(i, "qty", e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          className="h-8 border-gray-200 text-right text-xs"
                          type="number"
                          placeholder="0.00"
                          min="0"
                          value={line.cost}
                          onChange={(e) => updateLine(i, "cost", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 text-right text-xs font-semibold text-gray-800">
                        {total > 0 ? formatCurrency(total) : "—"}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {lines.length > 1 && (
                          <button
                            onClick={() => removeLine(i)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add line */}
              <div className="border-t border-gray-50 px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 text-xs text-gray-500 hover:text-gray-800"
                  onClick={addLine}
                >
                  <Plus className="h-3.5 w-3.5" />
                  เพิ่มรายการสินค้า
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">ยอดรวมทั้งสิ้น</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(grandTotal)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
                บันทึกร่าง
              </Button>
              <Button size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
                ยืนยันสั่งซื้อ
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
