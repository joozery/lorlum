"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

const ROUTE_CRUMBS: Record<string, Crumb[]> = {
  "/dashboard":       [{ label: "แดชบอร์ด" }],
  "/products":        [{ label: "สินค้า" }, { label: "ทั้งหมด" }],
  "/products/new":    [{ label: "สินค้า" }, { label: "เพิ่มสินค้าใหม่" }],
  "/categories": [{ label: "สินค้า" }, { label: "หมวดหมู่" }],
  "/orders":     [{ label: "การขาย" }, { label: "คำสั่งซื้อ" }],
  "/payments":   [{ label: "การขาย" }, { label: "การชำระเงิน" }],
  "/customers":  [{ label: "การขาย" }, { label: "ลูกค้า" }],
  "/inventory":  [{ label: "คลังสินค้า" }, { label: "สินค้าคงเหลือ" }],
  "/purchases":  [{ label: "คลังสินค้า" }, { label: "การจัดซื้อ" }],
  "/storefront": [{ label: "หน้าร้าน" }, { label: "หน้าแรก" }],
  "/admins":     [{ label: "ผู้ดูแลระบบ" }, { label: "แอดมิน" }],
  "/roles":      [{ label: "ผู้ดูแลระบบ" }, { label: "สิทธิ์การใช้งาน" }],
  "/settings":   [{ label: "ผู้ดูแลระบบ" }, { label: "ตั้งค่า" }],
};

export function Breadcrumb() {
  const pathname = usePathname();
  // Match dynamic edit route: /products/[id]/edit
  const editMatch = pathname.match(/^\/products\/[^/]+\/edit$/);
  const crumbs = ROUTE_CRUMBS[pathname] ??
    (editMatch ? [{ label: "สินค้า" }, { label: "แก้ไขสินค้า" }] : []);

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>หน้าหลัก</span>
      </Link>

      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            {isLast ? (
              <span className="font-medium text-gray-800">{crumb.label}</span>
            ) : (
              <span className="text-gray-400">{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
