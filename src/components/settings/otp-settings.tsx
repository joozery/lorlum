"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SaveBar } from "./save-bar";

export function OtpSettings() {
  return (
    <div className="space-y-5">
      {/* OTP */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">ตั้งค่า OTP</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>ช่องทางส่ง OTP</Label>
            <Select defaultValue="email">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">📧 Email</SelectItem>
                <SelectItem value="sms">📱 SMS</SelectItem>
                <SelectItem value="both">Email + SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>ความยาว OTP (ตัวเลข)</Label>
            <Select defaultValue="6">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 หลัก</SelectItem>
                <SelectItem value="6">6 หลัก</SelectItem>
                <SelectItem value="8">8 หลัก</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>หมดอายุภายใน (นาที)</Label>
            <Input type="number" defaultValue="5" className="w-full" min="1" max="60" />
          </div>
          <div className="space-y-1.5">
            <Label>กรอกผิดได้สูงสุด (ครั้ง)</Label>
            <Input type="number" defaultValue="5" className="w-full" min="3" max="10" />
          </div>
        </div>
      </div>

      {/* 2FA */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Two-Factor Authentication (2FA)</h3>
        <div className="space-y-1">
          {[
            { id: "otpAdmin",    label: "บังคับ OTP สำหรับ Admin Login",   desc: "ทุก admin ต้องยืนยัน OTP ทุกครั้งที่ login" },
            { id: "otpSensitive",label: "บังคับ OTP ก่อนลบหรือแก้ไขข้อมูลสำคัญ", desc: "เช่น ลบสินค้า, เปลี่ยน Role" },
            { id: "otpCheckout", label: "ยืนยัน OTP ก่อน Checkout",       desc: "ให้ลูกค้ายืนยันตัวตนก่อนชำระเงิน" },
          ].map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm text-gray-700">{s.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.desc}</p>
              </div>
              <Switch id={s.id} defaultChecked={s.id === "otpAdmin"} />
            </div>
          ))}
        </div>
      </div>

      {/* SMS Provider */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">SMS Provider</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>ผู้ให้บริการ</Label>
            <Select defaultValue="twilio">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="thaibulksms">Thai Bulk SMS</SelectItem>
                <SelectItem value="thsms">THSMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Sender Name</Label>
            <Input defaultValue="MYSHOP" maxLength={11} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>API Key / Auth Token</Label>
            <Input type="password" placeholder="API key จากผู้ให้บริการ SMS" />
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 flex gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 font-medium">หมายเหตุ</p>
          <p className="text-xs text-amber-600 mt-1 leading-relaxed">
            ค่าบริการ SMS OTP คิดตามจำนวนที่ส่งจริง ขึ้นอยู่กับผู้ให้บริการที่เลือก
            กรุณาสมัครและเติมเครดิตกับผู้ให้บริการก่อนเปิดใช้งาน
          </p>
        </div>
      </div>

      <SaveBar />
    </div>
  );
}
