"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, ExternalLink } from "lucide-react";

interface Bilingual { en: string; th: string }
interface ShippingCopyData {
  deliveryTitle: Bilingual;
  deliveryDesc: Bilingual;
  cartNote: Bilingual;
  accordShippingBody: Bilingual;
}

const DEFAULT: ShippingCopyData = {
  deliveryTitle: {
    en: "Complimentary Insured Delivery",
    th: "จัดส่งฟรีพร้อมประกัน",
  },
  deliveryDesc: {
    en: "EMS within Thailand — arrives 2–3 working days. International by DHL Express.",
    th: "EMS ในไทย — ได้รับสินค้า 2–3 วันทำการ ต่างประเทศทาง DHL Express",
  },
  cartNote: {
    en: "Complimentary insured EMS within Thailand. Secure SSL payment.",
    th: "จัดส่ง EMS ในไทยพร้อมประกัน ชำระเงินผ่าน SSL ปลอดภัย",
  },
  accordShippingBody: {
    en: "Complimentary insured EMS within Thailand (2–3 working days). International by DHL Express. Returns accepted within 14 days in unworn condition.",
    th: "จัดส่ง EMS ในประเทศไทย (2–3 วันทำการ) พร้อมประกัน ต่างประเทศทาง DHL Express คืนสินค้าได้ภายใน 14 วัน ในสภาพที่ไม่ได้ใช้",
  },
};

const FIELDS: { key: keyof ShippingCopyData; label: string; hint: string; multiline?: boolean }[] = [
  { key: "deliveryTitle", label: "หัวข้อจัดส่ง", hint: "แสดงในหน้ารายละเอียดสินค้า" },
  { key: "deliveryDesc", label: "คำอธิบายจัดส่ง", hint: "แสดงในหน้ารายละเอียดสินค้า", multiline: true },
  { key: "cartNote", label: "ข้อความในตะกร้า", hint: "แสดงใต้ยอดรวมในหน้าตะกร้า", multiline: true },
  { key: "accordShippingBody", label: "เนื้อหา Accordion จัดส่ง", hint: "แสดงเมื่อกดเปิด \"Shipping\" ในหน้าสินค้า", multiline: true },
];

export function ShippingSettings() {
  const [data, setData]     = useState<ShippingCopyData>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.shippingCopy) setData({ ...DEFAULT, ...d.shippingCopy });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function setField(key: keyof ShippingCopyData, lang: "en" | "th", value: string) {
    setData((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: value } }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingCopy: data }),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Shipping & Delivery</h2>
          <p className="text-xs text-gray-500 mt-0.5">ข้อความเรื่องการจัดส่งที่แสดงในหน้าสินค้าและตะกร้า</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/collection"
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

      {/* Fields */}
      {FIELDS.map(({ key, label, hint, multiline }) => (
        <div key={key} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">English</label>
              {multiline ? (
                <textarea
                  value={data[key].en}
                  onChange={(e) => setField(key, "en", e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all resize-none"
                />
              ) : (
                <input
                  value={data[key].en}
                  onChange={(e) => setField(key, "en", e.target.value)}
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">ภาษาไทย</label>
              {multiline ? (
                <textarea
                  value={data[key].th}
                  onChange={(e) => setField(key, "th", e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all resize-none"
                />
              ) : (
                <input
                  value={data[key].th}
                  onChange={(e) => setField(key, "th", e.target.value)}
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
