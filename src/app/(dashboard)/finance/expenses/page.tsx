"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import {
  Plus, Pencil, Trash2, Search, RefreshCw,
  Receipt, Loader2, ChevronLeft, Check,
} from "lucide-react";
import Link from "next/link";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "@/models/Expense";

interface ExpenseItem {
  _id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  note: string;
}

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  category: "อื่นๆ" as ExpenseCategory,
  description: "",
  amount: "",
  note: "",
};

function fmt(n: number) {
  return "฿" + n.toLocaleString("th-TH");
}

export default function ExpensesPage() {
  const [items,      setItems]      = useState<ExpenseItem[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [catFilter,  setCatFilter]  = useState("");
  const [fromDate,   setFromDate]   = useState("");
  const [toDate,     setToDate]     = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<ExpenseItem | null>(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [formError,  setFormError]  = useState("");
  const [deleteId,   setDeleteId]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit: "100" });
      if (fromDate) qs.set("from", fromDate);
      if (toDate)   qs.set("to",   toDate);
      if (catFilter) qs.set("category", catFilter);
      const res  = await fetch(`/api/finance/expenses?${qs}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } finally { setLoading(false); }
  }, [fromDate, toDate, catFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? items.filter(i => i.description.toLowerCase().includes(search.toLowerCase()) || i.category.includes(search))
    : items;

  const grandTotal = filtered.reduce((s, i) => s + i.amount, 0);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setFormError("");
    setSaved(false);
    setShowForm(true);
  }

  function openEdit(item: ExpenseItem) {
    setEditing(item);
    setForm({
      date: item.date.slice(0, 10),
      category: item.category,
      description: item.description,
      amount: String(item.amount),
      note: item.note,
    });
    setFormError("");
    setSaved(false);
    setShowForm(true);
  }

  async function handleSave() {
    setFormError("");
    if (!form.date || !form.description.trim() || !form.amount) {
      setFormError("กรุณากรอกวันที่, รายละเอียด และจำนวนเงิน");
      return;
    }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError("จำนวนเงินต้องเป็นตัวเลขและมากกว่า 0");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        const res = await fetch("/api/finance/expenses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing._id, ...payload }),
        });
        if (!res.ok) { setFormError("เกิดข้อผิดพลาด"); return; }
        const updated = await res.json();
        setItems(prev => prev.map(i => i._id === editing._id ? updated : i));
      } else {
        const res = await fetch("/api/finance/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { setFormError("เกิดข้อผิดพลาด"); return; }
        const created = await res.json();
        setItems(prev => [created, ...prev]);
      }
      setSaved(true);
      setTimeout(() => { setShowForm(false); setSaved(false); }, 800);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await fetch("/api/finance/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems(prev => prev.filter(i => i._id !== id));
    setDeleteId(null);
  }

  const inputClass = "w-full h-9 border border-gray-200 rounded-lg px-3 text-sm bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all";

  return (
    <div>
      <Header title="รายจ่าย" />
      <main className="p-6 space-y-4">

        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <Link href="/finance" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 no-underline">
            <ChevronLeft className="h-3.5 w-3.5" /> กลับ P&L
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800">รายจ่ายดำเนินงาน</span>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              placeholder="ค้นหา..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 pl-8 pr-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 w-48"
            />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white text-gray-600 focus:outline-none cursor-pointer">
            <option value="">หมวดทั้งหมด</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:outline-none" />
          <span className="text-xs text-gray-400">ถึง</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="h-9 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:outline-none" />
          <button onClick={load}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 h-9 bg-white cursor-pointer">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">{filtered.length} รายการ · รวม <strong className="text-red-500">{fmt(grandTotal)}</strong></span>
            <button onClick={openAdd}
              className="flex items-center gap-1.5 text-xs font-medium bg-gray-900 text-white px-4 h-9 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer border-none">
              <Plus className="h-3.5 w-3.5" /> เพิ่มรายจ่าย
            </button>
          </div>
        </div>

        {/* Form panel */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-5">
              {editing ? "แก้ไขรายจ่าย" : "เพิ่มรายจ่าย"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">วันที่ *</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">หมวดหมู่</label>
                <select value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                  className={inputClass + " cursor-pointer appearance-none"}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">จำนวนเงิน (฿) *</label>
                <input type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className={inputClass} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-gray-600">รายละเอียด *</label>
                <input type="text" placeholder="เช่น ค่าเช่าร้านเดือน ก.ย."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">หมายเหตุ</label>
                <input type="text" placeholder="(ไม่บังคับ)"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className={inputClass} />
              </div>
            </div>
            {formError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{formError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-4 py-2 bg-white cursor-pointer">
                ยกเลิก
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 text-sm font-medium bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60 cursor-pointer border-none transition-colors">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : null}
                {saved ? "บันทึกแล้ว" : "บันทึก"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">วันที่</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">หมวด</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">รายละเอียด</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">จำนวนเงิน</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">หมายเหตุ</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center">
                  <Receipt className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">ยังไม่มีรายจ่าย</p>
                </td></tr>
              ) : filtered.map(item => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{item.description}</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-500 whitespace-nowrap">{fmt(item.amount)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">{item.note || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer bg-transparent border-none">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deleteId === item._id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(item._id)}
                            className="text-[11px] font-medium text-red-600 hover:text-red-700 px-2 py-1 bg-transparent border-none cursor-pointer">
                            ยืนยัน
                          </button>
                          <button onClick={() => setDeleteId(null)}
                            className="text-[11px] text-gray-400 px-2 py-1 bg-transparent border-none cursor-pointer">
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(item._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50/50">
                  <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-600">รวมทั้งหมด</td>
                  <td className="px-4 py-3 text-right font-bold text-red-500">{fmt(grandTotal)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

      </main>
    </div>
  );
}
