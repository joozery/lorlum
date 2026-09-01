"use client";

import { Eye, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderStatusConfig, nextOrderStatus, nextOrderStatusLabel } from "@/lib/data/orders";
import type { Order, OrderStatus } from "@/types";

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}>
      {initials}
    </div>
  );
}

export function OrderTable({ orders, onView, onUpdateStatus }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white py-16 shadow-sm">
        <p className="text-sm text-gray-400">ไม่พบออเดอร์</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">ออเดอร์</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">ลูกค้า</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">สินค้า</th>
            <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">สถานะ</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">ชำระเงิน</th>
            <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">ยอดรวม</th>
            <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => {
            const status = orderStatusConfig[order.status] ?? { label: order.status, variant: "default" as const };
            const ns = nextOrderStatus[order.status] ?? null;
            const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <tr
                key={order.id}
                className="group hover:bg-gray-50/60 transition-colors"
              >
                {/* Order number */}
                <td className="px-5 py-4">
                  <div>
                    <p className="font-mono text-xs font-semibold text-gray-800">{order.orderNumber}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                </td>

                {/* Customer */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={order.customerName} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{order.customerName}</p>
                      <p className="truncate text-xs text-gray-400">{order.customerEmail}</p>
                    </div>
                  </div>
                </td>

                {/* Items */}
                <td className="px-5 py-4">
                  <div className="space-y-0.5">
                    <p className="text-gray-700 line-clamp-1">{order.items[0].productName}</p>
                    {order.items.length > 1 && (
                      <p className="text-xs text-gray-400">+{order.items.length - 1} รายการอื่น</p>
                    )}
                    <p className="text-[11px] text-gray-400">{totalQty} ชิ้น</p>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4 text-center">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>

                {/* Payment */}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {order.paymentMethod}
                  </span>
                </td>

                {/* Total */}
                <td className="px-5 py-4 text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(order.total, order.currency)}</p>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onView(order)}
                      title="ดูรายละเอียด"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {ns ? (
                      <Button
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => onUpdateStatus(order.id, ns)}
                      >
                        {nextOrderStatusLabel[ns]}
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onView(order)}
                      >
                        ดูรายละเอียด
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
