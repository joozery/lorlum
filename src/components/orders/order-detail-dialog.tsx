"use client";

import { FileText, ChevronRight, User, Calendar, CreditCard, MapPin, Scissors } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderStatusConfig, nextOrderStatus, nextOrderStatusLabel } from "@/lib/data/orders";
import type { Order, OrderStatus, BespokeMeasurements } from "@/types";

interface OrderDetailDialogProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

const STATUS_STEPS: OrderStatus[] = ["pending", "paid", "processing", "shipped"];

function BespokeMeasurementsPanel({ m, garmentType }: { m: BespokeMeasurements; garmentType?: string }) {
  const type = m.garmentType ?? garmentType ?? "shirt";

  const shirtRows = [
    { label: "Chest", value: m.chest },
    { label: "Waist", value: m.waist },
    { label: "Shoulder", value: m.shoulder },
    { label: "Sleeve / Length", value: m.sleeve },
  ];

  const trouserRows = [
    { label: "Waist", value: m.waist },
    { label: "Hip", value: m.hip },
    { label: "Rise", value: m.rise },
    { label: "Thigh", value: m.thigh },
    { label: "Outseam", value: m.outseam },
    { label: "Hem", value: m.hem },
  ];

  const rows = type === "trousers" ? trouserRows : shirtRows;

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Scissors className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
          Bespoke — {type === "trousers" ? "Trousers" : "Shirt"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {rows.map(r => r.value ? (
          <div key={r.label} className="bg-white rounded-lg px-2.5 py-2 border border-amber-100">
            <p className="text-[9px] uppercase tracking-wide text-amber-500 mb-0.5">{r.label}</p>
            <p className="text-sm font-semibold text-gray-800">{r.value} <span className="text-[10px] font-normal text-gray-400">cm</span></p>
          </div>
        ) : null)}
      </div>
      {m.note && (
        <p className="mt-2 text-[11px] text-amber-700 italic border-t border-amber-100 pt-2">
          Note: {m.note}
        </p>
      )}
    </div>
  );
}

export function OrderDetailDialog({ order, onClose, onUpdateStatus }: OrderDetailDialogProps) {
  if (!order) return null;

  const status = orderStatusConfig[order.status];
  const ns = nextOrderStatus[order.status];
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const bespokeItems = order.items.filter(i => i.size === "Bespoke");
  const hasPendingBespoke = bespokeItems.some(i => !i.bespokeMeasurements);

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-gray-400" />
              {order.orderNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {bespokeItems.length > 0 && (
                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium ${
                  hasPendingBespoke ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  <Scissors className="h-3 w-3" />
                  {hasPendingBespoke ? "รอขนาด Bespoke" : "Bespoke ✓"}
                </span>
              )}
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">

          {/* Status timeline */}
          {!isCancelled && (
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const isLast = i === STATUS_STEPS.length - 1;
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`h-2.5 w-2.5 rounded-full border-2 transition-colors ${
                        done ? "border-gray-900 bg-gray-900" : "border-gray-200 bg-white"
                      }`} />
                      <span className={`text-[10px] whitespace-nowrap ${done ? "text-gray-700 font-medium" : "text-gray-300"}`}>
                        {orderStatusConfig[step].label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={`h-px flex-1 mx-1 mb-3 ${i < currentStep ? "bg-gray-900" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400">
                <User className="h-3.5 w-3.5" />
                <span className="text-xs">ลูกค้า</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{order.customerName}</p>
              <p className="text-[11px] text-gray-400 truncate">{order.customerEmail}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">วันที่</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{formatDate(order.createdAt)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400">
                <CreditCard className="h-3.5 w-3.5" />
                <span className="text-xs">ชำระเงิน</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (order.shippingAddress.line1 || order.shippingAddress.city) && (
            <div className="rounded-xl bg-gray-50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">ที่อยู่จัดส่ง</span>
              </div>
              {order.shippingAddress.name && (
                <p className="text-sm font-semibold text-gray-900">{order.shippingAddress.name}</p>
              )}
              {order.shippingAddress.phone && (
                <p className="text-[11px] text-gray-500">{order.shippingAddress.phone}</p>
              )}
              <p className="text-[11px] text-gray-700 leading-relaxed">
                {[order.shippingAddress.line1, order.shippingAddress.line2].filter(Boolean).join(" ")}
              </p>
              <p className="text-[11px] text-gray-700">
                {[order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.zip].filter(Boolean).join(", ")}
                {order.shippingAddress.country ? ` ${order.shippingAddress.country}` : ""}
              </p>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">รายการสินค้า</p>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              {order.items.map((item, i) => (
                <div key={i} className="border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                        {item.size === "Bespoke" && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                            <Scissors className="h-2.5 w-2.5" /> Bespoke
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {item.quantity} ชิ้น × {formatCurrency(item.price)}
                        {item.color && ` · ${item.color}`}
                        {item.size && item.size !== "Bespoke" && ` · EU ${item.size}`}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 ml-3">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Bespoke measurements for this item */}
                  {item.size === "Bespoke" && (
                    <div className="px-4 pb-3">
                      {item.bespokeMeasurements ? (
                        <BespokeMeasurementsPanel m={item.bespokeMeasurements} />
                      ) : (
                        <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 flex items-center gap-2">
                          <Scissors className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <p className="text-[11px] text-amber-700">
                            ลูกค้ายังไม่ได้กรอกขนาด Bespoke — รอการยืนยัน
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-700">ยอดรวมทั้งสิ้น</p>
                <p className="text-base font-bold text-gray-900">
                  {formatCurrency(order.total, order.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-1">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              ออกใบเสร็จ
            </Button>
            {ns && (
              <Button size="sm" className="gap-1.5" onClick={() => onUpdateStatus(order.id, ns)}>
                {nextOrderStatusLabel[ns]}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
