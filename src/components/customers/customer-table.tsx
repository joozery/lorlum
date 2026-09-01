"use client";

import { Eye, Mail, Phone, MapPin, Crown, Star, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import type { Customer, CustomerTier } from "@/types";

/* ── Tier config ─────────────────────────────── */
const tierConfig: Record<CustomerTier, {
  label: string;
  icon: React.ElementType;
  chip: string;
}> = {
  vip:     { label: "VIP",    icon: Crown,    chip: "bg-amber-50 text-amber-700 border border-amber-200" },
  regular: { label: "ประจำ",  icon: Star,     chip: "bg-blue-50 text-blue-700 border border-blue-200" },
  new:     { label: "ใหม่",   icon: Sparkles, chip: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

/* ── Avatar colors ───────────────────────────── */
const avatarPalette = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

interface CustomerTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
}

export function CustomerTable({ customers, onView }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-gray-400">
        <p className="text-sm font-medium">ไม่พบลูกค้าที่ค้นหา</p>
        <p className="mt-1 text-xs">ลองปรับคำค้นหาใหม่</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">ลูกค้า</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">ช่องทางติดต่อ</th>
            <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">ระดับ</th>
            <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">คำสั่งซื้อ</th>
            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">ยอดซื้อรวม</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">สั่งล่าสุด</th>
            <th className="w-12 px-5 py-3.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {customers.map((customer, i) => {
            const tier        = tierConfig[customer.tier];
            const TierIcon    = tier.icon;
            const avatarColor = avatarPalette[i % avatarPalette.length];

            return (
              <tr
                key={customer.id}
                className="group cursor-pointer hover:bg-gray-50/60 transition-colors"
                onClick={() => onView(customer)}
              >
                {/* Customer identity */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      avatarColor
                    )}>
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span className="max-w-[160px] truncate">{customer.address}</span>
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-5 py-4">
                  <p className="flex items-center gap-1.5 text-xs text-gray-700">
                    <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    {customer.email}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    {customer.phone}
                  </p>
                </td>

                {/* Tier */}
                <td className="px-5 py-4 text-center">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    tier.chip
                  )}>
                    <TierIcon className="h-3 w-3" />
                    {tier.label}
                  </span>
                </td>

                {/* Orders */}
                <td className="px-5 py-4 text-center">
                  <Badge variant="info" className="font-semibold">
                    {customer.totalOrders} ออเดอร์
                  </Badge>
                </td>

                {/* Total spent */}
                <td className="px-5 py-4 text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-[11px] text-gray-400">
                    เฉลี่ย {formatCurrency(Math.round(customer.totalSpent / customer.totalOrders))}
                  </p>
                </td>

                {/* Last order */}
                <td className="px-5 py-4">
                  <p className="text-xs text-gray-700">{customer.lastOrderAt}</p>
                  <p className="text-[11px] text-gray-400">สมาชิกตั้งแต่ {customer.createdAt}</p>
                </td>

                {/* Action */}
                <td className="px-3 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onView(customer)}
                  >
                    <Eye className="h-3.5 w-3.5 text-gray-500" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
