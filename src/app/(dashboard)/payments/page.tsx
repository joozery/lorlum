"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionTable } from "@/components/payments/transaction-table";
import { TransactionDetailDialog } from "@/components/payments/transaction-detail-dialog";
import { ReceiptTable } from "@/components/payments/receipt-table";
import { type Transaction } from "@/lib/data/payments";
import { formatCurrency, cn } from "@/lib/utils";
import { StatsCard } from "@/components/shared/stats-card";
import { Input } from "@/components/ui/input";

const STATUS_FILTERS = [
  { label: "ทั้งหมด",     value: "all" },
  { label: "สำเร็จ",      value: "success" },
  { label: "รอดำเนินการ", value: "pending" },
  { label: "ล้มเหลว",     value: "failed" },
  { label: "คืนเงิน",     value: "refunded" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Receipt = any;

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receipts,     setReceipts]     = useState<Receipt[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState<Transaction | null>(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/payments")
      .then(r => r.json())
      .then(d => {
        setTransactions(d.transactions ?? []);
        setReceipts(d.receipts ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const success = transactions.filter(t => t.status === "success");
    const pending = transactions.filter(t => t.status === "pending");
    const problem = transactions.filter(t => t.status === "failed" || t.status === "refunded");
    return {
      revenue:      success.reduce((s, t) => s + t.amount, 0),
      successCount: success.length,
      pendingCount: pending.length,
      problemCount: problem.length,
      total:        transactions.length,
    };
  }, [transactions]);

  const filtered = useMemo(() =>
    transactions.filter(t => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    }),
  [transactions, search, statusFilter]);

  const kpis = [
    { title: "รายรับสำเร็จ",    value: formatCurrency(stats.revenue),      change: `${stats.successCount} รายการ`,    changeType: "up"      as const, icon: TrendingUp,  iconColor: "bg-emerald-50" },
    { title: "ชำระสำเร็จ",      value: String(stats.successCount),          change: `จาก ${stats.total} รายการ`,       changeType: "up"      as const, icon: CheckCircle2, iconColor: "bg-blue-50" },
    { title: "รอดำเนินการ",      value: String(stats.pendingCount),          change: "ยังไม่ยืนยัน",                    changeType: "neutral" as const, icon: Clock,       iconColor: "bg-amber-50" },
    { title: "ล้มเหลว / คืนเงิน", value: String(stats.problemCount),        change: stats.problemCount > 0 ? "ตรวจสอบด่วน" : "ปกติ", changeType: stats.problemCount > 0 ? "down" as const : "neutral" as const, icon: XCircle, iconColor: "bg-red-50" },
  ];

  return (
    <div>
      <Header title="การชำระเงิน" />
      <main className="p-6 space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k, i) => (
            <StatsCard key={i} index={i}
              title={k.title} value={k.value} change={k.change}
              changeType={k.changeType} icon={k.icon} iconColor={k.iconColor}
            />
          ))}
        </div>

        <Tabs defaultValue="transactions">
          <TabsList className="bg-gray-100/80 p-1">
            <TabsTrigger value="transactions" className="flex items-center gap-1.5 text-xs">
              รายการ Transaction
              <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 shadow-sm">
                {loading ? "…" : transactions.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-1.5 text-xs">
              ใบเสร็จ / เอกสาร
              <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 shadow-sm">
                {loading ? "…" : receipts.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="ค้นหา ID, ลูกค้า, ออเดอร์..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 border-gray-200 bg-white text-sm"
                />
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                {STATUS_FILTERS.map(f => (
                  <button key={f.value} onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      statusFilter === f.value
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    )}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
                <p className="text-sm text-gray-400">กำลังโหลดรายการ...</p>
              </div>
            ) : (
              <TransactionTable transactions={filtered} onView={setSelected} />
            )}
          </TabsContent>

          <TabsContent value="receipts" className="mt-4">
            <ReceiptTable receipts={receipts} />
          </TabsContent>
        </Tabs>

        <TransactionDetailDialog transaction={selected} onClose={() => setSelected(null)} />
      </main>
    </div>
  );
}
