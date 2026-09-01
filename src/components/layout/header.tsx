"use client";

import { useState } from "react";
import { Bell, Search, Globe, Check, ShoppingCart, Package, AlertTriangle, X } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLanguage } from "@/contexts/language-context";
import T from "@/lib/translations";

const NOTIFICATIONS = [
  {
    id: 1,
    icon: ShoppingCart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "คำสั่งซื้อใหม่",
    desc: "ORD-1042 จาก สมชาย ว. ยอด ฿2,400",
    time: "2 นาทีที่แล้ว",
    read: false,
  },
  {
    id: 2,
    icon: Package,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "รับสินค้าแล้ว",
    desc: "PO-001 เสื้อยืด Basic 100 ชิ้น รับครบ",
    time: "1 ชั่วโมงที่แล้ว",
    read: false,
  },
  {
    id: 3,
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Stock ใกล้หมด",
    desc: "กางเกง Slim Fit สีดำ เหลือ 5 ชิ้น",
    time: "3 ชั่วโมงที่แล้ว",
    read: true,
  },
  {
    id: 4,
    icon: ShoppingCart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "ชำระเงินสำเร็จ",
    desc: "TXN-2891 ฿8,900 ผ่าน KBank",
    time: "เมื่อวาน",
    read: true,
  },
];

export function Header({ title }: { title?: string }) {
  const { lang, setLang } = useLanguage();
  const t = T[lang];

  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <TooltipProvider delayDuration={200}>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/95 px-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={lang === "th" ? "ค้นหา..." : "Search..."}
              className="w-52 pl-9 text-sm border-gray-200"
            />
          </div>

          <Separator orientation="vertical" className="h-5 mx-1" />

          {/* Language */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Globe className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t.changeLang}</TooltipContent>
              </Tooltip>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[160px] rounded-xl border border-gray-100 bg-white p-1 shadow-lg"
                align="end"
                sideOffset={8}
              >
                <DropdownMenu.Item
                  onSelect={() => setLang("th")}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-50"
                >
                  🇹🇭 ภาษาไทย
                  {lang === "th" && <Check className="ml-auto h-3.5 w-3.5 text-blue-500" />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => setLang("en")}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-50"
                >
                  🇺🇸 English
                  {lang === "en" && <Check className="ml-auto h-3.5 w-3.5 text-blue-500" />}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Notifications */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t.notifications}</TooltipContent>
              </Tooltip>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl"
                align="end"
                sideOffset={8}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{t.notifications}</p>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                        {unreadCount} {lang === "th" ? "ใหม่" : "new"}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800"
                    >
                      <Check className="h-3 w-3" />
                      {t.markAllRead}
                    </button>
                  )}
                </div>

                {/* Items */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Bell className="h-8 w-8 mb-2 opacity-30" />
                      <p className="text-sm">{t.noNotifications}</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <DropdownMenu.Item
                          key={n.id}
                          className={cn(
                            "group flex items-start gap-3 px-4 py-3 outline-none cursor-pointer transition-colors",
                            n.read ? "hover:bg-gray-50" : "bg-blue-50/40 hover:bg-blue-50/70"
                          )}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg", n.iconBg)}>
                            <Icon className={cn("h-4 w-4", n.iconColor)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <p className={cn("text-xs font-semibold text-gray-800 leading-snug", !n.read && "font-bold")}>
                                {n.title}
                              </p>
                              {!n.read && <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />}
                            </div>
                            <p className="mt-0.5 text-[11px] text-gray-500 leading-snug line-clamp-2">{n.desc}</p>
                            <p className="mt-1 text-[10px] text-gray-400">{n.time}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                            className="mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700" />
                          </button>
                        </DropdownMenu.Item>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t border-gray-100 px-4 py-2.5">
                    <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800">
                      {lang === "th" ? "ดูการแจ้งเตือนทั้งหมด →" : "View all notifications →"}
                    </button>
                  </div>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>
    </TooltipProvider>
  );
}
