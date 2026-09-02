"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import {
  TrendingUp, TrendingDown, RefreshCw, Receipt,
  ArrowUpRight, ArrowDownRight, Wallet, BarChart2,
} from "lucide-react";
import Link from "next/link";

interface MonthData {
  label: string;
  year: number;
  month: number;
  revenue: number;
  orders: number;
  expenses: number;
  profit: number;
}

interface Summary {
  period: { from: string; to: string };
  revenue:  { total: number; orderCount: number };
  cogs:     { total: number; poCount: number };
  expenses: { total: number; count: number; byCategory: { _id: string; total: number }[] };
  grossProfit: number;
  netProfit:   number;
  grossMargin: number;
  netMargin:   number;
  avgOrderValue: number;
  monthly: MonthData[];
}

function fmt(n: number) {
  return "฿" + Math.round(n).toLocaleString("th-TH");
}
function fmtShort(n: number) {
  if (Math.abs(n) >= 1_000_000) return "฿" + (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000)     return "฿" + (n / 1_000).toFixed(0) + "K";
  return "฿" + Math.round(n);
}

const PRESETS = [
  { label: "เดือนนี้",     key: "this_month" },
  { label: "เดือนที่แล้ว", key: "last_month" },
  { label: "ไตรมาสนี้",   key: "this_quarter" },
  { label: "ปีนี้",        key: "this_year" },
  { label: "กำหนดเอง",    key: "custom" },
];

function presetRange(key: string): { from: string; to: string } {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (key === "this_month")   return { from: ymd(new Date(y, m, 1)),     to: ymd(new Date(y, m + 1, 0)) };
  if (key === "last_month")   return { from: ymd(new Date(y, m - 1, 1)), to: ymd(new Date(y, m, 0)) };
  if (key === "this_quarter") {
    const q = Math.floor(m / 3);
    return { from: ymd(new Date(y, q * 3, 1)), to: ymd(new Date(y, q * 3 + 3, 0)) };
  }
  if (key === "this_year") return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: ymd(new Date(y, m, 1)), to: ymd(new Date(y, m + 1, 0)) };
}

// ── Monthly bar chart ─────────────────────────────────────────────────────────
function MonthlyChart({ monthly }: { monthly: MonthData[] }) {
  const maxVal = Math.max(...monthly.flatMap(m => [m.revenue, m.expenses]), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">แนวโน้ม 6 เดือน</h3>
          <p className="text-xs text-gray-400 mt-0.5">Revenue vs Expenses</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400" /> รายรับ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-300" /> รายจ่าย
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-300" /> กำไร
          </span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-44 px-1">
        {monthly.map((m, i) => {
          const isProfit = m.profit >= 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
              <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: 160 }}>
                {/* Revenue */}
                <div className="flex-1 relative">
                  <div
                    className="w-full bg-emerald-100 hover:bg-emerald-200 rounded-t transition-all duration-500 cursor-pointer"
                    style={{ height: Math.max(2, (m.revenue / maxVal) * 150) }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                      {fmtShort(m.revenue)}
                    </div>
                  </div>
                </div>
                {/* Expenses */}
                <div className="flex-1 relative">
                  <div
                    className="w-full bg-red-100 hover:bg-red-200 rounded-t transition-all duration-500 cursor-pointer"
                    style={{ height: Math.max(2, (m.expenses / maxVal) * 150) }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                      {fmtShort(m.expenses)}
                    </div>
                  </div>
                </div>
                {/* Profit */}
                <div className="flex-1 relative">
                  <div
                    className={`w-full rounded-t transition-all duration-500 cursor-pointer ${isProfit ? "bg-violet-100 hover:bg-violet-200" : "bg-red-200 hover:bg-red-300"}`}
                    style={{ height: Math.max(2, (Math.abs(m.profit) / maxVal) * 150) }}
                  >
                    <div className={`absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none ${isProfit ? "bg-violet-700" : "bg-red-600"}`}>
                      {isProfit ? "+" : "-"}{fmtShort(Math.abs(m.profit))}
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
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

  const totalOut = summary ? summary.cogs.total + summary.expenses.total : 0;

  return (
    <div>
      <Header title="การเงิน" />
      <main className="p-6 space-y-5">

        {/* ── Filter bar ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(p => (
            <button key={p.key} onClick={() => applyPreset(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border-none cursor-pointer ${
                preset === p.key
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >{p.label}</button>
          ))}
          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={range.from}
                onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
                className="h-8 border border-gray-200 rounded-lg px-2 text-xs bg-white focus:outline-none" />
              <span className="text-xs text-gray-400">ถึง</span>
              <input type="date" value={range.to}
                onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
                className="h-8 border border-gray-200 rounded-lg px-2 text-xs bg-white focus:outline-none" />
            </div>
          )}
          <button onClick={load}
            className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 bg-white cursor-pointer">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> รีเฟรช
          </button>
          <Link href="/finance/expenses"
            className="flex items-center gap-1.5 text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 no-underline">
            <Receipt className="h-3.5 w-3.5" /> จัดการรายจ่าย
          </Link>
        </div>

        {/* ── Hero KPI Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : summary ? [
            {
              label: "รายรับรวม",
              sub: `${summary.revenue.orderCount} ออเดอร์`,
              value: fmt(summary.revenue.total),
              icon: ArrowUpRight,
              accent: "text-emerald-600",
              iconBg: "bg-emerald-50",
              border: "border-l-4 border-l-emerald-400",
            },
            {
              label: "รายจ่ายรวม",
              sub: `COGS + Opex`,
              value: fmt(totalOut),
              icon: ArrowDownRight,
              accent: "text-red-500",
              iconBg: "bg-red-50",
              border: "border-l-4 border-l-red-400",
            },
            {
              label: "กำไรขั้นต้น",
              sub: `Gross Margin ${summary.grossMargin}%`,
              value: fmt(summary.grossProfit),
              icon: BarChart2,
              accent: summary.grossProfit >= 0 ? "text-violet-600" : "text-red-500",
              iconBg: summary.grossProfit >= 0 ? "bg-violet-50" : "bg-red-50",
              border: `border-l-4 ${summary.grossProfit >= 0 ? "border-l-violet-400" : "border-l-red-400"}`,
            },
            {
              label: "กำไรสุทธิ",
              sub: `Net Margin ${summary.netMargin}%`,
              value: fmt(summary.netProfit),
              icon: summary.netProfit >= 0 ? TrendingUp : TrendingDown,
              accent: summary.netProfit >= 0 ? "text-emerald-700" : "text-red-600",
              iconBg: summary.netProfit >= 0 ? "bg-emerald-50" : "bg-red-50",
              border: `border-l-4 ${summary.netProfit >= 0 ? "border-l-emerald-600" : "border-l-red-500"}`,
            },
          ].map((k, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${k.border}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500 font-medium">{k.label}</span>
                <div className={`p-2 rounded-xl ${k.iconBg}`}>
                  <k.icon className={`h-4 w-4 ${k.accent}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold mb-1 ${k.accent}`}>{k.value}</p>
              <p className="text-[11px] text-gray-400">{k.sub}</p>
            </div>
          )) : null}
        </div>

        {/* ── Quick Stats strip ───────────────────────────────── */}
        {!loading && summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "มูลค่าออเดอร์เฉลี่ย",   value: fmt(summary.avgOrderValue),           icon: "💳" },
              { label: "ต้นทุนสินค้า (COGS)",      value: fmt(summary.cogs.total),             icon: "📦" },
              { label: "ค่าใช้จ่ายดำเนินงาน",     value: fmt(summary.expenses.total),         icon: "🧾" },
              { label: "จำนวนรายจ่าย",            value: `${summary.expenses.count} รายการ`,  icon: "📋" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Monthly trend chart ──────────────────────────────── */}
        {loading ? (
          <Skeleton className="h-64" />
        ) : summary?.monthly && summary.monthly.length > 0 ? (
          <MonthlyChart monthly={summary.monthly} />
        ) : null}

        {/* ── P&L + Fund Flow ─────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* P&L Statement */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">งบกำไร-ขาดทุน (P&amp;L)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(summary.period.from).toLocaleDateString("th-TH", { day: "numeric", month: "long" })}
                    {" — "}
                    {new Date(summary.period.to).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <BarChart2 className="h-4 w-4 text-gray-300" />
              </div>
              <div className="p-6 space-y-5">
                {[
                  {
                    label: "รายรับ", note: "Revenue",
                    value: summary.revenue.total, raw: summary.revenue.total,
                    sign: "+", color: "bg-emerald-400", textColor: "text-emerald-600",
                    bold: false,
                  },
                  {
                    label: "หัก ต้นทุนสินค้า", note: "COGS",
                    value: summary.cogs.total, raw: summary.cogs.total,
                    sign: "−", color: "bg-blue-300", textColor: "text-blue-600",
                    bold: false,
                  },
                  {
                    label: "กำไรขั้นต้น", note: `Gross Profit · ${summary.grossMargin}%`,
                    value: summary.grossProfit, raw: Math.abs(summary.grossProfit),
                    sign: summary.grossProfit >= 0 ? "=" : "=",
                    color: summary.grossProfit >= 0 ? "bg-violet-400" : "bg-red-400",
                    textColor: summary.grossProfit >= 0 ? "text-violet-600" : "text-red-500",
                    bold: true,
                  },
                  {
                    label: "หัก ค่าใช้จ่าย", note: "Operating Expenses",
                    value: summary.expenses.total, raw: summary.expenses.total,
                    sign: "−", color: "bg-amber-300", textColor: "text-amber-600",
                    bold: false,
                  },
                  {
                    label: "กำไรสุทธิ", note: `Net Profit · ${summary.netMargin}%`,
                    value: summary.netProfit, raw: Math.abs(summary.netProfit),
                    sign: summary.netProfit >= 0 ? "=" : "=",
                    color: summary.netProfit >= 0 ? "bg-emerald-500" : "bg-red-500",
                    textColor: summary.netProfit >= 0 ? "text-emerald-700" : "text-red-600",
                    bold: true,
                  },
                ].map((row, i) => {
                  const maxV = summary.revenue.total || 1;
                  const barW = Math.min(100, (row.raw / maxV) * 100);
                  return (
                    <div key={i} className={row.bold ? "pt-4 border-t border-dashed border-gray-200" : ""}>
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="min-w-0">
                          <span className={`text-sm block ${row.bold ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                            {row.sign}&nbsp;{row.label}
                          </span>
                          <span className="text-[10px] text-gray-400">{row.note}</span>
                        </div>
                        <span className={`text-sm font-bold tabular-nums whitespace-nowrap ${row.textColor}`}>
                          {fmt(row.value >= 0 ? row.value : row.value)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${row.color} transition-all duration-700`} style={{ width: `${barW}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fund Flow */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">กระแสเงิน (Fund Flow)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">เงินเข้า → จัดสรร → คงเหลือ</p>
                </div>
                <Wallet className="h-4 w-4 text-gray-300" />
              </div>
              <div className="p-6 space-y-6">

                {/* Inflow */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">▲</span>
                      <span className="text-xs font-semibold text-gray-700">เงินเข้า (Inflow)</span>
                    </div>
                    <span className="text-base font-bold text-emerald-600">{fmt(summary.revenue.total)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: "100%" }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{summary.revenue.orderCount} ออเดอร์ · avg {fmt(summary.avgOrderValue)}/ออเดอร์</p>
                </div>

                {/* Outflows */}
                <div className="space-y-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">เงินออก (Outflow)</p>
                  {[
                    {
                      label: "ต้นทุนสินค้า (COGS)",
                      sub: `${summary.cogs.poCount} PO`,
                      value: summary.cogs.total,
                      color: "bg-blue-400",
                      pct: summary.revenue.total > 0 ? summary.cogs.total / summary.revenue.total * 100 : 0,
                    },
                    {
                      label: "ค่าใช้จ่ายดำเนินงาน",
                      sub: `${summary.expenses.count} รายการ`,
                      value: summary.expenses.total,
                      color: "bg-amber-400",
                      pct: summary.revenue.total > 0 ? summary.expenses.total / summary.revenue.total * 100 : 0,
                    },
                  ].map((row, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs text-gray-700 font-medium">{row.label}</span>
                          <span className="text-[10px] text-gray-400 ml-1.5">{row.sub}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400">{row.pct.toFixed(1)}%</span>
                          <span className="text-sm font-semibold text-red-500">−{fmt(row.value)}</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${row.color} transition-all duration-700`} style={{ width: `${Math.min(100, row.pct)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Net */}
                <div className="pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={summary.netProfit >= 0 ? "text-emerald-500" : "text-red-500"}>
                      {summary.netProfit >= 0 ? "▲" : "▼"}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">คงเหลือ (Net)</span>
                  </div>
                  <span className={`text-2xl font-bold tabular-nums ${summary.netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {summary.netProfit >= 0 ? "+" : ""}{fmt(summary.netProfit)}
                  </span>
                </div>

                {/* Expense breakdown */}
                {summary.expenses.byCategory.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">รายจ่ายแยกหมวด</p>
                      <Link href="/finance/expenses" className="text-[11px] text-violet-600 hover:text-violet-800 no-underline">ดูทั้งหมด →</Link>
                    </div>
                    <div className="space-y-2.5">
                      {summary.expenses.byCategory.slice(0, 5).map((c) => {
                        const p = summary.expenses.total > 0 ? (c.total / summary.expenses.total) * 100 : 0;
                        return (
                          <div key={c._id} className="flex items-center gap-3">
                            <span className="text-[11px] text-gray-500 w-28 truncate shrink-0">{c._id || "อื่นๆ"}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-300 rounded-full transition-all duration-500" style={{ width: `${p}%` }} />
                            </div>
                            <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap w-24 text-right">
                              {fmt(c.total)} <span className="text-gray-400 font-normal">({p.toFixed(0)}%)</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

      </main>
    </div>
  );
}
