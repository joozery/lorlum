"use client";

import { useState, useEffect } from "react";
import {
  Phone, MessageCircle, Mail, Check, Loader2,
  Inbox, Eye, Trash2, ExternalLink, RefreshCw, Paperclip,
} from "lucide-react";

interface ContactSettings {
  phone: string;
  phoneDisplay: string;
  whatsappLink: string;
  email: string;
  hours: string;
}

interface Message {
  _id: string;
  title: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  object: string;
  topic: string;
  message: string;
  attachmentUrl: string;
  attachmentName: string;
  status: "new" | "read" | "replied";
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  new:     { label: "ใหม่",    color: "text-blue-700",  bg: "bg-blue-50 border-blue-200" },
  read:    { label: "อ่านแล้ว", color: "text-gray-600",  bg: "bg-gray-50 border-gray-200" },
  replied: { label: "ตอบแล้ว", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
};

export default function StorefrontContactPage() {
  const [tab, setTab] = useState<"settings" | "inbox">("settings");

  // ── Settings state ──
  const [cfg, setCfg]       = useState<ContactSettings>({
    phone: "+66960824578", phoneDisplay: "+66 96 082 4578",
    whatsappLink: "#", email: "support@lorlum.com",
    hours: "Monday to Friday, 4am–11am CET\nSaturday and Sunday, 5am–10am CET",
  });
  const [loadingCfg, setLoadingCfg] = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  // ── Inbox state ──
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const [selected,     setSelected]     = useState<Message | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [newCount,     setNewCount]     = useState(0);

  useEffect(() => {
    fetch("/api/site-settings")
      .then(r => r.json())
      .then(d => { if (d.contact) setCfg(d.contact); })
      .catch(console.error)
      .finally(() => setLoadingCfg(false));
  }, []);

  async function loadMessages() {
    setLoadingMsgs(true);
    const qs = filterStatus ? `?status=${filterStatus}` : "";
    const res = await fetch(`/api/admin/contact-messages${qs}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setNewCount((data.messages ?? []).filter((m: Message) => m.status === "new").length);
    setLoadingMsgs(false);
  }

  useEffect(() => { if (tab === "inbox") loadMessages(); }, [tab, filterStatus]);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact: cfg }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function patchStatus(id: string, status: string) {
    await fetch("/api/admin/contact-messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, status: status as Message["status"] } : m));
    if (selected?._id === id) setSelected(prev => prev ? { ...prev, status: status as Message["status"] } : prev);
  }

  async function deleteMsg(id: string) {
    if (!confirm("ลบข้อความนี้?")) return;
    await fetch("/api/admin/contact-messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMessages(prev => prev.filter(m => m._id !== id));
    if (selected?._id === id) setSelected(null);
  }

  function openMessage(msg: Message) {
    setSelected(msg);
    if (msg.status === "new") patchStatus(msg._id, "read");
  }

  const inputClass = "w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all";

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("settings")}
          className={`px-5 py-2 rounded-lg text-xs font-medium transition-all border-none cursor-pointer ${tab === "settings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 bg-transparent"}`}
        >
          ข้อมูลติดต่อ
        </button>
        <button
          onClick={() => setTab("inbox")}
          className={`relative px-5 py-2 rounded-lg text-xs font-medium transition-all border-none cursor-pointer flex items-center gap-2 ${tab === "inbox" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 bg-transparent"}`}
        >
          <Inbox className="h-3.5 w-3.5" />
          Inbox
          {newCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {newCount}
            </span>
          )}
        </button>
      </div>

      {/* ── SETTINGS TAB ── */}
      {tab === "settings" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">ข้อมูลติดต่อ</h2>
              <p className="text-xs text-gray-500 mt-0.5">แสดงใน Contact section หน้าร้าน</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/#contact" target="_blank"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 transition-colors no-underline">
                <ExternalLink className="h-3.5 w-3.5" /> ดูหน้าร้าน
              </a>
              <button onClick={handleSave} disabled={saving || loadingCfg}
                className="flex items-center gap-2 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60 transition-colors border-none cursor-pointer">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : null}
                {saved ? "บันทึกแล้ว" : "บันทึก"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
            {/* Phone */}
            <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Phone className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">เบอร์โทร (สำหรับลิงก์ tel:)</label>
                  <input
                    value={cfg.phone}
                    onChange={e => setCfg(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+66960824578"
                    className={inputClass}
                  />
                  <p className="text-[11px] text-gray-400">ไม่มีช่องว่าง เช่น +66960824578</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">เบอร์โทร (แสดงผล)</label>
                  <input
                    value={cfg.phoneDisplay}
                    onChange={e => setCfg(p => ({ ...p, phoneDisplay: e.target.value }))}
                    placeholder="+66 96 082 4578"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-gray-600">WhatsApp Link</label>
                <input
                  value={cfg.whatsappLink}
                  onChange={e => setCfg(p => ({ ...p, whatsappLink: e.target.value }))}
                  placeholder="https://wa.me/66960824578"
                  className={inputClass}
                />
                <p className="text-[11px] text-gray-400">เช่น https://wa.me/66960824578 (ไม่มี + และ เว้นวรรค)</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <Mail className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-gray-600">อีเมล</label>
                <input
                  type="email"
                  value={cfg.email}
                  onChange={e => setCfg(p => ({ ...p, email: e.target.value }))}
                  placeholder="support@lorlum.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-gray-600">เวลาทำการ</label>
                <textarea
                  value={cfg.hours}
                  onChange={e => setCfg(p => ({ ...p, hours: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Preview</h3>
            <div className="space-y-3 max-w-xs">
              {[
                { icon: Phone, title: "Phone", value: cfg.phoneDisplay || cfg.phone, href: `tel:${cfg.phone}`, color: "text-blue-500 bg-blue-50" },
                { icon: MessageCircle, title: "Chat With Us", value: "WhatsApp", href: cfg.whatsappLink, color: "text-green-500 bg-green-50" },
                { icon: Mail, title: "Email", value: cfg.email, href: `mailto:${cfg.email}`, color: "text-amber-500 bg-amber-50" },
              ].map(({ icon: Icon, title, value, color }) => (
                <div key={title} className="flex items-center justify-between border border-amber-100 bg-amber-50/30 px-4 py-4 rounded-lg">
                  <div>
                    <div className="text-[10px] font-medium tracking-widest uppercase text-gray-700 mb-1">{title}</div>
                    <div className="text-[12.5px] text-gray-500">{value}</div>
                  </div>
                  <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INBOX TAB ── */}
      {tab === "inbox" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="h-9 border border-gray-200 rounded-lg px-3 text-xs bg-white text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer"
              >
                <option value="">ทุกสถานะ</option>
                <option value="new">ใหม่</option>
                <option value="read">อ่านแล้ว</option>
                <option value="replied">ตอบแล้ว</option>
              </select>
              <span className="text-xs text-gray-400">{messages.length} รายการ</span>
            </div>
            <button onClick={loadMessages} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 bg-white transition-colors cursor-pointer">
              <RefreshCw className="h-3.5 w-3.5" /> รีเฟรช
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 items-start">
            {/* Message list */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> กำลังโหลด...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Inbox className="h-10 w-10 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">ยังไม่มีข้อความ</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {messages.map(msg => {
                    const st = STATUS_LABEL[msg.status];
                    const isSelected = selected?._id === msg._id;
                    return (
                      <li key={msg._id}
                        onClick={() => openMessage(msg)}
                        className={`px-4 py-3.5 cursor-pointer transition-colors ${isSelected ? "bg-gray-50" : "hover:bg-gray-50/60"}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`font-medium text-sm text-gray-900 ${msg.status === "new" ? "font-semibold" : ""}`}>
                            {msg.title} {msg.first} {msg.last}
                          </span>
                          <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.bg} ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                          {msg.object} · {msg.topic}
                          {msg.attachmentUrl && <Paperclip className="h-3 w-3 text-gray-400 shrink-0" />}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.message}</p>
                        <p className="text-[10px] text-gray-300 mt-1.5">
                          {new Date(msg.createdAt).toLocaleDateString("th-TH", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Detail panel */}
            <div className="rounded-xl border border-gray-200 bg-white">
              {!selected ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                  <Eye className="h-9 w-9 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">เลือกข้อความเพื่อดูรายละเอียด</p>
                </div>
              ) : (
                <div>
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selected.title} {selected.first} {selected.last}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(selected.createdAt).toLocaleDateString("th-TH", { dateStyle: "long" })} · {new Date(selected.createdAt).toLocaleTimeString("th-TH", { timeStyle: "short" })}
                      </p>
                    </div>
                    <button onClick={() => deleteMsg(selected._id)}
                      className="shrink-0 text-gray-300 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="px-6 py-4 space-y-2.5 border-b border-gray-100">
                    {[
                      { label: "Email", value: selected.email, href: `mailto:${selected.email}` },
                      { label: "Phone", value: selected.phone },
                      { label: "Object", value: selected.object },
                      { label: "Topic", value: selected.topic },
                    ].map(({ label, value, href }) => (
                      <div key={label} className="flex gap-3">
                        <span className="text-[11px] font-medium text-gray-400 w-14 shrink-0 mt-0.5">{label}</span>
                        {href ? (
                          <a href={href} className="text-sm text-blue-600 hover:underline">{value}</a>
                        ) : (
                          <span className="text-sm text-gray-700">{value}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Message */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-[11px] font-medium text-gray-400 mb-2">Message</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  {/* Attachment */}
                  {selected.attachmentUrl && (
                    <div className="px-6 py-3 border-b border-gray-100">
                      <p className="text-[11px] font-medium text-gray-400 mb-2">ไฟล์แนบ</p>
                      <a
                        href={selected.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 border border-blue-100 bg-blue-50 rounded-lg px-3 py-2 no-underline transition-colors"
                      >
                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                        <span className="max-w-[220px] truncate">{selected.attachmentName || "ดูไฟล์แนบ"}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-6 py-4 flex gap-2 flex-wrap">
                    <a href={`mailto:${selected.email}`}
                      onClick={() => patchStatus(selected._id, "replied")}
                      className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors no-underline">
                      <Mail className="h-3.5 w-3.5" /> ตอบอีเมล
                    </a>
                    {selected.status !== "replied" && (
                      <button onClick={() => patchStatus(selected._id, "replied")}
                        className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors bg-white cursor-pointer">
                        <Check className="h-3.5 w-3.5" /> ทำเครื่องหมายตอบแล้ว
                      </button>
                    )}
                    {selected.status === "replied" && (
                      <button onClick={() => patchStatus(selected._id, "read")}
                        className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2 bg-transparent border-none cursor-pointer">
                        ยกเลิกสถานะตอบแล้ว
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
