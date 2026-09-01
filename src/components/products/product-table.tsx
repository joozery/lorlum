"use client";

import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ProductRowMenu } from "./product-row-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
  onToggleActive: (id: string) => void;
}

export function ProductTable({ products, onToggleActive }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-4 py-3 text-left font-medium text-gray-500">สินค้า</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">หมวดหมู่</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">ราคา</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Stock</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">แนะนำ</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">แสดง</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">อัปเดตล่าสุด</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-400">{product.nameEn}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{product.sku}</td>
              <td className="px-4 py-3">
                <Badge>{product.category}</Badge>
              </td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">
                {formatCurrency(product.price)}
              </td>
              <td className="px-4 py-3 text-right">
                <Badge variant={product.stock <= 5 ? "destructive" : product.stock <= 10 ? "warning" : "success"}>
                  {product.stock} ชิ้น
                </Badge>
              </td>
              <td className="px-4 py-3 text-center">
                {product.featured ? (
                  <Badge variant="warning">แนะนำ</Badge>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <Switch
                  checked={product.isActive}
                  onCheckedChange={() => onToggleActive(product.id)}
                />
              </td>
              <td className="px-4 py-3 text-left text-xs text-gray-400">
                {formatDate(product.updatedAt)}
              </td>
              <td className="px-4 py-3 text-center">
                <ProductRowMenu
                  product={product}
                  onToggleActive={onToggleActive}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
