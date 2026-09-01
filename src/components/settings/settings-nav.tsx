"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, DollarSign, CreditCard, Mail, Shield } from "lucide-react";

const NAV = [
  { href: "/settings/general",  label: "ทั่วไป",            sub: "ข้อมูลร้านค้า & ภาษา",  icon: Globe },
  { href: "/settings/currency", label: "สกุลเงิน",          sub: "อัตราแลกเปลี่ยน",        icon: DollarSign },
  { href: "/settings/payment",  label: "ชำระเงิน",          sub: "Payment gateway",         icon: CreditCard },
  { href: "/settings/email",    label: "อีเมล",             sub: "SMTP & การแจ้งเตือน",     icon: Mail },
  { href: "/settings/otp",      label: "OTP & ความปลอดภัย", sub: "2FA & การยืนยันตัวตน",   icon: Shield },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">การตั้งค่า</p>
      </div>
      <ul className="py-1.5">
        {NAV.map(({ href, label, sub, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors group ${
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${active ? "bg-violet-100" : "bg-gray-100 group-hover:bg-gray-200"}`}>
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-violet-600" : "text-gray-500"}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-tight ${active ? "text-violet-700" : ""}`}>{label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{sub}</p>
                </div>
                {active && <div className="ml-auto h-4 w-0.5 rounded-full bg-violet-400" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
