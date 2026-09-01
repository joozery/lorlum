"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, UserPlus, TrendingUp, Crown, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerDetailDialog } from "@/components/customers/customer-detail-dialog";
import { StatsCard } from "@/components/shared/stats-card";
import { formatCurrency } from "@/lib/utils";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Customer | null>(null);

  useEffect(() => {
    fetch("/api/customers")
      .then(r => r.json())
      .then(d => setCustomers(d.customers ?? []))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!customers.length) return { total: 0, vipCount: 0, newMonth: 0, avgSpent: 0 };
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthStr  = thisMonth.toISOString().split("T")[0].slice(0, 7); // "YYYY-MM"
    const vip       = customers.filter(c => c.tier === "vip").length;
    const newMonth  = customers.filter(c => c.createdAt.startsWith(monthStr)).length;
    const avgSpent  = customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length;
    return { total: customers.length, vipCount: vip, newMonth, avgSpent };
  }, [customers]);

  const filtered = useMemo(() =>
    customers.filter(c => {
      const q = search.toLowerCase();
      return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    }),
  [customers, search]);

  const kpis = [
    { title: "ลูกค้าทั้งหมด",    value: String(stats.total),           change: "ทุกระดับ",    changeType: "neutral" as const, icon: Users,     iconColor: "bg-blue-50" },
    { title: "ลูกค้าใหม่เดือนนี้", value: String(stats.newMonth),        change: "+สมัครใหม่",  changeType: "up"      as const, icon: UserPlus,  iconColor: "bg-emerald-50" },
    { title: "ยอดซื้อเฉลี่ย",     value: formatCurrency(stats.avgSpent), change: "ต่อลูกค้า",  changeType: "neutral" as const, icon: TrendingUp, iconColor: "bg-violet-50" },
    { title: "ลูกค้า VIP",        value: String(stats.vipCount),        change: "ยอดซื้อ > ฿10,000", changeType: "up" as const, icon: Crown, iconColor: "bg-amber-50" },
  ];

  return (
    <div>
      <Header title="จัดการลูกค้า" />
      <main className="p-6 space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k, i) => (
            <StatsCard key={i} index={i}
              title={k.title} value={k.value} change={k.change}
              changeType={k.changeType} icon={k.icon} iconColor={k.iconColor}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
              className="pl-9 border-gray-200 bg-white"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {loading
            ? <p className="text-xs text-gray-400">กำลังโหลด...</p>
            : <p className="text-xs text-gray-400">{filtered.length} รายการ</p>}
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
            <p className="text-sm text-gray-400">กำลังโหลดข้อมูลลูกค้า...</p>
          </div>
        ) : (
          <>
            <CustomerTable customers={filtered} onView={setSelected} />
            <CustomerDetailDialog customer={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </main>
    </div>
  );
}
