"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, ShoppingBag, Clock, Truck, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/shared/stats-card";
import { Input } from "@/components/ui/input";
import { OrderTable } from "@/components/orders/order-table";
import { OrderDetailDialog } from "@/components/orders/order-detail-dialog";
import { orderStatusConfig } from "@/lib/data/orders";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing" || o.status === "paid").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    revenue: orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
  }), [orders]);

  const filtered = useMemo(() => orders.filter((o) => {
    const matchSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.includes(search) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setSelectedOrder((prev) => (prev?.id === id ? { ...prev, status } : prev));
  };

  return (
    <div>
      <Header title="คำสั่งซื้อ" />
      <main className="p-6 space-y-5">

        {/* KPI Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard index={0} title="ออเดอร์ทั้งหมด" value={String(stats.total)} icon={ShoppingBag} iconColor="bg-blue-50" />
          <StatsCard index={1} title="รอดำเนินการ" value={String(stats.pending + stats.processing)} change="รอชำระ + กำลังจัดเตรียม" changeType="neutral" icon={Clock} iconColor="bg-amber-50" />
          <StatsCard index={2} title="จัดส่งแล้ว" value={String(stats.shipped)} icon={Truck} iconColor="bg-violet-50" />
          <StatsCard index={3} title="ยอดรวม" value={formatCurrency(stats.revenue)} icon={TrendingUp} iconColor="bg-emerald-50" />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...Object.keys(orderStatusConfig)] as const).map((s) => {
              const count = s === "all" ? orders.length : orders.filter((o) => o.status === s).length;
              const isActive = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s === "all" ? "ทั้งหมด" : orderStatusConfig[s as OrderStatus].label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ค้นหาออเดอร์, ลูกค้า..."
              className="pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">กำลังโหลด...</div>
        ) : (
          <OrderTable
            orders={filtered}
            onView={setSelectedOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        <OrderDetailDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      </main>
    </div>
  );
}
