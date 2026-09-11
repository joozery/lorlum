"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Check, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface PaymentSettingsData {
  enabled: boolean;
  mode: "test" | "live";
  publishableKey: string;
  hasSecretKey: boolean;
  secretKeyPreview: string;
  hasWebhookSecret: boolean;
  webhookSecretPreview: string;
}

export function PaymentSettings() {
  const [data, setData]       = useState<PaymentSettingsData | null>(null);
  const [secretKeyInput, setSecretKeyInput]       = useState("");
  const [webhookSecretInput, setWebhookSecretInput] = useState("");
  const [showSecretKey, setShowSecretKey]         = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [revealing, setRevealing] = useState<"secretKey" | "webhookSecret" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  async function revealSecret(field: "secretKey" | "webhookSecret") {
    setRevealing(field);
    try {
      const res = await fetch(`/api/admin/payment-settings?reveal=${field}`);
      if (res.status === 401) { setError("กรุณาเข้าสู่ระบบใหม่"); return; }
      if (!res.ok) { setError("ดึงค่าไม่สำเร็จ"); return; }
      const d = await res.json();
      if (field === "secretKey") { setSecretKeyInput(d.secretKey || ""); setShowSecretKey(true); }
      else { setWebhookSecretInput(d.webhookSecret || ""); setShowWebhookSecret(true); }
    } finally {
      setRevealing(null);
    }
  }

  useEffect(() => {
    fetch("/api/admin/payment-settings")
      .then(async (r) => {
        if (r.status === 401) { setError("กรุณาเข้าสู่ระบบใหม่"); return null; }
        if (!r.ok) { setError("โหลดข้อมูลล้มเหลว"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => setError("โหลดข้อมูลล้มเหลว"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: data.enabled,
          mode: data.mode,
          publishableKey: data.publishableKey,
          ...(secretKeyInput.trim() && { secretKey: secretKeyInput.trim() }),
          ...(webhookSecretInput.trim() && { webhookSecret: webhookSecretInput.trim() }),
        }),
      });
      if (res.status === 401) { setError("กรุณาเข้าสู่ระบบใหม่"); return; }
      if (!res.ok) { setError("บันทึกล้มเหลว"); return; }
      const next = await res.json();
      setData(next);
      setSecretKeyInput("");
      setWebhookSecretInput("");
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
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/logo/Stripe.svg" alt="Stripe" width={64} height={28} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] px-2 py-0 hover:bg-current ${data.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {data.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">รองรับบัตรเครดิตนานาชาติ, Apple Pay, Google Pay</p>
            </div>
          </div>
          <Switch checked={data.enabled} onCheckedChange={(v) => setData({ ...data, enabled: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Publishable Key</Label>
            <Input
              type="text"
              value={data.publishableKey}
              onChange={(e) => setData({ ...data, publishableKey: e.target.value })}
              placeholder="pk_test_..."
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Secret Key</Label>
            <div className="relative">
              <Input
                type={showSecretKey ? "text" : "password"}
                name="stripe-secret-key-nofill"
                value={secretKeyInput}
                onChange={(e) => setSecretKeyInput(e.target.value)}
                placeholder={data.hasSecretKey ? `•••• ${data.secretKeyPreview} (บันทึกไว้แล้ว — เว้นว่างไว้เพื่อไม่เปลี่ยน)` : "sk_test_..."}
                className="font-mono text-xs pr-8"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore
              />
              <button
                type="button"
                onClick={() => {
                  if (!secretKeyInput && data.hasSecretKey) { revealSecret("secretKey"); return; }
                  if (showSecretKey) setSecretKeyInput("");
                  setShowSecretKey((v) => !v);
                }}
                disabled={revealing === "secretKey"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {revealing === "secretKey" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : showSecretKey ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Webhook Secret</Label>
            <div className="relative">
              <Input
                type={showWebhookSecret ? "text" : "password"}
                name="stripe-webhook-secret-nofill"
                value={webhookSecretInput}
                onChange={(e) => setWebhookSecretInput(e.target.value)}
                placeholder={data.hasWebhookSecret ? `•••• ${data.webhookSecretPreview} (บันทึกไว้แล้ว — เว้นว่างไว้เพื่อไม่เปลี่ยน)` : "whsec_..."}
                className="font-mono text-xs pr-8"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore
              />
              <button
                type="button"
                onClick={() => {
                  if (!webhookSecretInput && data.hasWebhookSecret) { revealSecret("webhookSecret"); return; }
                  if (showWebhookSecret) setWebhookSecretInput("");
                  setShowWebhookSecret((v) => !v);
                }}
                disabled={revealing === "webhookSecret"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {revealing === "webhookSecret" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : showWebhookSecret ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mode</Label>
            <Select value={data.mode} onValueChange={(v: "test" | "live") => setData({ ...data, mode: v })}>
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test mode</SelectItem>
                <SelectItem value="live">Live mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
