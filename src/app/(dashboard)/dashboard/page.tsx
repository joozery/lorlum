"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart, Package, Users, TrendingUp,
  ArrowRight, AlertCircle, ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RevenueChart, type RevenueDataPoint } from "@/components/dashboard/revenue-chart";
import { CategoryChart, type CategoryDataPoint } from "@/components/dashboard/category-chart";
import { StatsCard } from "@/components/shared/stats-card";
import { orderStatusConfig } from "@/lib/data/orders";
import Link from "next/link";

/* ── Types ──────────────────────────────── */
interface DashboardKPIs {
  todayRevenue: number;
  todayOrders: number;
  totalProducts: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  lowStockCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{ imageUrl?: string }>;
}

interface LowStockProduct {
  name: string;
  sku: string;
  stock: number;
  maxStock: number;
}

interface TodaySummary {
  newOrders: number;
  paid: number;
  shipped: number;
  revenue: number;
}

interface DashboardData {
  kpis: DashboardKPIs;
  weeklyRevenue: RevenueDataPoint[];
  categoryBreakdown: CategoryDataPoint[];
  recentOrders: RecentOrder[];
  lowStock: LowStockProduct[];
  todaySummary: TodaySummary;
}

/* ── Helpers ────────────────────────────── */
const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

/* ── Component ────────────────────────────── */
export default function DashboardPage() {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const kpis = data ? [
    {
      title: "ยอดขายวันนี้",
      value: formatCurrency(data.kpis.todayRevenue),
      change: "วันนี้",
      up: true,
      sub: "ยอดชำระสำเร็จ",
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      sparkColor: "#10b981",
    },
    {
      title: "คำสั่งซื้อวันนี้",
      value: String(data.kpis.todayOrders),
      change: `+${data.kpis.todayOrders}`,
      up: true,
      sub: "ออเดอร์ใหม่วันนี้",
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      sparkColor: "#3b82f6",
    },
    {
      title: "สินค้าทั้งหมด",
      value: String(data.kpis.totalProducts),
      change: `${data.kpis.lowStockCount} ใกล้หมด`,
      up: data.kpis.lowStockCount === 0,
      sub: "รายการใกล้หมดสต็อก",
      icon: Package,
      iconBg: "bg-amber-50",
      sparkColor: "#f59e0b",
    },
    {
      title: "ลูกค้าทั้งหมด",
      value: String(data.kpis.totalCustomers),
      change: `+${data.kpis.newCustomersThisMonth}`,
      up: true,
      sub: "ลูกค้าใหม่เดือนนี้",
      icon: Users,
      iconBg: "bg-violet-50",
      sparkColor: "#8b5cf6",
    },
  ] : [];

  const weeklyChange = (() => {
    if (!data) return null;
    const wr = data.weeklyRevenue;
    if (wr.length < 2) return null;
    const half = Math.floor(wr.length / 2);
    const prev = wr.slice(0, half).reduce((s, d) => s + d.revenue, 0);
    const curr = wr.slice(half).reduce((s, d) => s + d.revenue, 0);
    if (prev === 0) return null;
    const pct = (((curr - prev) / prev) * 100).toFixed(1);
    return { pct: Number(pct), label: `${Number(pct) >= 0 ? "+" : ""}${pct}% จากครึ่งแรก` };
  })();

  return (
    <div>
      <Header title="แดชบอร์ด" />
      <main className="p-6 space-y-6">

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[120px] animate-pulse rounded-2xl bg-gray-100" />
              ))
            : kpis.map((k, i) => (
                <StatsCard
                  key={i}
                  index={i}
                  title={k.title}
                  value={k.value}
                  change={k.change}
                  changeType={k.up ? "up" : "down"}
                  icon={k.icon}
                  iconColor={k.iconBg}
                  sparkColor={k.sparkColor}
                  sub={k.sub}
                />
              ))
          }
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Revenue area chart */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">รายได้รายสัปดาห์</p>
                <p className="text-xs text-gray-400">7 วันที่ผ่านมา</p>
              </div>
              {weeklyChange && (
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${weeklyChange.pct >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                  <ArrowUpRight className={`h-3.5 w-3.5 ${weeklyChange.pct >= 0 ? "text-emerald-600" : "text-red-600 rotate-180"}`} />
                  <span className={`text-xs font-semibold ${weeklyChange.pct >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {weeklyChange.label}
                  </span>
                </div>
              )}
            </div>
            <RevenueChart data={data?.weeklyRevenue ?? []} />
          </div>

          {/* Category donut */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-900">ยอดขายตามหมวดหมู่</p>
              <p className="text-xs text-gray-400">ทั้งหมด</p>
            </div>
            <CategoryChart data={data?.categoryBreakdown ?? []} />
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Recent orders */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
              <p className="text-sm font-semibold text-gray-900">คำสั่งซื้อล่าสุด</p>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-gray-400 hover:text-gray-700">
                  ดูทั้งหมด <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
                      <div className="h-2.5 w-24 animate-pulse rounded bg-gray-100" />
                    </div>
                    <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
                    <div className="h-3 w-14 animate-pulse rounded bg-gray-100" />
                  </div>
                ))
              ) : !data?.recentOrders.length ? (
                <div className="flex h-32 items-center justify-center text-sm text-gray-400">
                  ยังไม่มีคำสั่งซื้อ
                </div>
              ) : (
                data.recentOrders.map((order, i) => {
                  const statusCfg = orderStatusConfig[order.status as keyof typeof orderStatusConfig]
                    ?? { label: order.status, variant: "default" as const };
                  const color = avatarColors[i % avatarColors.length];
                  const images = order.items
                    .map((item) => item.imageUrl)
                    .filter(Boolean) as string[];
                  const visibleImgs = images.slice(0, 3);
                  const extra = images.length - visibleImgs.length;

                  return (
                    <div key={order.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}>
                        {order.customerName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{order.customerName}</p>
                        <p className="text-xs text-gray-400">#{order.orderNumber} · {formatDate(order.createdAt)}</p>
                      </div>

                      <div className="flex flex-shrink-0 items-center">
                        {visibleImgs.map((src, idx) => (
                          <div
                            key={idx}
                            className="relative h-8 w-8 overflow-hidden rounded-lg border-2 border-white shadow-sm"
                            style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: visibleImgs.length - idx }}
                          >
                            <Image src={src} alt="" fill className="object-cover" sizes="32px" />
                          </div>
                        ))}
                        {extra > 0 && (
                          <div
                            className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-500 shadow-sm"
                            style={{ marginLeft: -8 }}
                          >
                            +{extra}
                          </div>
                        )}
                      </div>

                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                      <p className="min-w-[72px] text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Low stock */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-sm font-semibold text-gray-900">สินค้าใกล้หมด</p>
              </div>
              {loading ? (
                <div className="space-y-3.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                      <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : !data?.lowStock.length ? (
                <p className="text-sm text-gray-400">สต็อกอยู่ในระดับปกติ</p>
              ) : (
                <div className="space-y-3.5">
                  {data.lowStock.map((p) => (
                    <div key={p.sku}>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-800 truncate max-w-[140px]">{p.name}</p>
                        <span className="text-xs font-semibold text-amber-600">{p.stock} ชิ้น</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${Math.min((p.stock / p.maxStock) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/inventory">
                <Button variant="outline" size="sm" className="mt-4 w-full text-xs">
                  จัดการคลังสินค้า
                </Button>
              </Link>
            </div>

            {/* Today summary */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-gray-900">สรุปวันนี้</p>
              {loading ? (
                <div className="space-y-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-12 animate-pulse rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    { label: "ออเดอร์ใหม่",    value: String(data?.todaySummary.newOrders ?? 0),           color: "bg-blue-500" },
                    { label: "ชำระเงินแล้ว",   value: String(data?.todaySummary.paid ?? 0),                color: "bg-emerald-500" },
                    { label: "จัดส่งสำเร็จ",   value: String(data?.todaySummary.shipped ?? 0),             color: "bg-violet-500" },
                    { label: "ยอดขาย",         value: formatCurrency(data?.todaySummary.revenue ?? 0),     color: "bg-amber-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${item.color}`} />
                        <p className="text-xs text-gray-600">{item.label}</p>
                      </div>
                      <p className="text-xs font-semibold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
