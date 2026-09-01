"use client";

import { ArrowLeft, Save, ImagePlus, X, Plus, Loader2, ChevronDown, ChevronUp, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Product, ColorVariant } from "@/types";

// ── Preset colours ─────────────────────────────────────────────────────────
const PRESETS = [
  { name: "ขาว",        hex: "#FFFFFF" }, { name: "ออฟไวท์",    hex: "#FAF9F6" },
  { name: "ครีม",       hex: "#F5F0E8" }, { name: "เบจ",        hex: "#E8D5B7" },
  { name: "แทน",        hex: "#C9A87C" }, { name: "น้ำตาลอ่อน", hex: "#A0785A" },
  { name: "น้ำตาล",     hex: "#7C4A2D" }, { name: "น้ำตาลเข้ม", hex: "#4A2C1A" },
  { name: "เทาอ่อน",    hex: "#E5E7EB" }, { name: "เทา",        hex: "#9CA3AF" },
  { name: "เทาเข้ม",    hex: "#6B7280" }, { name: "ชาร์โคล",    hex: "#374151" },
  { name: "ดำ",         hex: "#111111" }, { name: "ชมพูอ่อน",   hex: "#FCE7F3" },
  { name: "ชมพู",       hex: "#F9A8D4" }, { name: "ชมพูเข้ม",   hex: "#EC4899" },
  { name: "แดง",        hex: "#EF4444" }, { name: "แดงเข้ม",    hex: "#B91C1C" },
  { name: "เลือดหมู",   hex: "#7F1D1D" }, { name: "เบอร์กันดี", hex: "#6B1A1A" },
  { name: "ส้ม",        hex: "#F97316" }, { name: "เหลือง",     hex: "#EAB308" },
  { name: "มัสตาร์ด",   hex: "#CA8A04" }, { name: "ทอง",        hex: "#D4A017" },
  { name: "มิ้นต์",     hex: "#A7F3D0" }, { name: "เขียวอ่อน",  hex: "#86EFAC" },
  { name: "เขียว",      hex: "#22C55E" }, { name: "เขียวเข้ม",  hex: "#16A34A" },
  { name: "โอลีฟ",      hex: "#65A30D" }, { name: "เขียวขวด",   hex: "#166534" },
  { name: "ฟ้าอ่อน",    hex: "#BAE6FD" }, { name: "ฟ้า",        hex: "#38BDF8" },
  { name: "น้ำเงิน",    hex: "#3B82F6" }, { name: "โคบอลต์",    hex: "#2563EB" },
  { name: "กรมท่า",     hex: "#1E3A5F" }, { name: "ลาเวนเดอร์", hex: "#DDD6FE" },
  { name: "ม่วง",       hex: "#A855F7" }, { name: "ม่วงเข้ม",   hex: "#7C3AED" },
  { name: "ยีนส์",      hex: "#4A6FA5" }, { name: "คากี",       hex: "#BDB76B" },
  { name: "เงิน",       hex: "#C0C0C0" },
];

// ── Types ──────────────────────────────────────────────────────────────────
interface VariantDraft extends ColorVariant {
  _key: string;        // local unique key
  uploading?: boolean;
}

interface ProductPageFormProps { product?: Product }

// ── VariantCard ────────────────────────────────────────────────────────────
function VariantCard({
  variant, onUpdate, onRemove, productId, productSizes,
}: {
  variant: VariantDraft;
  onUpdate: (v: VariantDraft) => void;
  onRemove: () => void;
  productId: string;
  productSizes: number[];
}) {
  const [open,      setOpen]      = useState(true);
  const [pickColor, setPickColor] = useState(false);
  const [customHex, setCustomHex] = useState(variant.hex);
  const fileRef = useRef<HTMLInputElement>(null);

  const syncHex = (val: string) => {
    const h = val.startsWith("#") ? val : "#" + val;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(h)) setCustomHex(h);
  };

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    if (variant.images.length + files.length > 6) {
      alert("อัปโหลดรูปต่อสีได้สูงสุด 6 รูป");
      return;
    }
    onUpdate({ ...variant, uploading: true });
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("productId", productId);
        form.append("colorName", variant.name);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) {
          const err = await res.json();
          alert(`อัปโหลดล้มเหลว: ${err.error ?? "unknown"}`);
          break;
        }
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
      }
    } finally {
      onUpdate({ ...variant, images: [...variant.images, ...uploaded], uploading: false });
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeImage(idx: number) {
    const url = variant.images[idx];
    onUpdate({ ...variant, images: variant.images.filter((_, i) => i !== idx) });
    if (url?.includes("r2.dev")) {
      await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        {/* Color swatch — click to pick */}
        <button
          type="button"
          className="h-7 w-7 rounded-full border-2 border-gray-200 shadow-sm flex-shrink-0 hover:scale-110 transition-transform"
          style={{ backgroundColor: variant.hex }}
          onClick={() => setPickColor((v) => !v)}
          title="เปลี่ยนสี"
        />

        {/* Name */}
        <Input
          value={variant.name}
          onChange={(e) => onUpdate({ ...variant, name: e.target.value })}
          placeholder="ชื่อสี"
          className="h-8 flex-1 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {/* Stock per variant */}
        {productSizes.length > 0 ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-gray-400">รวม</span>
            <div className="h-8 w-16 text-sm text-center flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 font-medium tabular-nums">
              {(variant.sizeStocks ?? []).reduce((s, ss) => s + ss.stock, 0)}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-gray-400">Stock</span>
            <Input
              type="number"
              min="0"
              value={String(variant.stock)}
              onChange={(e) => onUpdate({ ...variant, stock: Number(e.target.value) || 0 })}
              className="h-8 w-20 text-sm text-center"
            />
          </div>
        )}

        <button type="button" onClick={() => setOpen((v) => !v)} className="text-gray-400 hover:text-gray-600">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Color picker panel */}
      {pickColor && (
        <div className="border-b border-gray-100 bg-white p-4 space-y-3">
          <p className="text-xs font-medium text-gray-500">สีที่นิยม</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                title={p.name}
                onClick={() => { onUpdate({ ...variant, name: variant.name || p.name, hex: p.hex }); setCustomHex(p.hex); setPickColor(false); }}
                className={cn("h-6 w-6 rounded-full border-2 hover:scale-110 transition-transform", variant.hex === p.hex ? "border-blue-500" : "border-gray-200")}
                style={{ backgroundColor: p.hex }}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-gray-500 pt-1">กำหนดเอง</p>
          <HexColorPicker color={customHex} onChange={(h) => { setCustomHex(h); onUpdate({ ...variant, hex: h }); }} style={{ width: "100%", height: 140 }} />
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-md border" style={{ backgroundColor: customHex }} />
            <Input value={customHex} onChange={(e) => { syncHex(e.target.value); onUpdate({ ...variant, hex: customHex }); }} className="w-24 font-mono text-xs uppercase" maxLength={7} />
            <Button type="button" size="sm" variant="outline" onClick={() => setPickColor(false)}>ตกลง</Button>
          </div>
        </div>
      )}

      {/* Image area */}
      {open && (
        <div className="p-4 space-y-3">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => uploadImages(e.target.files)} />

          <div className="grid grid-cols-3 gap-2">
            {variant.images.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white">
                <Image src={src} alt={`${variant.name}-${i}`} fill className="object-cover" unoptimized />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-black/50 px-1 py-0.5 text-[9px] text-white leading-none">หลัก</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {variant.images.length < 6 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={variant.uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center gap-1 text-gray-300 hover:border-gray-400 hover:text-gray-400 transition-colors disabled:opacity-50"
              >
                {variant.uploading
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : <ImagePlus className="h-5 w-5" />
                }
                <span className="text-[10px]">{variant.uploading ? "กำลังอัปโหลด" : "เพิ่มรูป"}</span>
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400">รูปแรก = ภาพหลักของสีนี้ · สูงสุด 6 รูป / สี</p>

          {/* Size stock grid */}
          {productSizes.length > 0 && (
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-xs font-medium text-gray-500">Stock แต่ละไซส์ (EU) — สี{variant.name || "นี้"}</p>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(productSizes.length, 6)}, minmax(0, 1fr))` }}>
                {productSizes.map((size) => {
                  const ss = (variant.sizeStocks ?? []).find((s) => s.size === size);
                  return (
                    <div key={size} className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-gray-400 font-medium">{size}</span>
                      <Input
                        type="number"
                        min="0"
                        value={String(ss?.stock ?? 0)}
                        onChange={(e) => {
                          const newStock = Number(e.target.value) || 0;
                          const prev = (variant.sizeStocks ?? []).filter((s) => s.size !== size);
                          const updated = newStock > 0 ? [...prev, { size, stock: newStock }] : prev;
                          const sorted  = updated.sort((a, b) => a.size - b.size);
                          const total   = sorted.reduce((s, x) => s + x.stock, 0);
                          onUpdate({ ...variant, sizeStocks: sorted, stock: total });
                        }}
                        className="h-8 text-center text-xs p-1 w-full"
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400">
                รวมสี{variant.name || "นี้"}: <span className="font-medium text-gray-600">{(variant.sizeStocks ?? []).reduce((s, ss) => s + ss.stock, 0)} ชิ้น</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────
export function ProductPageForm({ product }: ProductPageFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  // Basic fields
  const [name,          setName]          = useState(product?.name          ?? "");
  const [nameEn,        setNameEn]        = useState(product?.nameEn        ?? "");
  const [sku,           setSku]           = useState(product?.sku           ?? "");
  const [category,      setCategory]      = useState(product?.category      ?? "");
  const [price,         setPrice]         = useState(String(product?.price  ?? ""));
  const [costPrice,     setCostPrice]     = useState(String(product?.costPrice ?? ""));
  const [stock,         setStock]         = useState(String(product?.stock  ?? ""));
  const [description,   setDescription]   = useState(product?.description   ?? "");
  const [descriptionEn, setDescriptionEn] = useState(product?.descriptionEn ?? "");
  const [isActive,         setIsActive]         = useState(product?.isActive         ?? true);
  const [featured,         setFeatured]         = useState(product?.featured         ?? false);
  const [sizes,            setSizes]            = useState<number[]>(product?.sizes ?? []);
  const [materials,        setMaterials]        = useState(product?.materials        ?? "");
  const [fitSizing,        setFitSizing]        = useState(product?.fitSizing        ?? "");
  const [careInstructions, setCareInstructions] = useState(product?.careInstructions ?? "");

  // Main image (no variants)
  const [mainImages,    setMainImages]    = useState<string[]>(
    product?.colorVariants?.length ? [] : (product?.imageUrl ? [product.imageUrl] : [])
  );
  const [mainUploading, setMainUploading] = useState(false);
  const mainFileRef = useRef<HTMLInputElement>(null);

  // Color variants
  const initVariants = (): VariantDraft[] =>
    (product?.colorVariants ?? []).map((v, i) => ({ ...v, _key: `${i}-${Date.now()}` }));
  const [variants,    setVariants]    = useState<VariantDraft[]>(initVariants);
  const [showPicker,  setShowPicker]  = useState(false);
  const [pickerHex,   setPickerHex]   = useState("#3B82F6");
  const [pickerName,  setPickerName]  = useState("");

  // Categories
  const [categories,  setCategories]  = useState<{ name: string }[]>([]);

  // Save
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/categories?limit=100&status=active")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(console.error);
  }, []);

  // ── Main image upload (no variants) ──────────────────────────────────────
  async function uploadMainImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (mainImages.length + files.length > 8) { alert("อัปโหลดได้สูงสุด 8 รูป"); return; }
    setMainUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        form.append("productId", product?.id ?? "new");
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) {
          const err = await res.json();
          alert(`อัปโหลดล้มเหลว: ${err.error ?? "unknown"}`);
          break;
        }
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
      }
    } finally {
      setMainImages((prev) => [...prev, ...uploaded].slice(0, 8));
      setMainUploading(false);
      if (mainFileRef.current) mainFileRef.current.value = "";
    }
  }

  async function removeMainImage(idx: number) {
    const url = mainImages[idx];
    setMainImages((prev) => prev.filter((_, i) => i !== idx));
    if (url?.includes("r2.dev")) {
      await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    }
  }

  // ── Add variant ────────────────────────────────────────────────────────────
  function addVariant(hex: string, name: string) {
    const n = name.trim() || hex.toUpperCase();
    if (variants.find((v) => v.name === n)) return;
    setVariants((prev) => [...prev, { _key: `${Date.now()}`, name: n, hex, images: [], stock: 0, sizeStocks: [] }]);
    setPickerName(""); setPickerHex("#3B82F6"); setShowPicker(false);
  }

  function addPreset(p: { name: string; hex: string }) {
    if (!variants.find((v) => v.name === p.name))
      setVariants((prev) => [...prev, { _key: `${Date.now()}-${p.name}`, ...p, images: [], stock: 0, sizeStocks: [] }]);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    setFormError("");
    if (!name.trim())   { setFormError("กรุณากรอกชื่อสินค้า (TH)"); return; }
    if (!nameEn.trim()) { setFormError("กรุณากรอกชื่อสินค้า (EN)"); return; }
    if (!sku.trim())    { setFormError("กรุณากรอก SKU"); return; }
    if (!category)      { setFormError("กรุณาเลือกหมวดหมู่"); return; }
    if (!price || Number(price) <= 0) { setFormError("กรุณากรอกราคาขาย"); return; }

    const cleanVariants: ColorVariant[] = variants.map(({ _key, uploading, ...v }) => {
      void _key; void uploading; return v;
    });

    const variantStockTotal = cleanVariants.reduce((s, v) => {
      const fromSizes = (v.sizeStocks ?? []).reduce((ss, x) => ss + x.stock, 0);
      return s + (fromSizes > 0 ? fromSizes : (v.stock ?? 0));
    }, 0);
    const firstVariantImg   = cleanVariants[0]?.images?.[0] ?? "";
    const firstMainImg      = mainImages[0] ?? "";

    const payload = {
      name:          name.trim(),
      nameEn:        nameEn.trim(),
      sku:           sku.trim().toUpperCase(),
      category,
      price:         Number(price),
      costPrice:     costPrice ? Number(costPrice) : undefined,
      stock:         variantStockTotal > 0 ? variantStockTotal : (Number(stock) || 0),
      description:   description.trim(),
      descriptionEn: descriptionEn.trim(),
      imageUrl:         firstVariantImg || firstMainImg,
      isActive,
      featured,
      colorVariants:    cleanVariants,
      sizes,
      materials:        materials.trim(),
      fitSizing:        fitSizing.trim(),
      careInstructions: careInstructions.trim(),
    };

    setSaving(true);
    try {
      const url    = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setFormError(err.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      router.push("/products");
      router.refresh();
    } catch {
      setFormError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  const hasVariants = variants.length > 0;
  const thumbnail   = variants[0]?.images?.[0] || mainImages[0] || "";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-100 bg-white/95 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />กลับ
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800">
            {isEdit ? `แก้ไข: ${product.name}` : "เพิ่มสินค้าใหม่"}
          </span>
          {isEdit && <Badge variant="default" className="text-xs">{product.sku}</Badge>}
        </div>
        <div className="flex items-center gap-3">
          {formError && <p className="text-xs text-red-500 max-w-xs truncate">{formError}</p>}
          <Button variant="outline" size="sm" onClick={() => router.back()} disabled={saving}>ยกเลิก</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ข้อมูลพื้นฐาน */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <p className="text-sm font-semibold text-gray-700">ข้อมูลสินค้า</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>ชื่อสินค้า (TH) <span className="text-red-500">*</span></Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อสินค้าภาษาไทย" />
                </div>
                <div className="space-y-1.5">
                  <Label>ชื่อสินค้า (EN) <span className="text-red-500">*</span></Label>
                  <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Product name in English" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>รหัสสินค้า (SKU) <span className="text-red-500">*</span></Label>
                  <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="TSH-001" className="uppercase" />
                </div>
                <div className="space-y-1.5">
                  <Label>หมวดหมู่ <span className="text-red-500">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
                    <SelectContent>
                      {categories.length === 0
                        ? <SelectItem value="_none" disabled>ยังไม่มีหมวดหมู่</SelectItem>
                        : categories.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ── Sizes ────────────────────────────────────────────────── */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">ไซส์ที่มี (EU)</p>
                  <p className="text-xs text-gray-400 mt-0.5">คลิกเลือก/ยกเลิก · สีเข้ม = เลือกแล้ว</p>
                </div>
                {sizes.length > 0 && (
                  <button type="button" onClick={() => setSizes([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    ล้างทั้งหมด
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[35,36,37,38,39,40,41,42,43,44,45,46].map((s) => {
                  const on = sizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSizes((prev) => on ? prev.filter((x) => x !== s) : [...prev, s].sort((a,b)=>a-b))}
                      className={cn(
                        "h-10 w-12 rounded text-sm font-medium border transition-all",
                        on
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-500 hover:text-gray-700"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">
                {sizes.length > 0
                  ? <><span className="font-medium">เลือกแล้ว:</span> EU {sizes.join(", ")}</>
                  : "ยังไม่ได้เลือกไซส์"}
              </p>
            </div>

            {/* รายละเอียด */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <p className="text-sm font-semibold text-gray-700">รายละเอียดสินค้า</p>
              <div className="space-y-1.5">
                <Label>รายละเอียด (TH)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="รายละเอียดสินค้าภาษาไทย" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>รายละเอียด (EN)</Label>
                <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Product description in English" rows={3} />
              </div>
            </div>

            {/* ราคา & สต็อก */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <p className="text-sm font-semibold text-gray-700">ราคา & สต็อก</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>ราคาทุน (บาท)</Label>
                  <Input type="number" min="0" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>ราคาขาย (บาท) <span className="text-red-500">*</span></Label>
                  <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    {hasVariants ? "Stock รวม (คำนวณจากสี)" : "จำนวน Stock"}
                  </Label>
                  <Input
                    type="number" min="0"
                    value={hasVariants
                      ? String(variants.reduce((s, v) => s + (v.stock ?? 0), 0))
                      : stock
                    }
                    onChange={(e) => !hasVariants && setStock(e.target.value)}
                    placeholder="0"
                    readOnly={hasVariants}
                    className={hasVariants ? "bg-gray-50 text-gray-400" : ""}
                  />
                  {hasVariants && (
                    <p className="text-xs text-gray-400">ตั้ง stock แต่ละสีที่ card ด้านล่าง</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Product Details (Accordions) ──────────────────────────── */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">รายละเอียดเพิ่มเติม</p>
                <p className="text-xs text-gray-400 mt-0.5">แสดงในส่วน Accordion บนหน้าสินค้า</p>
              </div>
              <div className="space-y-1.5">
                <Label>Materials & Construction</Label>
                <Textarea
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="Upper: Lambskin Suede · Lining: Full kid leather · Sole: Handwelted Italian leather"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fit & Sizing</Label>
                <Textarea
                  value={fitSizing}
                  onChange={(e) => setFitSizing(e.target.value)}
                  placeholder="Runs true to size. For a half size, we recommend sizing up."
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Care Instructions</Label>
                <Textarea
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  placeholder="Use a soft suede brush in one direction after each wear. Store away from heat and moisture."
                  rows={3}
                />
              </div>
            </div>

            {/* ── Color Variants ────────────────────────────────────────── */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-gray-400" />
                    สีสินค้า & รูปภาพ
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">แต่ละสีมีรูปและ stock ของตัวเอง</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPicker((v) => !v)}>
                  <Plus className="h-3.5 w-3.5" />เพิ่มสี
                </Button>
              </div>

              {/* Picker panel */}
              {showPicker && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <p className="text-xs font-medium text-gray-500">สีที่นิยม — คลิกเพื่อเพิ่ม</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        title={p.name}
                        onClick={() => addPreset(p)}
                        className={cn(
                          "h-7 w-7 rounded-full border-2 hover:scale-110 transition-transform",
                          variants.find((v) => v.name === p.name) ? "border-blue-500 opacity-50" : "border-gray-200"
                        )}
                        style={{ backgroundColor: p.hex }}
                      />
                    ))}
                  </div>

                  <p className="text-xs font-medium text-gray-500 pt-1">กำหนดสีเอง</p>
                  <HexColorPicker color={pickerHex} onChange={setPickerHex} style={{ width: "100%", height: 140 }} />
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 flex-shrink-0 rounded-md border border-gray-200" style={{ backgroundColor: pickerHex }} />
                    <Input value={pickerHex} onChange={(e) => { const h = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(h)) setPickerHex(h); }} className="w-24 font-mono text-xs uppercase" maxLength={7} />
                    <Input value={pickerName} onChange={(e) => setPickerName(e.target.value)} placeholder="ชื่อสี (ไม่บังคับ)" className="flex-1 text-sm" onKeyDown={(e) => e.key === "Enter" && addVariant(pickerHex, pickerName)} />
                    <Button type="button" size="sm" onClick={() => addVariant(pickerHex, pickerName)}>เพิ่ม</Button>
                    <Button type="button" size="sm" variant="ghost" className="px-2" onClick={() => setShowPicker(false)}><X className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}

              {/* Variant cards */}
              {variants.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                  ยังไม่มีสี — กด &quot;เพิ่มสี&quot; หรือใช้รูปภาพหลักด้านขวา
                </div>
              ) : (
                <div className="space-y-3">
                  {variants.map((v) => (
                    <VariantCard
                      key={v._key}
                      variant={v}
                      productId={product?.id ?? "new"}
                      productSizes={sizes}
                      onUpdate={(updated) => setVariants((prev) => prev.map((x) => x._key === v._key ? updated : x))}
                      onRemove={() => setVariants((prev) => prev.filter((x) => x._key !== v._key))}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Thumbnail preview */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
              <p className="text-sm font-semibold text-gray-700">รูปภาพหลัก</p>

              {hasVariants ? (
                /* Show first variant image as thumbnail */
                <div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    {thumbnail ? (
                      <Image src={thumbnail} alt="thumbnail" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-300">
                        <ImagePlus className="h-8 w-8" />
                        <p className="text-xs">อัปโหลดรูปในแต่ละสีด้านซ้าย</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    รูปหลัก = รูปแรกของสีแรก
                  </p>
                </div>
              ) : (
                /* No variants — general image upload */
                <div className="space-y-3">
                  <input ref={mainFileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={uploadMainImages} />

                  {/* Main slot */}
                  <div
                    className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-colors"
                    onClick={() => !mainUploading && mainFileRef.current?.click()}
                  >
                    {mainImages[0] ? (
                      <>
                        <Image src={mainImages[0]} alt="main" fill className="object-cover" unoptimized />
                        <span className="absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">หลัก</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeMainImage(0); }}
                          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                        {mainUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImagePlus className="h-8 w-8" />}
                        <p className="text-xs">{mainUploading ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลด"}</p>
                      </div>
                    )}
                  </div>

                  {/* Extra thumbnails */}
                  {mainImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {mainImages.slice(1).map((src, i) => (
                        <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                          <Image src={src} alt={`extra-${i}`} fill className="object-cover" unoptimized />
                          <button type="button" onClick={() => removeMainImage(i + 1)}
                            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                      {mainImages.length < 8 && (
                        <button type="button" onClick={() => mainFileRef.current?.click()} disabled={mainUploading}
                          className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-gray-400 hover:text-gray-400 transition-colors disabled:opacity-50">
                          <ImagePlus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full gap-1.5"
                    disabled={mainUploading || mainImages.length >= 8}
                    onClick={() => mainFileRef.current?.click()}
                  >
                    {mainUploading ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังอัปโหลด...</> : <><ImagePlus className="h-4 w-4" />อัปโหลดรูปภาพ</>}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">JPEG, PNG, WebP · สูงสุด 5 MB / รูป</p>
                </div>
              )}
            </div>

            {/* การแสดงผล */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <p className="text-sm font-semibold text-gray-700">การแสดงผล</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">แสดงสินค้า</p>
                  <p className="text-xs text-gray-400">เปิด/ปิด การมองเห็นในร้าน</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">สินค้าแนะนำ</p>
                  <p className="text-xs text-gray-400">แสดงในส่วน Featured</p>
                </div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
            </div>

            {/* Error */}
            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
