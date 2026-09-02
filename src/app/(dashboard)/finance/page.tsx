"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Receipt, BarChart3, RefreshCw, ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface Summary {
  period: { from: string; to: string };
  revenue:  { total: number; orderCount: number };
  cogs:     { total: number; poCount: number };
  expenses: { total: number; count: number; byCategory: { _id: string; total: number }[] };
  grossProfit: number;
  netProfit:   number;
  grossMargin: number;
  netMargin:   number;
}

function fmt(n: number) {
  return "฿" + Math.round(n).toLocaleString("th-TH");
}
function pct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
}

const PRESETS = [
  { label: "เดือนนี้",     key: "this_month" },
  { label: "เดือนที่แล้ว", key: "last_month" },
  { label: "ไตรมาสนี้",   key: "this_quarter" },
  { label: "ปีนี้",        key: "this_year" },
  { label: "กำหนดเอง",    key: "custom" },
];

function presetRange(key: string): { from: string; to: string } {
  const now   = new Date();
  const y     = now.getFullYear();
  const m     = now.getMonth();
  const pad   = (n: number) => String(n).padStart(2, "0");
  const ymd   = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  if (key === "this_month")   return { from: ymd(new Date(y, m, 1)),     to: ymd(new Date(y, m+1, 0)) };
  if (key === "last_month")   return { from: ymd(new Date(y, m-1, 1)),   to: ymd(new Date(y, m, 0)) };
  if (key === "this_quarter") {
    const q = Math.floor(m / 3);
    return { from: ymd(new Date(y, q*3, 1)), to: ymd(new Date(y, q*3+3, 0)) };
  }
  if (key === "this_year")    return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: ymd(new Date(y, m, 1)), to: ymd(new Date(y, m+1, 0)) };
}

export default function FinancePage() {
  const [preset,  setPreset]  = useState("this_month");
  const [range,   setRange]   = useState(presetRange("this_month"));
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/finance/summary?from=${range.from}&to=${range.to}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.revenue) setSummary(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  function applyPreset(key: string) {
    setPreset(key);
    if (key !== "custom") setRange(presetRange(key));
  }

  const kpis = summary ? [
    {
      label: "รายรับรวม",
      sub: `${summary.revenue.orderCount} ออเดอร์`,
      value: fmt(summary.revenue.total),
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
      trend: null,
    },
    {
      label: "ต้นทุนสินค้า (COGS)",
      sub: `${summary.cogs.poCount} PO`,
      value: fmt(summary.cogs.total),
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
      trend: null,
    },
    {
      label: "ค่าใช้จ่ายดำเนินงาน",
      sub: `${summary.expenses.count} รายการ`,
      value: fmt(summary.expenses.total),
      icon: Receipt,
      color: "bg-amber-50 text-amber-600",
      trend: null,
    },
    {
      label: "กำไรขั้นต้น",
      sub: `Gross Margin ${summary.grossMargin}%`,
      value: fmt(summary.grossProfit),
      icon: BarChart3,
      color: summary.grossProfit >= 0 ? "bg-violet-50 text-violet-600" : "bg-red-50 text-red-500",
      trend: summary.grossMargin,
    },
    {
      label: "กำไรสุทธิ",
      sub: `Net Margin ${summary.netMargin}%`,
      value: fmt(summary.netProfit),
      icon: summary.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: summary.netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500",
      trend: summary.netMargin,
    },
  ] : [];

  return (
    <div>
      <Header title="การเงิน" />
      <main className="p-6 space-y-5">

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(p => (
            <button key={p.key} onClick={() => applyPreset(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border-none cursor-pointer ${
                preset === p.key
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </button>
          ))}

          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={range.from}
                onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
                className="h-8 border border-gray-200 rounded-lg px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
              />
              <span className="text-xs text-gray-400">ถึง</span>
              <input type="date" value={range.to}
                onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
                className="h-8 border border-gray-200 rounded-lg px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
              />
            </div>
          )}

          <button onClick={load}
            className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-colors cursor-pointer">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> รีเฟรช
          </button>

          <Link href="/finance/expenses"
            className="flex items-center gap-1.5 text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors no-underline">
            <Receipt className="h-3.5 w-3.5" /> จัดการรายจ่าย
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-28" />
            ))
          ) : kpis.map((k, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${k.color}`}>
                  <k.icon className="h-4 w-4" />
                </div>
                {k.trend !== null && (
                  <span className={`text-[11px] font-medium ${k.trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {pct(k.trend)}
                  </span>
                )}
              </div>
              <p className="text-xl font-semibold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* P&L Waterfall */}
        {summary && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-800">สรุปกำไร-ขาดทุน (P&L)</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(summary.period.from).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })} —{" "}
                {new Date(summary.period.to).toLocaleDateString("th-TH",   { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: "รายรับ (Revenue)",             value: summary.revenue.total,   color: "bg-emerald-500", positive: true },
                { label: "หัก ต้นทุนสินค้า (COGS)",      value: -summary.cogs.total,     color: "bg-blue-400",    positive: false },
                { label: "= กำไรขั้นต้น (Gross Profit)", value: summary.grossProfit,     color: summary.grossProfit >= 0 ? "bg-violet-500" : "bg-red-400", positive: summary.grossProfit >= 0, bold: true },
                { label: "หัก ค่าใช้จ่าย (Opex)",        value: -summary.expenses.total, color: "bg-amber-400",   positive: false },
                { label: "= กำไรสุทธิ (Net Profit)",     value: summary.netProfit,       color: summary.netProfit >= 0 ? "bg-emerald-600" : "bg-red-500",  positive: summary.netProfit >= 0, bold: true },
              ].map((row, i) => {
                const max = summary.revenue.total || 1;
                const barW = Math.min(100, Math.abs(row.value) / max * 100);
                return (
                  <div key={i} className={row.bold ? "pt-2 border-t border-gray-100" : ""}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm ${row.bold ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                        {row.label}
                      </span>
                      <span className={`text-sm font-semibold ${row.positive ? "text-emerald-600" : row.value < 0 ? "text-red-500" : "text-gray-900"}`}>
                        {row.value >= 0 ? "" : "-"}{fmt(Math.abs(row.value))}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.color} transition-all duration-500`} style={{ width: `${barW}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expense breakdown */}
        {summary && summary.expenses.byCategory.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">ค่าใช้จ่ายแยกตามหมวด</h3>
              <Link href="/finance/expenses" className="text-xs text-violet-600 hover:text-violet-800 no-underline">ดูทั้งหมด →</Link>
            </div>
            <div className="p-6 space-y-3">
              {summary.expenses.byCategory.map((c) => {
                const pct = summary.expenses.total > 0 ? (c.total / summary.expenses.total * 100) : 0;
                return (
                  <div key={c._id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{c._id}</span>
                      <span className="text-xs font-medium text-gray-800">{fmt(c.total)} <span className="text-gray-400">({pct.toFixed(1)}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
