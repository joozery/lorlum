"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Upload, Trash2, ExternalLink, Loader2, Check, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface HeroData {
  bgImages: string[];
  headingLine1: string;
  headingLine2: string;
  subtext: string;
  ctaLabel: string;
  badge: string;
}

const DEFAULT: HeroData = {
  bgImages: [],
  headingLine1: "Linen",
  headingLine2: "Collection",
  subtext: "Thomas Mason Gold Linen, hand-lasted by masterpiece artisans on the exclusive private curated.",
  ctaLabel: "Explore the Collection",
  badge: "Season 2026 · Exclusive Release",
};

export function HeroSettings() {
  const [data, setData]           = useState<HeroData>(DEFAULT);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/site-settings")
      .then(r => r.json())
      .then(d => {
        if (d.hero) {
          // migrate legacy single bgImageUrl → bgImages array
          const h = d.hero as Record<string, unknown>;
          const imgs: string[] = Array.isArray(h.bgImages)
            ? (h.bgImages as string[]).filter(Boolean)
            : h.bgImageUrl
            ? [h.bgImageUrl as string]
            : [];
          setData({ ...DEFAULT, ...h, bgImages: imgs });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function setText(field: keyof Omit<HeroData, "bgImages">, value: string) {
    setData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("productId", "hero");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) { alert("อัปโหลดล้มเหลว"); return; }
      const { url } = await res.json();
      setData(prev => {
        const next = { ...prev, bgImages: [...prev.bgImages, url] };
        setPreviewIdx(next.bgImages.length - 1);
        return next;
      });
      setSaved(false);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove(idx: number) {
    const url = data.bgImages[idx];
    setData(prev => {
      const next = prev.bgImages.filter((_, i) => i !== idx);
      setPreviewIdx(p => Math.min(p, next.length - 1));
      return { ...prev, bgImages: next };
    });
    setSaved(false);
    if (url?.includes("r2.dev")) {
      await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    }
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const next = [...data.bgImages];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setData(prev => ({ ...prev, bgImages: next }));
    setPreviewIdx(target);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero: data }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const previewImg = data.bgImages[previewIdx] ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Hero Section</h2>
          <p className="text-xs text-gray-500 mt-0.5">จัดการรูปพื้นหลังและข้อความหน้าหลักของร้านค้า</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            ดูหน้าบ้าน
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : null}
            {saved ? "บันทึกแล้ว" : "บันทึก"}
          </button>
        </div>
      </div>

      {/* Background images */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">รูปพื้นหลัง Hero</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {data.bgImages.length > 1
                ? `${data.bgImages.length} รูป · จะ slideshow อัตโนมัติบนหน้าบ้าน`
                : "เพิ่มได้หลายรูป — ระบบจะ slideshow อัตโนมัติ"}
            </p>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800 border border-violet-200 hover:border-violet-400 rounded-lg px-3 py-2 transition-all disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {uploading ? "กำลังอัปโหลด..." : "เพิ่มรูป"}
          </button>
        </div>

        {/* Image grid */}
        {data.bgImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {data.bgImages.map((url, idx) => (
              <div
                key={url}
                onClick={() => setPreviewIdx(idx)}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  idx === previewIdx ? "border-violet-500 shadow-md" : "border-gray-200 hover:border-gray-400"
                }`}
                style={{ aspectRatio: "16/9" }}
              >
                <Image src={url} alt={`Hero ${idx + 1}`} fill className="object-cover" unoptimized />
                {/* Order badge */}
                <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                  {idx + 1}
                </span>
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); moveImage(idx, -1); }}
                    disabled={idx === 0}
                    title="ย้ายซ้าย"
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleRemove(idx); }}
                    title="ลบรูป"
                    className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); moveImage(idx, 1); }}
                    disabled={idx === data.bgImages.length - 1}
                    title="ย้ายขวา"
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add more tile */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all disabled:opacity-50"
              style={{ aspectRatio: "16/9" }}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-[11px] text-gray-400">เพิ่มรูป</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 hover:border-gray-300 hover:bg-gray-100 transition-all disabled:opacity-60 mb-4"
          >
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
            ) : (
              <Upload className="h-7 w-7 text-gray-400" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">{uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปพื้นหลัง"}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WebP · แนะนำขนาด 1920×1080px ขึ้นไป</p>
            </div>
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
        <p className="text-[11px] text-gray-400">
          หากไม่มีรูป ระบบจะใช้ gradient สีน้ำตาลทองตามค่าเดิม · คลิกรูปเพื่อดู preview
        </p>
      </div>

      {/* Text fields */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">ข้อความ Hero</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Heading บรรทัด 1</label>
            <input
              value={data.headingLine1}
              onChange={e => setText("headingLine1", e.target.value)}
              className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
              placeholder="Linen"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Heading บรรทัด 2 <span className="text-gray-400">(italic)</span></label>
            <input
              value={data.headingLine2}
              onChange={e => setText("headingLine2", e.target.value)}
              className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
              placeholder="Collection"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Badge (บรรทัดบน)</label>
          <input
            value={data.badge}
            onChange={e => setText("badge", e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
            placeholder="Season 2026 · Exclusive Release"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Subtext</label>
          <textarea
            value={data.subtext}
            onChange={e => setText("subtext", e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all resize-none"
            placeholder="คำอธิบายสั้นๆ ใต้ headline"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">ปุ่ม CTA</label>
          <input
            value={data.ctaLabel}
            onChange={e => setText("ctaLabel", e.target.value)}
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
            placeholder="Explore the Collection"
          />
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Preview</h3>
          {data.bgImages.length > 1 && (
            <div className="flex items-center gap-1">
              {data.bgImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === previewIdx ? "bg-violet-500 w-4" : "bg-gray-300"}`}
                />
              ))}
            </div>
          )}
        </div>
        <div
          className="relative w-full overflow-hidden rounded-lg flex items-center justify-center"
          style={{
            aspectRatio: "16/7",
            background: "linear-gradient(155deg,#1A1208 0%,#2C1F0F 40%,#4A3219 75%,#6B4E2A 100%)",
          }}
        >
          {previewImg && (
            <Image src={previewImg} alt="preview" fill className="object-cover" unoptimized />
          )}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(26,18,8,0.6) 100%)" }} />
          <div className="relative z-10 text-center px-6">
            {data.badge && (
              <p className="text-[8px] tracking-[0.5em] uppercase text-amber-300/80 mb-3">{data.badge}</p>
            )}
            <h2 className="font-serif leading-tight text-white" style={{ fontSize: "clamp(22px,4vw,36px)" }}>
              <span className="block">{data.headingLine1 || "Linen"}</span>
              <span className="block italic text-amber-300">{data.headingLine2 || "Collection"}</span>
            </h2>
            {data.subtext && (
              <p className="mt-3 text-[10px] text-amber-100/60 max-w-[280px] mx-auto leading-relaxed">{data.subtext}</p>
            )}
            {data.ctaLabel && (
              <div className="mt-4 inline-block bg-amber-400 text-gray-900 text-[8px] tracking-[0.2em] uppercase px-6 py-2 font-medium">
                {data.ctaLabel}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
