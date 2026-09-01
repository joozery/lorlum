"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShieldCheck, UserCheck, UserX, Users,
  Search, Plus, Edit2, Trash2, MoreHorizontal,
  KeyRound, Eye, EyeOff, Mail, Copy, Check, AlertCircle,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { StatsCard } from "@/components/shared/stats-card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type AdminRole = "super_admin" | "admin" | "manager" | "staff";

interface AdminUser {
  id:          string;
  name:        string;
  email:       string;
  phone:       string;
  role:        AdminRole;
  avatarUrl:   string;
  isActive:    boolean;
  lastLoginAt: string;
  createdAt:   string;
  updatedAt:   string;
}

const ROLES: { value: AdminRole; label: string; color: string }[] = [
  { value: "super_admin", label: "Super Admin", color: "bg-red-100 text-red-700" },
  { value: "admin",       label: "Admin",       color: "bg-violet-100 text-violet-700" },
  { value: "manager",     label: "Manager",     color: "bg-blue-100 text-blue-700" },
  { value: "staff",       label: "Staff",       color: "bg-gray-100 text-gray-600" },
];

const EMPTY_FORM = { name: "", email: "", phone: "", role: "staff" as AdminRole, isActive: true, password: "", confirmPassword: "" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function toUser(raw: Record<string, unknown>): AdminUser {
  return {
    id:          String(raw._id ?? raw.id),
    name:        String(raw.name ?? ""),
    email:       String(raw.email ?? ""),
    phone:       String(raw.phone ?? ""),
    role:        (raw.role as AdminRole) ?? "staff",
    avatarUrl:   String(raw.avatarUrl ?? ""),
    isActive:    Boolean(raw.isActive),
    lastLoginAt: String(raw.lastLoginAt ?? ""),
    createdAt:   String(raw.createdAt ?? ""),
    updatedAt:   String(raw.updatedAt ?? ""),
  };
}

function roleInfo(role: AdminRole) {
  return ROLES.find((r) => r.value === role) ?? ROLES[3];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const avatarColors: Record<AdminRole, string> = {
  super_admin: "bg-red-500",
  admin:       "bg-violet-500",
  manager:     "bg-blue-500",
  staff:       "bg-gray-400",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editing,      setEditing]      = useState<AdminUser | null>(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [showPass,     setShowPass]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [formError,    setFormError]    = useState("");
  const [inviteResult, setInviteResult] = useState<{ name: string; email: string; link: string; emailSent: boolean; emailError: string } | null>(null);
  const [copied,       setCopied]       = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)                params.set("search", search);
      if (roleFilter !== "all")  params.set("role",   roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("limit", "100");
      const res  = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers((data.users ?? []).map(toUser));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins:   users.filter((u) => u.role === "admin" || u.role === "super_admin").length,
  }), [users]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowPass(false);
    setDialogOpen(true);
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, phone: user.phone, role: user.role, isActive: user.isActive, password: "", confirmPassword: "" });
    setFormError("");
    setShowPass(false);
    setDialogOpen(true);
  }

  async function handleSave() {
    setFormError("");
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("กรุณากรอกชื่อและอีเมล");
      return;
    }
    // password is optional when creating — invite email will be sent
    if (form.password && form.password !== form.confirmPassword) {
      setFormError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (form.password && form.password.length < 6) {
      setFormError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        isActive: form.isActive,
      };
      if (form.password) payload.password = form.password;

      if (editing) {
        const res = await fetch(`/api/admin/users/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          setFormError(err.error ?? "เกิดข้อผิดพลาด");
          return;
        }
        const updated = toUser(await res.json());
        setUsers((prev) => prev.map((u) => u.id === editing.id ? updated : u));
        setDialogOpen(false);
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          setFormError(err.error ?? "เกิดข้อผิดพลาด");
          return;
        }
        const data = await res.json();
        const created = toUser(data);
        setUsers((prev) => [created, ...prev]);
        setDialogOpen(false);
        setInviteResult({
          name:       form.name,
          email:      form.email,
          link:       data.inviteLink ?? "",
          emailSent:  data.emailSent  ?? false,
          emailError: data.emailError ?? "",
        });
      }
    } catch {
      setFormError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteTarget(null);
  }

  async function handleToggleActive(user: AdminUser) {
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
  }

  return (
    <div>
      <Header title="ผู้ดูแลระบบ" />
      <main className="p-6 space-y-4">

        {/* KPI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard index={0} title="ผู้ดูแลทั้งหมด"  value={String(stats.total)}    icon={Users}       iconColor="bg-violet-50" />
          <StatsCard index={1} title="ใช้งานอยู่"       value={String(stats.active)}   icon={UserCheck}   iconColor="bg-emerald-50" />
          <StatsCard index={2} title="ปิดใช้งาน"        value={String(stats.inactive)} icon={UserX}       iconColor="bg-rose-50" />
          <StatsCard index={3} title="Admin ขึ้นไป"     value={String(stats.admins)}   icon={ShieldCheck} iconColor="bg-blue-50" />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ค้นหาชื่อหรืออีเมล..."
              className="pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Role ทั้งหมด</SelectItem>
              {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectItem value="active">ใช้งาน</SelectItem>
              <SelectItem value="inactive">ปิด</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              เพิ่มผู้ดูแล
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">ผู้ดูแล</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">เบอร์โทร</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">สถานะ</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">เข้าใช้ล่าสุด</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">สร้างเมื่อ</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">กำลังโหลด...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    ยังไม่มีผู้ดูแลระบบ กดเพิ่มผู้ดูแลได้เลย
                  </td>
                </tr>
              ) : users.map((user) => {
                const ri = roleInfo(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Avatar + name + email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${avatarColors[user.role]}`}>
                          {user.avatarUrl
                            ? <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                            : initials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Role badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ri.color}`}>
                        {ri.label}
                      </span>
                    </td>
                    {/* Phone */}
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {user.phone || <span className="text-gray-300">—</span>}
                    </td>
                    {/* Toggle */}
                    <td className="px-4 py-3 text-center">
                      <Switch checked={user.isActive} onCheckedChange={() => handleToggleActive(user)} />
                    </td>
                    {/* Last login */}
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                      {user.lastLoginAt && user.lastLoginAt !== "undefined" && user.lastLoginAt !== ""
                        ? formatDate(user.lastLoginAt)
                        : <span className="text-gray-300">ยังไม่ได้ใช้</span>}
                    </td>
                    {/* Created */}
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="z-50 min-w-[140px] rounded-lg border border-gray-100 bg-white p-1 shadow-lg"
                            align="end"
                          >
                            <DropdownMenu.Item
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                              onSelect={() => openEdit(user)}
                            >
                              <Edit2 className="h-3.5 w-3.5" /> แก้ไขข้อมูล
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                              onSelect={() => { openEdit(user); setShowPass(true); }}
                            >
                              <KeyRound className="h-3.5 w-3.5" /> เปลี่ยนรหัสผ่าน
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                            <DropdownMenu.Item
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 focus:outline-none"
                              onSelect={() => setDeleteTarget(user)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> ลบผู้ดูแล
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </main>

      {/* Invite result dialog */}
      <Dialog open={!!inviteResult} onOpenChange={(v) => { if (!v) { setInviteResult(null); setCopied(false); } }}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/60">
            <DialogTitle className="text-base font-semibold text-gray-800">สร้างบัญชีผู้ดูแลสำเร็จ</DialogTitle>
            <p className="text-xs text-gray-400 mt-0.5">{inviteResult?.name} · {inviteResult?.email}</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {/* Email status */}
            {inviteResult?.emailSent ? (
              <div className="flex items-start gap-3 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-700">ส่งอีเมลสำเร็จ</p>
                  <p className="text-xs text-emerald-600 mt-0.5">ระบบส่งลิงก์ตั้งรหัสผ่านไปที่ <strong>{inviteResult.email}</strong> แล้ว</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-700">ส่งอีเมลไม่สำเร็จ</p>
                  <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                    Resend ใช้ <code className="bg-amber-100 px-1 rounded">onboarding@resend.dev</code> ส่งได้แค่หาเจ้าของ account เท่านั้น<br />
                    กรุณาคัดลอก link ด้านล่างแล้วส่งให้ผู้ดูแลคนใหม่โดยตรง
                  </p>
                </div>
              </div>
            )}

            {/* Invite link */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">ลิงก์ตั้งรหัสผ่าน (หมดอายุใน 72 ชั่วโมง)</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 overflow-hidden">
                  <p className="text-xs text-gray-600 truncate font-mono">{inviteResult?.link}</p>
                </div>
                <button
                  onClick={() => {
                    if (inviteResult?.link) {
                      navigator.clipboard.writeText(inviteResult.link);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                </button>
              </div>
            </div>

            {!inviteResult?.emailSent && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>แก้ถาวร:</strong> verify domain ที่ <a href="https://resend.com/domains" target="_blank" className="underline">resend.com/domains</a> แล้วอัปเดต <code className="bg-blue-100 px-1 rounded">RESEND_FROM</code> ใน .env.local
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => { setInviteResult(null); setCopied(false); }}
                className="text-sm font-medium bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer border-none"
              >
                ปิด
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        itemName={deleteTarget?.name}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />

      {/* Add / Edit Dialog — horizontal 2-column layout */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-semibold ${form.name ? avatarColors[form.role] : "bg-gray-300"}`}>
              {form.name ? initials(form.name) : <span className="text-lg text-white/70">+</span>}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-gray-800">
                {editing ? "แก้ไขผู้ดูแลระบบ" : "เพิ่มผู้ดูแลระบบ"}
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {editing ? `แก้ไขข้อมูลของ ${editing.name}` : "กรอกข้อมูลเพื่อสร้างบัญชีใหม่"}
              </p>
            </div>
          </div>

          {/* Body — 2 columns */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">

            {/* ── LEFT: User info ───────────────────────────────── */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">ข้อมูลผู้ใช้</p>

              <div className="space-y-1.5">
                <Label className="text-xs">ชื่อ-นามสกุล <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="เช่น สมชาย ใจดี"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">อีเมล <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">เบอร์โทร</Label>
                  <Input
                    placeholder="0812345678"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Role <span className="text-red-500">*</span></Label>
                  <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as AdminRole }))}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-700">เปิดใช้งาน</p>
                  <p className="text-[11px] text-gray-400">สามารถเข้าสู่ระบบได้</p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
              </div>

              {/* Role permissions hint */}
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">สิทธิ์ตาม Role</p>
                <div className="space-y-0.5">
                  {ROLES.map((r) => (
                    <div
                      key={r.value}
                      className={`flex items-center gap-2 text-xs rounded px-2 py-1 transition-colors ${
                        form.role === r.value ? r.color + " font-medium" : "text-gray-400"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${form.role === r.value ? "bg-current" : "bg-gray-300"}`} />
                      <span className="font-medium w-[76px] shrink-0">{r.label}</span>
                      <span className="truncate">
                        {r.value === "super_admin" && "เข้าถึงทุกส่วน"}
                        {r.value === "admin"       && "จัดการทั้งหมดยกเว้น super"}
                        {r.value === "manager"     && "สินค้า คำสั่งซื้อ ลูกค้า"}
                        {r.value === "staff"       && "ดูข้อมูลและอัปเดตออเดอร์"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Security ───────────────────────────────── */}
            <div className="px-6 py-5 space-y-4 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">ความปลอดภัย</p>

              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 space-y-3 flex-1">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 shrink-0" />
                  {editing ? "เว้นว่างถ้าไม่ต้องการเปลี่ยนรหัสผ่าน" : "ไม่บังคับ — ระบบจะส่งลิงก์ตั้งรหัสทางอีเมล"}
                </p>

                {!editing && (
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
                    <Mail className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      ระบบจะส่งอีเมลเชิญให้ผู้ดูแลใหม่ <strong>ตั้งรหัสผ่านของตัวเองอัตโนมัติ</strong> — ลิงก์มีอายุ 72 ชั่วโมง
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    {editing ? "รหัสผ่านใหม่" : "รหัสผ่านเริ่มต้น"}{" "}
                    {!editing && <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPass((v) => !v)}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">
                    ยืนยันรหัสผ่าน{" "}
                    {!editing && <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>}
                  </Label>
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  />
                </div>

                {/* Password strength indicator */}
                {form.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            form.password.length >= i * 3
                              ? form.password.length >= 10 ? "bg-emerald-400"
                              : form.password.length >= 6  ? "bg-amber-400"
                              : "bg-red-300"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {form.password.length < 6 ? "สั้นเกินไป" : form.password.length < 10 ? "พอใช้" : "แข็งแกร่ง"}
                    </p>
                  </div>
                )}
              </div>

              {/* Spacer so actions sit at bottom */}
              <div className="flex-1" />

              {/* Error */}
              {formError && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 border border-red-100">{formError}</p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "กำลังบันทึก..." : editing ? "บันทึกการแก้ไข" : "เพิ่มผู้ดูแล"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
