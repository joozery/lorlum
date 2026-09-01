"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck, Shield, Briefcase, User,
  Check, X, Users, ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";

// ── Types ─────────────────────────────────────────────────────────────────────
type AdminRole = "super_admin" | "admin" | "manager" | "staff";

interface UserSummary { id: string; name: string; role: AdminRole }

// ── Role definitions ──────────────────────────────────────────────────────────
const PERMISSION_GROUPS = [
  {
    group: "Dashboard & รายงาน",
    permissions: [
      { key: "view_dashboard",  label: "ดู Dashboard & สถิติ" },
      { key: "view_reports",    label: "ดูรายงานยอดขาย" },
      { key: "export_reports",  label: "Export รายงาน" },
    ],
  },
  {
    group: "สินค้า",
    permissions: [
      { key: "view_products",   label: "ดูสินค้า" },
      { key: "create_products", label: "เพิ่มสินค้า" },
      { key: "edit_products",   label: "แก้ไขสินค้า" },
      { key: "delete_products", label: "ลบสินค้า" },
    ],
  },
  {
    group: "คำสั่งซื้อ",
    permissions: [
      { key: "view_orders",     label: "ดูคำสั่งซื้อ" },
      { key: "manage_orders",   label: "อัปเดตสถานะออเดอร์" },
      { key: "cancel_orders",   label: "ยกเลิกออเดอร์" },
      { key: "refund_orders",   label: "คืนเงิน" },
    ],
  },
  {
    group: "ลูกค้า & ผู้ใช้",
    permissions: [
      { key: "view_customers",  label: "ดูข้อมูลลูกค้า" },
      { key: "edit_customers",  label: "แก้ไขข้อมูลลูกค้า" },
      { key: "manage_admins",   label: "จัดการ Admin users" },
      { key: "manage_roles",    label: "จัดการ Roles & สิทธิ์" },
    ],
  },
  {
    group: "ระบบ",
    permissions: [
      { key: "manage_categories", label: "จัดการหมวดหมู่" },
      { key: "manage_settings",   label: "ตั้งค่าระบบ" },
      { key: "view_logs",         label: "ดู System logs" },
    ],
  },
];

type PermKey = string;

const ROLE_PERMISSIONS: Record<AdminRole, PermKey[]> = {
  super_admin: [
    "view_dashboard","view_reports","export_reports",
    "view_products","create_products","edit_products","delete_products",
    "view_orders","manage_orders","cancel_orders","refund_orders",
    "view_customers","edit_customers","manage_admins","manage_roles",
    "manage_categories","manage_settings","view_logs",
  ],
  admin: [
    "view_dashboard","view_reports","export_reports",
    "view_products","create_products","edit_products","delete_products",
    "view_orders","manage_orders","cancel_orders","refund_orders",
    "view_customers","edit_customers","manage_admins",
    "manage_categories","manage_settings",
  ],
  manager: [
    "view_dashboard","view_reports",
    "view_products","create_products","edit_products",
    "view_orders","manage_orders","cancel_orders",
    "view_customers","edit_customers",
    "manage_categories",
  ],
  staff: [
    "view_dashboard",
    "view_products",
    "view_orders","manage_orders",
    "view_customers",
  ],
};

const ROLE_META: Record<AdminRole, {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  badge: string;
}> = {
  super_admin: {
    label: "Super Admin",
    description: "เข้าถึงและควบคุมทุกส่วนของระบบ รวมถึงการจัดการ Role และ Admin คนอื่น",
    icon: ShieldCheck,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
  },
  admin: {
    label: "Admin",
    description: "จัดการระบบได้เกือบทั้งหมด ยกเว้นการจัดการ Role และ System settings บางส่วน",
    icon: Shield,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
  },
  manager: {
    label: "Manager",
    description: "ดูแลสินค้า คำสั่งซื้อ และลูกค้า ไม่สามารถจัดการ Admin users หรือ Settings ได้",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  staff: {
    label: "Staff",
    description: "ดูข้อมูลและอัปเดตสถานะออเดอร์ได้ ไม่มีสิทธิ์แก้ไขหรือลบข้อมูลสำคัญ",
    icon: User,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
  },
};

const ROLES: AdminRole[] = ["super_admin", "admin", "manager", "staff"];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
const avatarBg: Record<AdminRole, string> = {
  super_admin: "bg-red-500",
  admin: "bg-violet-500",
  manager: "bg-blue-500",
  staff: "bg-gray-400",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RolesPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<AdminRole | null>(null);

  useEffect(() => {
    fetch("/api/admin/users?limit=200")
      .then((r) => r.json())
      .then((d) => {
        setUsers(
          (d.users ?? []).map((u: Record<string, unknown>) => ({
            id:   String(u._id ?? u.id),
            name: String(u.name ?? ""),
            role: (u.role as AdminRole) ?? "staff",
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const countByRole = (role: AdminRole) => users.filter((u) => u.role === role).length;
  const usersByRole = (role: AdminRole) => users.filter((u) => u.role === role).slice(0, 5);

  const allPerms = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));
  const totalPerms = allPerms.length;

  return (
    <div>
      <Header title="Roles & สิทธิ์การใช้งาน" />
      <main className="p-6 space-y-6">

        {/* Summary bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROLES.map((role) => {
            const m = ROLE_META[role];
            const Icon = m.icon;
            const count = countByRole(role);
            const permCount = ROLE_PERMISSIONS[role].length;
            return (
              <button
                key={role}
                onClick={() => setExpanded(expanded === role ? null : role)}
                className={`text-left rounded-xl border p-4 transition-all duration-200 ${
                  expanded === role ? `${m.bg} ${m.border}` : "bg-white border-gray-100 hover:border-gray-200"
                } shadow-sm`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${m.color}`} />
                  </div>
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${m.badge}`}>
                    {count} คน
                  </span>
                </div>
                <p className="font-semibold text-sm text-gray-800">{m.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{permCount}/{totalPerms} สิทธิ์</p>
                {/* mini permission bar */}
                <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${m.bg.replace("50","400")}`}
                    style={{ width: `${(permCount / totalPerms) * 100}%`, backgroundColor: undefined }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Permission matrix */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">Permission Matrix</h2>
              <p className="text-xs text-gray-400 mt-0.5">ตารางสิทธิ์ทั้งหมดของแต่ละ Role</p>
            </div>
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              จัดการผู้ดูแล <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-left font-medium text-gray-500 text-xs w-56">สิทธิ์</th>
                  {ROLES.map((role) => {
                    const m = ROLE_META[role];
                    const Icon = m.icon;
                    return (
                      <th key={role} className="px-4 py-3 text-center font-medium text-xs">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${m.color}`} />
                          </div>
                          <span className="text-gray-600">{m.label}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_GROUPS.map((group) => (
                  <React.Fragment key={group.group}>
                    {/* group header */}
                    <tr className="bg-gray-50/40">
                      <td
                        colSpan={5}
                        className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                      >
                        {group.group}
                      </td>
                    </tr>
                    {group.permissions.map((perm) => (
                      <tr key={perm.key} className="border-t border-gray-50 hover:bg-gray-50/40 transition-colors">
                        <td className="px-5 py-2.5 text-xs text-gray-600">{perm.label}</td>
                        {ROLES.map((role) => {
                          const has = ROLE_PERMISSIONS[role].includes(perm.key);
                          return (
                            <td key={role} className="px-4 py-2.5 text-center">
                              {has ? (
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100">
                                  <Check className="h-3 w-3 text-emerald-600" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100">
                                  <X className="h-3 w-3 text-gray-300" />
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expanded role detail */}
        {expanded && (() => {
          const m = ROLE_META[expanded];
          const Icon = m.icon;
          const members = usersByRole(expanded);
          const count = countByRole(expanded);
          return (
            <div className={`rounded-xl border ${m.border} ${m.bg} p-5 space-y-4`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm`}>
                    <Icon className={`h-5 w-5 ${m.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{m.label}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-md">{m.description}</p>
                  </div>
                </div>
                <Link
                  href={`/admin/users?role=${expanded}`}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm transition-colors"
                >
                  <Users className="h-3.5 w-3.5" /> ดูผู้ใช้ทั้งหมด
                </Link>
              </div>

              {/* Members */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  ผู้ดูแลใน Role นี้ {loading ? "…" : `(${count} คน)`}
                </p>
                {loading ? (
                  <p className="text-xs text-gray-400">กำลังโหลด...</p>
                ) : members.length === 0 ? (
                  <p className="text-xs text-gray-400">ยังไม่มีผู้ดูแลใน Role นี้</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {members.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1 border border-gray-200 shadow-sm"
                      >
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-semibold ${avatarBg[u.role]}`}>
                          {initials(u.name)}
                        </div>
                        <span className="text-xs text-gray-700">{u.name}</span>
                      </div>
                    ))}
                    {count > 5 && (
                      <Link
                        href={`/admin/users?role=${expanded}`}
                        className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 border border-gray-200 shadow-sm text-xs text-gray-500 hover:text-gray-700"
                      >
                        +{count - 5} คน
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </main>
    </div>
  );
}
