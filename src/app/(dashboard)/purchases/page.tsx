"use client";

import { useState, useEffect, useMemo } from "react";
import { ShoppingBag, Clock, CheckCircle2, FileText, Search, Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/stats-card";
import { PurchaseFormDialog } from "@/components/purchases/purchase-form";
import { PurchaseTable } from "@/components/purchases/purchase-table";
import { type Purchase } from "@/lib/data/purchases";
import { formatCurrency, cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "ทั้งหมด",      value: "all" },
  { label: "ร่าง",          value: "draft" },
  { label: "สั่งซื้อแล้ว", value: "ordered" },
  { label: "รับแล้ว",       value: "received" },
  { label: "ยกเลิก",        value: "cancelled" },
];

export default function PurchasesPage() {
  const [purchases,    setPurchases]    = useState<Purchase[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [open,         setOpen]         = useState(false);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/purchases")
      .then(r => r.json())
      .then(d => setPurchases(d.purchases ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => {
    const ordered  = purchases.filter(p => p.status === "ordered");
    const draft    = purchases.filter(p => p.status === "draft");
    const received = purchases.filter(p => p.status === "received");
    const totalCost = [...received, ...ordered].reduce((s, p) => s + p.total, 0);
    return { total: purchases.length, orderedCount: ordered.length, draftCount: draft.length, totalCost };
  }, [purchases]);

  const filtered = useMemo(() =>
    purchases.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.id.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q)
        || p.items.some(i => i.name.toLowerCase().includes(q));
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    }),
  [purchases, search, statusFilter]);

  const kpis = [
    { title: "ใบสั่งซื้อทั้งหมด", value: String(stats.total),            change: "PO ในระบบ",    changeType: "neutral" as const, icon: FileText,    iconColor: "bg-blue-50" },
    { title: "รอรับสินค้า",        value: String(stats.orderedCount),     change: "กำลังจัดส่ง",  changeType: "neutral" as const, icon: Clock,       iconColor: "bg-amber-50" },
    { title: "รอยืนยัน (ร่าง)",    value: String(stats.draftCount),       change: "ยังไม่ส่งออก", changeType: stats.draftCount > 0 ? "down" as const : "neutral" as const, icon: ShoppingBag, iconColor: "bg-violet-50" },
    { title: "ต้นทุนรวม",           value: formatCurrency(stats.totalCost), change: "รับ + สั่งแล้ว", changeType: "up" as const,    icon: CheckCircle2, iconColor: "bg-emerald-50" },
  ];

  return (
    <div>
      <Header title="ระบบจัดซื้อ" />
      <main className="p-6 space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k, i) => (
            <StatsCard key={i} index={i}
              title={k.title} value={k.value} change={k.change}
              changeType={k.changeType} icon={k.icon} iconColor={k.iconColor}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="ค้นหา PO, Supplier, สินค้า..."
              className="pl-9 border-gray-200 bg-white text-sm"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {STATUS_FILTERS.map(f => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  statusFilter === f.value ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}>
                {f.label}
              </button>
            ))}
          </div>

          <Button size="sm" className="ml-auto gap-2 text-xs" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> สร้างใบสั่งซื้อ
          </Button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
            <p className="text-sm text-gray-400">กำลังโหลดใบสั่งซื้อ...</p>
          </div>
        ) : (
          <PurchaseTable purchases={filtered} onRefresh={fetchData} />
        )}

        <PurchaseFormDialog open={open} onOpenChange={(v) => {
          setOpen(v);
          if (!v) fetchData(); // refresh after close
        }} />
      </main>
    </div>
  );
}
