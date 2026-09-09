"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function GeneralSettings() {
  const [faviconUrl,    setFaviconUrl]    = useState("");
  const [uploading,     setUploading]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => { if (d.faviconUrl) setFaviconUrl(d.faviconUrl); })
      .catch(() => {});
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("productId", "favicon");
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) setFaviconUrl(data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faviconUrl }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Favicon */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Favicon (ไอคอนแท็บ Browser)</h3>
          <p className="text-xs text-gray-400 mt-0.5">แนะนำ: PNG / SVG / ICO ขนาด 64×64 ขึ้นไป</p>
        </div>
        <div className="flex items-center gap-5">
          {/* Preview */}
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
            {faviconUrl ? (
              <Image src={faviconUrl} alt="favicon preview" width={48} height={48} className="object-contain" unoptimized />
            ) : (
              <span className="text-[10px] text-gray-300 text-center leading-tight px-1">No icon</span>
            )}
          </div>

          {/* Upload + URL */}
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Input
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="https://... หรืออัปโหลดด้านล่าง"
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="shrink-0"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span className="ml-1.5 text-xs">อัปโหลด</span>
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  e.target.value = "";
                }}
              />
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !faviconUrl}
              className="w-full"
            >
              {saved ? (
                <><Check className="h-3.5 w-3.5 mr-1.5" /> บันทึกแล้ว</>
              ) : saving ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> กำลังบันทึก…</>
              ) : (
                "บันทึก Favicon"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ข้อมูลร้านค้า */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">ข้อมูลร้านค้า</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>ชื่อร้าน (TH)</Label>
            <Input defaultValue="ร้านของฉัน" />
          </div>
          <div className="space-y-1.5">
            <Label>Shop Name (EN)</Label>
            <Input defaultValue="My Shop" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>อีเมลร้านค้า</Label>
          <Input type="email" defaultValue="shop@example.com" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>เบอร์โทรศัพท์</Label>
            <Input defaultValue="02-000-0000" />
          </div>
          <div className="space-y-1.5">
            <Label>เว็บไซต์</Label>
            <Input defaultValue="https://myshop.com" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>ที่อยู่ร้านค้า</Label>
          <Input defaultValue="กรุงเทพมหานคร 10100" />
        </div>
      </div>

      {/* ภาษา */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">ภาษา & โซนเวลา</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>ภาษาเริ่มต้น</Label>
            <Select defaultValue="th">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="th">🇹🇭 ภาษาไทย</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>โซนเวลา</Label>
            <Select defaultValue="asia_bangkok">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asia_bangkok">Asia/Bangkok (UTC+7)</SelectItem>
                <SelectItem value="asia_singapore">Asia/Singapore (UTC+8)</SelectItem>
                <SelectItem value="utc">UTC (UTC+0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="multiLang" defaultChecked />
          <div>
            <Label htmlFor="multiLang">เปิดใช้งานหลายภาษา</Label>
            <p className="text-xs text-gray-400 mt-0.5">แสดง TH / EN toggle ในหน้าร้านค้า</p>
          </div>
        </div>
      </div>
    </div>
  );
}
