"use client";

import { useState, useEffect } from "react";
import { Globe, RefreshCw, Loader2, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ALL_CURRENCIES, CURRENCY_META, StoreCurrency } from "@/lib/currencies";

interface CurrencySettingsData {
  enabledCurrencies: StoreCurrency[];
  allowCustomerSwitch: boolean;
}

export function CurrencySettings() {
  const [data, setData]       = useState<CurrencySettingsData | null>(null);
  const [rates, setRates]     = useState<Record<string, number>>({});
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  function loadRates() {
    return fetch("/api/store/exchange-rate")
      .then((r) => r.json())
      .then((d) => {
        if (d?.rates) setRates(d.rates);
        if (d?.updatedAt) setRatesUpdatedAt(d.updatedAt);
      })
      .catch(() => {});
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/currency-settings").then(async (r) => {
        if (r.status === 401) { setError("กรุณาเข้าสู่ระบบใหม่"); return null; }
        if (!r.ok) { setError("โหลดข้อมูลล้มเหลว"); return null; }
        return r.json();
      }),
      loadRates(),
    ])
      .then(([d]) => { if (d) setData(d); })
      .catch(() => setError("โหลดข้อมูลล้มเหลว"))
      .finally(() => setLoading(false));
  }, []);

  function toggleCurrency(c: StoreCurrency) {
    if (!data || c === "THB") return;
    const enabled = data.enabledCurrencies.includes(c)
      ? data.enabledCurrencies.filter((x) => x !== c)
      : [...data.enabledCurrencies, c];
    setData({ ...data, enabledCurrencies: enabled });
  }

  async function handleRefreshRates() {
    setRefreshing(true);
    await loadRates();
    setRefreshing(false);
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/currency-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 401) { setError("กรุณาเข้าสู่ระบบใหม่"); return; }
      if (!res.ok) { setError("บันทึกล้มเหลว"); return; }
      const next = await res.json();
      setData(next);
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

  if (error && !data) {
    return <p className="text-sm text-red-600 py-10 text-center">{error}</p>;
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* คำอธิบายการทำงาน */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-blue-500" /> การแปลงสกุลเงินตรงนี้ทำงานยังไง
        </h3>
        <ul className="text-xs text-gray-600 space-y-1.5 leading-relaxed list-disc pl-4">
          <li>ราคาสินค้าทั้งหมด<strong>เก็บเป็นบาทไทย (THB) เสมอ</strong> ไม่มีการเปลี่ยนราคาจริงในระบบ</li>
          <li>สกุลเงินอื่นที่เห็นในหน้าร้านเป็นแค่ <strong>การแปลงเพื่อแสดงผล</strong> — คำนวณจากอัตราแลกเปลี่ยนสดที่ดึงจากอินเทอร์เน็ตอัตโนมัติ (ไม่ต้องตั้งอัตราเอง) แคชไว้ 1 ชั่วโมงต่อครั้งเพื่อไม่ให้ยิงขอข้อมูลถี่เกินไป</li>
          <li>ลูกค้าเลือกสกุลเงินที่จะดูได้จาก dropdown ที่แถบเมนูบนหน้าร้าน — เลือกแล้วจะจำไว้ในเบราว์เซอร์ของลูกค้าคนนั้น</li>
          <li>ติ๊กเปิด/ปิดสกุลเงินด้านล่างเพื่อกำหนดว่าจะมีตัวเลือกไหนให้ลูกค้าเลือกบ้าง และปิดสวิตช์ "ให้ลูกค้าเลือกสกุลเงินเอง" ได้ถ้าไม่ต้องการให้มี dropdown นี้เลย (จะแสดงบาทอย่างเดียว)</li>
          <li><strong>การชำระเงินจริงยังคิดเป็นบาทเสมอ</strong> (ผ่าน Stripe) ไม่ว่าลูกค้าจะดูราคาเป็นสกุลไหนอยู่ก็ตาม — ไม่ใช่ multi-currency checkout เต็มรูปแบบ</li>
        </ul>
      </div>

      {/* สกุลเงินที่เปิดใช้งาน */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">สกุลเงินที่เปิดใช้งาน</h3>
        <div className="space-y-2.5">
          {ALL_CURRENCIES.map((c) => (
            <label key={c} className={`flex items-center gap-3 ${c === "THB" ? "opacity-60" : "cursor-pointer"}`}>
              <input
                type="checkbox"
                checked={data.enabledCurrencies.includes(c)}
                disabled={c === "THB"}
                onChange={() => toggleCurrency(c)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-base">{CURRENCY_META[c].flag}</span>
              <span className="text-sm text-gray-800 font-mono">{c}</span>
              {c === "THB" && <span className="text-[10px] text-gray-400">(สกุลเงินหลัก — เปิดเสมอ)</span>}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Switch checked={data.allowCustomerSwitch} onCheckedChange={(v) => setData({ ...data, allowCustomerSwitch: v })} />
          <Label>ให้ลูกค้าเลือกสกุลเงินเอง</Label>
        </div>
      </div>

      {/* อัตราแลกเปลี่ยน (อ่านอย่างเดียว — ดึงจาก API จริง) */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">อัตราแลกเปลี่ยน (เรียลไทม์)</h3>
          <button
            onClick={handleRefreshRates}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> ดึงอัตราล่าสุด
          </button>
        </div>
        <div className="space-y-3">
          {ALL_CURRENCIES.filter((c) => c !== "THB").map((c) => (
            <div key={c} className="flex items-center gap-3">
              <span className="text-base w-6">{CURRENCY_META[c].flag}</span>
              <span className="text-xs text-gray-500 w-8 font-mono">{c}</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-gray-400">1 THB =</span>
                <span className="font-mono text-xs text-gray-800">
                  {rates[c] != null ? rates[c].toFixed(4) : "—"}
                </span>
                <span className="text-xs text-gray-500">{c}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {ratesUpdatedAt ? `อัปเดตล่าสุด: ${new Date(ratesUpdatedAt).toLocaleString("th-TH")}` : "ยังไม่มีข้อมูลอัตราแลกเปลี่ยน"}
        </p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex justify-end">
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
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-gray-800">{children}</span>;
}
