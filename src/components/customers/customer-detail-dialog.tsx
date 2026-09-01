"use client";

import {
  Mail, Phone, MapPin, ShoppingBag, Crown, Star, Sparkles,
  CalendarDays, TrendingUp, Package, ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { mockOrders, orderStatusConfig } from "@/lib/data/orders";
import type { Customer, CustomerTier } from "@/types";

/* ── Tier config ─────────────────────────────── */
const tierConfig: Record<CustomerTier, {
  label: string;
  icon: React.ElementType;
  chip: string;
  avatar: string;
}> = {
  vip:     { label: "VIP",   icon: Crown,    chip: "bg-amber-50 text-amber-700 border border-amber-200",     avatar: "bg-amber-100 text-amber-700" },
  regular: { label: "ประจำ", icon: Star,     chip: "bg-blue-50 text-blue-700 border border-blue-200",        avatar: "bg-blue-100 text-blue-700" },
  new:     { label: "ใหม่",  icon: Sparkles, chip: "bg-emerald-50 text-emerald-700 border border-emerald-200", avatar: "bg-emerald-100 text-emerald-700" },
};

interface CustomerDetailDialogProps {
  customer: Customer | null;
  onClose: () => void;
}

function CustomerProfile({ customer }: { customer: Customer }) {
  const tier    = tierConfig[customer.tier];
  const TierIcon = tier.icon;

  const orders = mockOrders.filter((o) => o.customerId === customer.id);
  const avgOrder = customer.totalOrders > 0
    ? Math.round(customer.totalSpent / customer.totalOrders)
    : 0;

  const stats = [
    { label: "คำสั่งซื้อ",     value: String(customer.totalOrders), icon: ShoppingBag,   color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "ยอดซื้อรวม",     value: formatCurrency(customer.totalSpent), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "เฉลี่ยต่อออเดอร์", value: formatCurrency(avgOrder),  icon: Package,      color: "text-violet-600",  bg: "bg-violet-50" },
    { label: "สั่งล่าสุด",      value: customer.lastOrderAt,       icon: CalendarDays,  color: "text-amber-600",   bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-5 text-sm">

      {/* ── Profile hero ── */}
      <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
        <div className={cn(
          "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-bold",
          tier.avatar
        )}>
          {customer.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-gray-900">{customer.name}</p>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", tier.chip)}>
              <TierIcon className="h-3 w-3" />
              {tier.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400">สมาชิกตั้งแต่ {customer.createdAt}</p>
          {customer.tags && customer.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {customer.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 4 stats ── */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl bg-gray-50 p-3 text-center">
              <div className={cn("mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg", s.bg)}>
                <Icon className={cn("h-3.5 w-3.5", s.color)} />
              </div>
              <p className="text-xs font-bold text-gray-900 leading-tight">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-gray-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Contact info ── */}
      <div className="rounded-xl border border-gray-100 bg-white">
        <p className="border-b border-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          ข้อมูลติดต่อ
        </p>
        <div className="divide-y divide-gray-50">
          {[
            { icon: Mail,    label: "อีเมล",    value: customer.email },
            { icon: Phone,   label: "เบอร์โทร", value: customer.phone },
            { icon: MapPin,  label: "ที่อยู่",   value: customer.address },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gray-50">
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">{row.label}</p>
                  <p className="text-xs font-medium text-gray-800">{row.value}</p>
                </div>
              </div>
            );
          })}
        </div>
        {customer.note && (
          <div className="border-t border-gray-50 px-4 py-3">
            <p className="text-[11px] text-gray-400 mb-0.5">หมายเหตุ</p>
            <p className="text-xs text-gray-600 italic">"{customer.note}"</p>
          </div>
        )}
      </div>

      {/* ── Recent orders ── */}
      {orders.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white">
          <p className="border-b border-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            ออเดอร์ล่าสุด
          </p>
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 3).map((order) => {
              const status = orderStatusConfig[order.status];
              return (
                <div key={order.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-gray-800">{order.orderNumber}</p>
                    <p className="text-[11px] text-gray-400">
                      {order.items.length} รายการ · {order.createdAt.slice(0, 10)}
                    </p>
                  </div>
                  <Badge variant={status.variant} className="flex-shrink-0 text-[11px]">
                    {status.label}
                  </Badge>
                  <p className="flex-shrink-0 text-xs font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-2 pt-1">
        <Button variant="default" size="sm" className="flex-1 gap-1.5 text-xs">
          <ShoppingBag className="h-3.5 w-3.5" />
          ดูออเดอร์ทั้งหมด
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Mail className="h-3.5 w-3.5" />
          ส่ง Email
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-gray-500">
          <ExternalLink className="h-3.5 w-3.5" />
          แก้ไข
        </Button>
      </div>
    </div>
  );
}

export function CustomerDetailDialog({ customer, onClose }: CustomerDetailDialogProps) {
  return (
    <Dialog open={!!customer} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Crown className="h-4 w-4 text-gray-600" />
            </div>
            ข้อมูลลูกค้า
          </DialogTitle>
        </DialogHeader>
        {customer && <CustomerProfile customer={customer} />}
      </DialogContent>
    </Dialog>
  );
}
