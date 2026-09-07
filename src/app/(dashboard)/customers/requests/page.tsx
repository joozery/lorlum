"use client";

import { useState, useEffect, useMemo } from "react";
import { FileText, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/shared/stats-card";
import type { IAccessRequest } from "@/models/AccessRequest";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_LABEL: Record<string, string> = {
  pending:  "รอพิจารณา",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธแล้ว",
};

const STATUS_STYLE: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<IAccessRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<StatusFilter>("pending");
  const [search, setSearch]     = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/store/request-access?status=${filter}`)
      .then(r => r.json())
      .then(d => setRequests(d.requests ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  const counts = useMemo(() => ({
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  }), [requests]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return requests;
    return requests.filter(r =>
      r.fname.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.applicationNo.toLowerCase().includes(q),
    );
  }, [requests, search]);

  async function updateStatus(id: string, status: "approved" | "rejected" | "pending") {
    setUpdating(id);
    try {
      const res = await fetch(`/api/store/request-access/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch {
      alert("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setUpdating(null);
    }
  }

  const kpis = [
    { title: "รอพิจารณา",  value: String(counts.pending),  change: "ยังไม่ตัดสินใจ", changeType: "neutral" as const, icon: Clock,        iconColor: "bg-amber-50" },
    { title: "อนุมัติแล้ว", value: String(counts.approved), change: "ผ่านการคัดเลือก",  changeType: "up"      as const, icon: CheckCircle,  iconColor: "bg-emerald-50" },
    { title: "ปฏิเสธแล้ว", value: String(counts.rejected), change: "ไม่ผ่านเกณฑ์",    changeType: "neutral" as const, icon: XCircle,      iconColor: "bg-red-50" },
    { title: "ทั้งหมด",     value: String(requests.length), change: "ทุกสถานะ",         changeType: "neutral" as const, icon: FileText,     iconColor: "bg-blue-50" },
  ];

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "pending",  label: "รอพิจารณา" },
    { key: "approved", label: "อนุมัติแล้ว" },
    { key: "rejected", label: "ปฏิเสธแล้ว" },
    { key: "all",      label: "ทั้งหมด" },
  ];

  return (
    <div>
      <Header title="คำขอสมัครสมาชิก" />
      <main className="p-6 space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k, i) => (
            <StatsCard key={i} index={i}
              title={k.title} value={k.value} change={k.change}
              changeType={k.changeType} icon={k.icon} iconColor={k.iconColor}
            />
          ))}
        </div>

        {/* filter tabs + search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === t.key
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ค้นหาชื่อ, อีเมล, เลขที่ใบสมัคร..."
              className="pl-9 border-gray-200 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {!loading && (
            <p className="text-xs text-gray-400">{filtered.length} รายการ</p>
          )}
        </div>

        {/* table */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
            <p className="text-sm text-gray-400">กำลังโหลด...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
            <p className="text-sm text-gray-400">ไม่มีข้อมูล</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">เลขที่</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ชื่อ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">อีเมล</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">จังหวัด</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ความสนใจ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">วันที่</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">สถานะ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.applicationNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.fname}</td>
                      <td className="px-4 py-3 text-gray-600">{r.email}</td>
                      <td className="px-4 py-3 text-gray-600">{r.location}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{r.interest || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric", month: "short", year: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStatus(r._id, "approved")}
                              disabled={updating === r._id}
                              className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => updateStatus(r._id, "rejected")}
                              disabled={updating === r._id}
                              className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateStatus(r._id, "pending")}
                            disabled={updating === r._id}
                            className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-300 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                          >
                            รีเซ็ต
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
