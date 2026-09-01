"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, GripVertical, ExternalLink, CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DocType = "terms" | "privacy" | "cookies";
interface Section { title: string; body: string }

const DOCS: { type: DocType; label: string; path: string; desc: string }[] = [
  { type: "terms",   label: "เงื่อนไขการให้บริการ",  path: "/terms",   desc: "Terms of Service" },
  { type: "privacy", label: "นโยบายความเป็นส่วนตัว", path: "/privacy", desc: "Privacy Policy" },
  { type: "cookies", label: "นโยบายคุกกี้",           path: "/cookies", desc: "Cookie Policy" },
];

const DEFAULT_SECTIONS: Record<DocType, Section[]> = {
  terms: [
    { title: "1. การยอมรับข้อกำหนด", body: "การเข้าถึงหรือใช้งานเว็บไซต์ถือว่าท่านยอมรับข้อกำหนดและเงื่อนไขการให้บริการฉบับนี้ทุกประการ" },
    { title: "2. สินค้าและบริการ", body: "LORLUM จำหน่ายรองเท้าและเครื่องแต่งกายระดับ Luxury ที่ผลิตด้วยมือ" },
    { title: "3. การสั่งซื้อและชำระเงิน", body: "การสั่งซื้อจะสมบูรณ์เมื่อได้รับการยืนยันจาก LORLUM ทางอีเมล" },
    { title: "4. การจัดส่ง", body: "จัดส่งทั่วประเทศไทยผ่าน EMS (2–3 วันทำการ) พร้อมประกันการจัดส่ง" },
    { title: "5. การคืนสินค้าและเงิน", body: "รับคืนสินค้าภายใน 14 วันนับจากวันที่ได้รับ สินค้าต้องอยู่ในสภาพสมบูรณ์" },
  ],
  privacy: [
    { title: "1. ข้อมูลที่เราเก็บรวบรวม", body: "เราเก็บข้อมูลที่ท่านให้ไว้โดยตรง เช่น ชื่อ อีเมล เบอร์โทรศัพท์ และที่อยู่จัดส่ง" },
    { title: "2. วัตถุประสงค์การใช้ข้อมูล", body: "เราใช้ข้อมูลของท่านเพื่อประมวลผลและจัดส่งคำสั่งซื้อ และปรับปรุงบริการ" },
    { title: "3. การแบ่งปันข้อมูล", body: "เราไม่ขายข้อมูลส่วนบุคคลของท่าน เราแบ่งปันกับบุคคลที่สามเฉพาะในกรณีจำเป็น" },
  ],
  cookies: [
    { title: "คุกกี้จำเป็น", body: "คุกกี้เหล่านี้จำเป็นสำหรับการทำงานของเว็บไซต์ ไม่สามารถปิดได้" },
    { title: "คุกกี้วิเคราะห์", body: "ช่วยให้เราเข้าใจว่าผู้เยี่ยมชมใช้งานเว็บไซต์อย่างไร เพื่อปรับปรุงประสบการณ์" },
    { title: "คุกกี้การตลาด", body: "ใช้สำหรับแสดงโฆษณาที่เกี่ยวข้องและติดตามประสิทธิภาพของแคมเปญ" },
  ],
};

export default function LegalEditorPage() {
  const [activeDoc, setActiveDoc] = useState<DocType>("terms");
  const [sections,  setSections]  = useState<Section[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [dirty,     setDirty]     = useState(false);

  const load = useCallback(async (type: DocType) => {
    setLoading(true);
    const res  = await fetch(`/api/legal?type=${type}`);
    const data = await res.json();
    setSections(data.sections?.length ? data.sections : DEFAULT_SECTIONS[type]);
    setLoading(false);
    setDirty(false);
  }, []);

  useEffect(() => { load(activeDoc); }, [activeDoc, load]);

  const switchDoc = (type: DocType) => {
    if (dirty && !confirm("มีการเปลี่ยนแปลงที่ยังไม่บันทึก ต้องการออกไปหรือไม่?")) return;
    setActiveDoc(type);
  };

  const update = (i: number, field: keyof Section, val: string) => {
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
    setDirty(true);
  };

  const addSection = () => {
    setSections(prev => [...prev, { title: `${prev.length + 1}. หัวข้อใหม่`, body: "" }]);
    setDirty(true);
  };

  const removeSection = (i: number) => {
    setSections(prev => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  };

  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/legal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activeDoc, sections }),
    });
    setSaving(false);
    setSaveState("saved");
    setDirty(false);
    setTimeout(() => setSaveState("idle"), 2500);
  };

  const activeInfo = DOCS.find(d => d.type === activeDoc)!;

  return (
    <div className="space-y-4">
      {/* Doc tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {DOCS.map(d => (
            <button key={d.type} onClick={() => switchDoc(d.type)}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-all cursor-pointer border-none font-jost ${
                activeDoc === d.type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 bg-transparent"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a href={activeInfo.path} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors no-underline">
            <ExternalLink className="h-3.5 w-3.5" /> ดูหน้าจริง
          </a>
          <Button onClick={save} disabled={saving || !dirty} className="gap-1.5">
            {saveState === "saved"
              ? <><CheckCircle className="h-4 w-4" /> บันทึกแล้ว</>
              : <><Save className="h-4 w-4" /> {saving ? "กำลังบันทึก..." : "บันทึก"}</>}
          </Button>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5 text-xs text-blue-600">
        <span className="font-medium">{activeInfo.desc}</span>
        <span className="text-blue-300">·</span>
        <span className="text-blue-400">{activeInfo.path}</span>
        {dirty && <span className="ml-auto text-amber-500 font-medium">● มีการเปลี่ยนแปลง</span>}
      </div>

      {/* Editor */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
                <div className="flex flex-col gap-0.5 cursor-grab text-gray-300">
                  <GripVertical className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 w-16 shrink-0">
                  Section {i + 1}
                </span>
                <Input value={sec.title} onChange={e => update(i, "title", e.target.value)}
                  className="flex-1 h-7 text-sm font-medium border-none bg-transparent shadow-none px-2 focus-visible:ring-0"
                  placeholder="หัวข้อ..." />
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => moveSection(i, -1)} disabled={i === 0}
                    className="h-6 w-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 bg-transparent border-none cursor-pointer text-xs">↑</button>
                  <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1}
                    className="h-6 w-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 bg-transparent border-none cursor-pointer text-xs">↓</button>
                  <button onClick={() => removeSection(i)}
                    className="h-6 w-6 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 bg-transparent border-none cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <textarea value={sec.body} onChange={e => update(i, "body", e.target.value)}
                rows={4} placeholder="เนื้อหา..."
                className="w-full px-4 py-3 text-sm font-light text-gray-700 leading-relaxed resize-y border-none outline-none bg-transparent font-jost" />
            </div>
          ))}
          <button onClick={addSection}
            className="w-full flex items-center justify-center gap-2 h-11 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors cursor-pointer bg-transparent font-jost">
            <Plus className="h-4 w-4" /> เพิ่ม Section
          </button>
        </div>
      )}
    </div>
  );
}
