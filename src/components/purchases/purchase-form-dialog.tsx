"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Search, ChevronDown, FileText, Truck } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────── */
interface ProductOption { _id: string; name: string; sku: string; costPrice?: number; }

interface LineItem {
  name: string;
  sku: string;
  unit: string;
  qty: string;
  unitPrice: string;
  vatRate: "0" | "7";
}

const EMPTY_LINE: LineItem = { name: "", sku: "", unit: "ชิ้น", qty: "", unitPrice: "", vatRate: "7" };
const UNITS = ["ชิ้น", "โหล", "กล่อง", "แพ็ค", "ชุด", "กิโลกรัม", "เมตร"];
const PAYMENT_TERMS = ["เงินสด", "เครดิต 15 วัน", "เครดิต 30 วัน", "เครดิต 45 วัน", "เครดิต 60 วัน", "เครดิต 90 วัน"];

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

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function genPONumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `PO${yy}${mm}${dd}-${rand}`;
}

/* ── Combobox for product search ─────── */
function ProductCombobox({
  value, onChange, products,
}: {
  value: string;
  onChange: (name: string, sku: string, cost: number) => void;
  products: ProductOption[];
}) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState(value);

  const filtered = query.length < 1
    ? products.slice(0, 20)
    : products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15);

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <Input
          className="h-7 text-xs border-gray-200 pr-6"
          placeholder="ชื่อสินค้า / SKU..."
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value, "", 0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        <ChevronDown className="absolute right-2 top-1.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg">
          {filtered.map(p => (
            <button
              key={p._id}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-blue-50 transition-colors"
              onMouseDown={() => {
                setQuery(p.name);
                onChange(p.name, p.sku, p.costPrice ?? 0);
                setOpen(false);
              }}
            >
              <span className="font-mono text-[10px] text-gray-400 w-20 shrink-0">{p.sku}</span>
              <span className="font-medium text-gray-800 truncate">{p.name}</span>
              {p.costPrice ? <span className="ml-auto text-gray-400 shrink-0">฿{p.costPrice.toLocaleString()}</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main dialog ─────────────────────── */
interface PurchaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseFormDialog({ open, onOpenChange }: PurchaseFormDialogProps) {
  const [products,    setProducts]    = useState<ProductOption[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [poNumber]                    = useState(genPONumber);
  const [issueDate,   setIssueDate]   = useState(todayStr);
  const [delivDate,   setDelivDate]   = useState("");
  const [payTerms,    setPayTerms]    = useState("เครดิต 30 วัน");
  const [shipMethod,  setShipMethod]  = useState("จัดส่งโดยผู้จัดจำหน่าย");
  const [supplier,    setSupplier]    = useState({ name: "", address: "", taxId: "", contact: "", phone: "", email: "" });
  const [lines,       setLines]       = useState<LineItem[]>([EMPTY_LINE]);
  const [discountPct, setDiscountPct] = useState("0");
  const [note,        setNote]        = useState("");

  useEffect(() => {
    fetch("/api/products?limit=200&status=active")
      .then(r => r.json())
      .then(d => setProducts(d.products ?? []));
  }, []);

  const updateLine = useCallback((i: number, patch: Partial<LineItem>) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l)), []);
  const addLine    = () => setLines(prev => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));

  /* ── Totals ── */
  const subtotal  = lines.reduce((s, l) => s + (parseFloat(l.qty)||0)*(parseFloat(l.unitPrice)||0), 0);
  const disc      = subtotal * ((parseFloat(discountPct)||0) / 100);
  const vatAmount = lines.reduce((s, l) => {
    const ln = (parseFloat(l.qty)||0)*(parseFloat(l.unitPrice)||0);
    return s + (l.vatRate === "7" ? ln * 0.07 : 0);
  }, 0) * (1 - (parseFloat(discountPct)||0)/100);
  const total = subtotal - disc + vatAmount;

  /* ── Save ── */
  async function save(status: "draft" | "ordered") {
    if (!supplier.name.trim()) { alert("กรุณาระบุชื่อผู้จัดจำหน่าย"); return; }
    const validLines = lines.filter(l => l.name.trim() && parseFloat(l.qty) > 0);
    if (validLines.length === 0) { alert("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ"); return; }

    setSaving(true);
    await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        poNumber,
        issueDate,
        deliveryDate: delivDate,
        paymentTerms: payTerms,
        shippingMethod: shipMethod,
        supplier,
        buyer: BUYER,
        items: validLines.map(l => ({
          name:      l.name,
          sku:       l.sku,
          unit:      l.unit,
          qty:       parseFloat(l.qty) || 0,
          cost:      parseFloat(l.unitPrice) || 0,
          vatRate:   parseInt(l.vatRate),
        })),
        discountPct: parseFloat(discountPct) || 0,
        total: Math.round(total * 100) / 100,
        note,
        status,
      }),
    });
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-7 py-4">
          <DialogHeader>
            <DialogTitle asChild>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                    <FileText className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">สร้างใบสั่งซื้อใหม่</p>
                    <p className="font-mono text-xs text-gray-400">{poNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>วันที่: <strong className="text-gray-700">{new Date(issueDate).toLocaleDateString("th-TH")}</strong></span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-7 py-5 space-y-6">

          {/* ── Section 1: Parties ── */}
          <div className="grid grid-cols-2 gap-5">

            {/* Buyer (read-only) */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">ผู้ซื้อ / BUYER</p>
              <p className="text-sm font-bold text-gray-900">{BUYER.name}</p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{BUYER.address}</p>
              <p className="mt-1 text-xs text-gray-400">โทร: {BUYER.phone} · {BUYER.email}</p>
              <p className="mt-1 text-xs text-gray-400">เลขผู้เสียภาษี: {BUYER.taxId}</p>
            </div>

            {/* Supplier (editable) */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ผู้ขาย / SUPPLIER</p>
              <div className="space-y-2">
                <Input
                  placeholder="ชื่อผู้จัดจำหน่าย *"
                  className="border-gray-200 text-sm h-8 font-medium"
                  value={supplier.name}
                  onChange={e => setSupplier(s => ({ ...s, name: e.target.value }))}
                />
                <Input
                  placeholder="ที่อยู่"
                  className="border-gray-200 text-xs h-8"
                  value={supplier.address}
                  onChange={e => setSupplier(s => ({ ...s, address: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="ผู้ติดต่อ" className="border-gray-200 text-xs h-8"
                    value={supplier.contact}
                    onChange={e => setSupplier(s => ({ ...s, contact: e.target.value }))} />
                  <Input placeholder="โทรศัพท์" className="border-gray-200 text-xs h-8"
                    value={supplier.phone}
                    onChange={e => setSupplier(s => ({ ...s, phone: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="อีเมล" className="border-gray-200 text-xs h-8"
                    value={supplier.email}
                    onChange={e => setSupplier(s => ({ ...s, email: e.target.value }))} />
                  <Input placeholder="เลขผู้เสียภาษี" className="border-gray-200 text-xs h-8 font-mono"
                    value={supplier.taxId}
                    onChange={e => setSupplier(s => ({ ...s, taxId: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: PO Details ── */}
          <div className="grid grid-cols-4 gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wide text-gray-400">วันที่สั่งซื้อ</Label>
              <Input type="date" className="h-8 border-gray-200 text-xs" value={issueDate}
                onChange={e => setIssueDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wide text-gray-400">กำหนดส่งสินค้า</Label>
              <Input type="date" className="h-8 border-gray-200 text-xs" value={delivDate}
                onChange={e => setDelivDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wide text-gray-400">เงื่อนไขการชำระ</Label>
              <Select value={payTerms} onValueChange={setPayTerms}>
                <SelectTrigger className="h-8 border-gray-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wide text-gray-400">วิธีจัดส่ง</Label>
              <Input className="h-8 border-gray-200 text-xs" value={shipMethod}
                onChange={e => setShipMethod(e.target.value)} />
            </div>
          </div>

          {/* ── Section 3: Items ── */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">รายการสินค้า</p>
              <button
                onClick={addLine}
                className="flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus className="h-3 w-3" /> เพิ่มรายการ
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100">
              {/* Table header */}
              <div className="grid bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-2.5"
                style={{ gridTemplateColumns: "28px 1fr 80px 60px 85px 56px 90px 28px" }}>
                <div className="text-center">#</div>
                <div>รายการสินค้า</div>
                <div>หน่วย</div>
                <div className="text-right">จำนวน</div>
                <div className="text-right">ราคา/หน่วย</div>
                <div className="text-center">ภาษี</div>
                <div className="text-right">จำนวนเงิน</div>
                <div />
              </div>

              {/* Lines */}
              <div className="divide-y divide-gray-50">
                {lines.map((line, i) => {
                  const lineTotal = (parseFloat(line.qty)||0) * (parseFloat(line.unitPrice)||0);
                  return (
                    <div
                      key={i}
                      className={cn("grid items-center gap-2 px-3 py-2", i % 2 === 1 && "bg-gray-50/60")}
                      style={{ gridTemplateColumns: "28px 1fr 80px 60px 85px 56px 90px 28px" }}
                    >
                      <div className="text-center text-xs font-mono text-gray-400">{i + 1}</div>

                      {/* Product name combobox */}
                      <ProductCombobox
                        value={line.name}
                        products={products}
                        onChange={(name, sku, cost) => updateLine(i, {
                          name,
                          sku: sku || line.sku,
                          unitPrice: cost > 0 ? String(cost) : line.unitPrice,
                        })}
                      />

                      {/* Unit */}
                      <Select value={line.unit} onValueChange={v => updateLine(i, { unit: v })}>
                        <SelectTrigger className="h-7 border-gray-200 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      {/* Qty */}
                      <Input className="h-7 border-gray-200 text-right text-xs"
                        type="number" placeholder="0" min="0"
                        value={line.qty}
                        onChange={e => updateLine(i, { qty: e.target.value })} />

                      {/* Unit price */}
                      <Input className="h-7 border-gray-200 text-right text-xs"
                        type="number" placeholder="0.00" min="0"
                        value={line.unitPrice}
                        onChange={e => updateLine(i, { unitPrice: e.target.value })} />

                      {/* VAT */}
                      <Select value={line.vatRate} onValueChange={v => updateLine(i, { vatRate: v as "0"|"7" })}>
                        <SelectTrigger className="h-7 border-gray-200 text-xs text-center">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7%</SelectItem>
                          <SelectItem value="0">0%</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Line total */}
                      <div className="text-right text-xs font-bold text-gray-800">
                        {lineTotal > 0 ? `฿${fmt(lineTotal)}` : <span className="text-gray-300">—</span>}
                      </div>

                      {/* Remove */}
                      {lines.length > 1 ? (
                        <button onClick={() => removeLine(i)}
                          className="flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : <div />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Section 4: Totals ── */}
          <div className="flex items-start justify-between gap-5">

            {/* Note + Discount */}
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wide text-gray-400">ส่วนลด (%)</Label>
                <Input className="h-8 w-32 border-gray-200 text-xs"
                  type="number" min="0" max="100" placeholder="0"
                  value={discountPct}
                  onChange={e => setDiscountPct(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wide text-gray-400">หมายเหตุ / เงื่อนไขพิเศษ</Label>
                <Textarea
                  className="border-gray-200 text-xs resize-none"
                  rows={3}
                  placeholder="เช่น ETA 3–5 วันทำการ, สินค้าต้องผ่านการตรวจสอบก่อนรับ..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Summary box */}
            <div className="w-64 rounded-xl border border-gray-100 overflow-hidden shrink-0">
              <div className="divide-y divide-gray-50">
                {[
                  { label: "ยอดรวมก่อนภาษี", value: fmt(subtotal), muted: true },
                  ...(parseFloat(discountPct) > 0
                    ? [{ label: `ส่วนลด (${discountPct}%)`, value: `-${fmt(disc)}`, muted: true, red: true }]
                    : []),
                  { label: "ภาษีมูลค่าเพิ่ม 7%", value: fmt(vatAmount), muted: true },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs text-gray-500">{row.label}</span>
                    <span className={cn("text-xs font-semibold", row.red && "text-red-500")}>{row.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
                  <span className="text-xs font-semibold text-gray-300">ยอดรวมสุทธิ</span>
                  <span className="text-base font-bold text-white">฿{fmt(total)}</span>
                </div>
              </div>
              <div className="bg-amber-50 border-t border-amber-100 px-4 py-2.5 text-[10px] text-amber-700 leading-relaxed">
                <strong>ตัวอักษร:</strong> {total > 0 ? "ดูในเอกสารพิมพ์" : "—"}
              </div>
            </div>
          </div>

        </div>

        {/* ── Sticky footer ── */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-gray-100 bg-white/95 backdrop-blur px-7 py-4">
          <Button variant="ghost" size="sm" className="text-xs text-gray-400"
            onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs"
              disabled={saving}
              onClick={() => save("draft")}>
              <FileText className="h-3.5 w-3.5" />
              บันทึกร่าง
            </Button>
            <Button size="sm" className="gap-1.5 text-xs"
              disabled={saving}
              onClick={() => save("ordered")}>
              <Truck className="h-3.5 w-3.5" />
              {saving ? "กำลังบันทึก..." : "ยืนยันสั่งซื้อ"}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
