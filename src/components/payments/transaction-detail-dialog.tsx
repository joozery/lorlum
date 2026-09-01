"use client";

import { CreditCard, RefreshCw, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { txStatusConfig, type Transaction } from "@/lib/data/payments";

const statusIcon = {
  success:  CheckCircle2,
  pending:  Clock,
  failed:   XCircle,
  refunded: RefreshCw,
};

const statusHero: Record<string, string> = {
  success:  "bg-emerald-50 text-emerald-700",
  pending:  "bg-amber-50 text-amber-700",
  failed:   "bg-red-50 text-red-600",
  refunded: "bg-blue-50 text-blue-700",
};

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  onClose: () => void;
}

function DetailBody({ tx }: { tx: Transaction }) {
  const StatusIcon = statusIcon[tx.status as keyof typeof statusIcon] ?? CheckCircle2;
  const heroClass  = statusHero[tx.status] ?? "bg-gray-50 text-gray-700";
  const status     = txStatusConfig[tx.status];

  const rows = [
    { label: "Transaction ID",   value: tx.id,                              mono: true  },
    { label: "Gateway Reference", value: tx.txRef,                          mono: true  },
    { label: "ออเดอร์",           value: tx.orderId,                        mono: true  },
    { label: "ลูกค้า",            value: tx.customer,                       mono: false },
    { label: "ช่องทางชำระเงิน",  value: `${tx.method} · ${tx.gateway}`,   mono: false },
    { label: "วันที่ทำรายการ",   value: formatDate(tx.createdAt),          mono: false },
  ];

  return (
    <div className="space-y-4 text-sm">
      {/* Amount hero */}
      <div className="rounded-2xl bg-gray-50 px-6 py-5 text-center">
        <p className="text-xs font-medium text-gray-400">จำนวนเงิน</p>
        <p className={cn(
          "mt-1 text-3xl font-bold tracking-tight",
          tx.status === "failed" ? "text-gray-300 line-through" : "text-gray-900"
        )}>
          {formatCurrency(tx.amount, tx.currency)}
        </p>
        <div className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", heroClass)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-xl bg-gray-50/80 px-4 py-2.5">
            <p className="text-xs text-gray-400">{row.label}</p>
            <p className={cn("max-w-[200px] truncate text-right text-xs font-semibold text-gray-800", row.mono && "font-mono")}>
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {tx.status === "pending" && (
        <Button className="w-full gap-2" size="sm">
          <RefreshCw className="h-3.5 w-3.5" />
          ตรวจสอบสถานะจาก Gateway
        </Button>
      )}
    </div>
  );
}

export function TransactionDetailDialog({ transaction, onClose }: TransactionDetailDialogProps) {
  return (
    <Dialog open={!!transaction} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <CreditCard className="h-4 w-4 text-gray-600" />
            </div>
            รายละเอียด Transaction
          </DialogTitle>
        </DialogHeader>
        {transaction && <DetailBody tx={transaction} />}
      </DialogContent>
    </Dialog>
  );
}
