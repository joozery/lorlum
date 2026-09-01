"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Globe, RefreshCw } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SaveBar } from "./save-bar";

const RATES = [
  { from: "THB", to: "USD", flag: "🇺🇸", rate: "0.0290" },
  { from: "THB", to: "EUR", flag: "🇪🇺", rate: "0.0264" },
  { from: "THB", to: "SGD", flag: "🇸🇬", rate: "0.0381" },
  { from: "THB", to: "GBP", flag: "🇬🇧", rate: "0.0228" },
];

export function CurrencySettings() {
  return (
    <div className="space-y-5">
      {/* สกุลเงินหลัก */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">สกุลเงินหลัก</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>สกุลเงิน</Label>
            <Select defaultValue="THB">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="THB">🇹🇭 THB — บาทไทย</SelectItem>
                <SelectItem value="USD">🇺🇸 USD — US Dollar</SelectItem>
                <SelectItem value="EUR">🇪🇺 EUR — Euro</SelectItem>
                <SelectItem value="SGD">🇸🇬 SGD — Singapore Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>รูปแบบตัวเลข</Label>
            <Select defaultValue="dot">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dot">1,234.56</SelectItem>
                <SelectItem value="comma">1.234,56</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="autoDetect" defaultChecked />
          <div>
            <Label htmlFor="autoDetect">ตรวจสอบประเทศลูกค้าอัตโนมัติ</Label>
            <p className="text-xs text-gray-400 mt-0.5">กำหนดสกุลเงินจาก IP ของลูกค้า</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="allowSwitch" defaultChecked />
          <Label htmlFor="allowSwitch">ให้ลูกค้าเลือกสกุลเงินเอง</Label>
        </div>
      </div>

      {/* อัตราแลกเปลี่ยน */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">อัตราแลกเปลี่ยน</h3>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> ดึงอัตราอัตโนมัติ
          </Button>
        </div>
        <div className="space-y-3">
          {RATES.map((r) => (
            <div key={r.to} className="flex items-center gap-3">
              <span className="text-base w-6">{r.flag}</span>
              <span className="text-xs text-gray-500 w-8 font-mono">{r.to}</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-gray-400">1 THB =</span>
                <Input className="w-28 text-right font-mono text-xs" defaultValue={r.rate} />
                <span className="text-xs text-gray-500">{r.to}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Globe className="h-3 w-3" /> อัปเดตล่าสุด: วันนี้ 09:00 น.
        </p>
      </div>

      <SaveBar />
    </div>
  );
}
