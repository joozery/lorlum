"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SaveBar } from "./save-bar";

export function GeneralSettings() {
  return (
    <div className="space-y-5">
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

      <SaveBar />
    </div>
  );
}
