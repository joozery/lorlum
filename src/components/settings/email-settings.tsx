"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SaveBar } from "./save-bar";

const NOTIFICATIONS = [
  { id: "rcpEmail",   label: "ส่งใบเสร็จหลังชำระเงิน",             desc: "ส่งอัตโนมัติทันทีที่ชำระเงินสำเร็จ" },
  { id: "orderEmail", label: "แจ้งสถานะออเดอร์เปลี่ยนแปลง",        desc: "เมื่อสถานะเปลี่ยนเป็น จัดส่งแล้ว / ยกเลิก ฯลฯ" },
  { id: "stockEmail", label: "แจ้งสินค้าใกล้หมด (แอดมิน)",          desc: "ส่งให้แอดมินเมื่อสต็อก < 10 ชิ้น" },
  { id: "newOrder",   label: "แจ้งออเดอร์ใหม่ (แอดมิน)",            desc: "แอดมินได้รับอีเมลทุกครั้งที่มีออเดอร์ใหม่" },
  { id: "newUser",    label: "ยินดีต้อนรับลูกค้าใหม่",               desc: "ส่งอีเมล welcome หลังสมัครสมาชิก" },
];

export function EmailSettings() {
  return (
    <div className="space-y-5">
      {/* SMTP */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">SMTP Settings</h3>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Send className="h-3.5 w-3.5" /> ส่งอีเมลทดสอบ
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label>SMTP Host</Label>
            <Input defaultValue="smtp.gmail.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Port</Label>
            <Input defaultValue="587" />
          </div>
          <div className="space-y-1.5">
            <Label>Encryption</Label>
            <Select defaultValue="TLS">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TLS">TLS</SelectItem>
                <SelectItem value="SSL">SSL</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>อีเมลผู้ส่ง</Label>
            <Input type="email" defaultValue="noreply@shop.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input defaultValue="noreply@shop.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" defaultValue="••••••••" />
          </div>
        </div>
      </div>

      {/* การแจ้งเตือนอัตโนมัติ */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">การแจ้งเตือนอีเมลอัตโนมัติ</h3>
        <div className="space-y-1">
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm text-gray-700">{n.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{n.desc}</p>
              </div>
              <Switch id={n.id} defaultChecked />
            </div>
          ))}
        </div>
      </div>

      <SaveBar />
    </div>
  );
}
