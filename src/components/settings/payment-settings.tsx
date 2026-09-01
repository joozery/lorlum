"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SaveBar } from "./save-bar";

export function PaymentSettings() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/logo/Stripe.svg" alt="Stripe" width={64} height={28} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0 hover:bg-emerald-100">เปิดใช้งาน</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">รองรับบัตรเครดิตนานาชาติ, Apple Pay, Google Pay</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Publishable Key</Label>
            <Input type="text" placeholder="pk_test_..." className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Secret Key</Label>
            <Input type="password" placeholder="sk_test_..." className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Webhook Secret</Label>
            <Input type="password" placeholder="whsec_..." className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mode</Label>
            <Select defaultValue="test">
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test mode</SelectItem>
                <SelectItem value="live">Live mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <SaveBar />
    </div>
  );
}
