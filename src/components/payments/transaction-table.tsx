"use client";

import Image from "next/image";
import { Eye, CheckCircle2, Clock, XCircle, RefreshCw, QrCode, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { txStatusConfig, type Transaction } from "@/lib/data/payments";

/* ── Status ─────────────────────────────────── */
const statusIcons = {
  success:  CheckCircle2,
  pending:  Clock,
  failed:   XCircle,
  refunded: RefreshCw,
};
const statusDot: Record<string, string> = {
  success:  "bg-emerald-500",
  pending:  "bg-amber-400",
  failed:   "bg-red-500",
  refunded: "bg-blue-400",
};

/* ── Gateway chip ────────────────────────────── */
interface GatewayConfig {
  logo?: string;
  bg: string;
  text: string;
  border?: string;
}
const gatewayConfig: Record<string, GatewayConfig> = {
  SCB:    { logo: "/logobank/scb.svg",    bg: "bg-[#4E2D8E]",   text: "text-white" },
  KBank:  { logo: "/logobank/kbank.svg",  bg: "bg-[#1B8B4A]",   text: "text-white" },
  Stripe: { logo: "/logobank/stripe.svg", bg: "bg-violet-50",   text: "text-violet-700", border: "border border-violet-100" },
  Omise:  {                               bg: "bg-sky-50",       text: "text-sky-700",    border: "border border-sky-100" },
};

/* ── Payment method icon ─────────────────────── */
const methodConfig: Record<string, { logo?: string; icon?: React.ElementType; color: string }> = {
  "Credit Card": { logo: "/logobank/visa.svg",  color: "text-[#1A1F71]" },
  "PromptPay":   { icon: QrCode,                color: "text-blue-600"  },
};

/* ── Customer avatars ────────────────────────── */
const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

interface TransactionTableProps {
  transactions: Transaction[];
  onView: (tx: Transaction) => void;
}

function GatewayChip({ gateway }: { gateway: string }) {
  const cfg = gatewayConfig[gateway];
  if (!cfg) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
        {gateway}
      </span>
    );
  }
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold",
      cfg.bg, cfg.text, cfg.border
    )}>
      {cfg.logo && (
        <span className="relative flex h-3.5 w-auto">
          <Image src={cfg.logo} alt={gateway} width={14} height={14} className="object-contain" />
        </span>
      )}
      {gateway}
    </span>
  );
}

function MethodCell({ method }: { method: string }) {
  const cfg = methodConfig[method];
  const Icon = cfg?.icon ?? CreditCard;
  return (
    <div className="flex items-center gap-1.5">
      {cfg?.logo ? (
        <Image src={cfg.logo} alt={method} width={18} height={12} className="object-contain" />
      ) : (
        <Icon className={cn("h-3.5 w-3.5", cfg?.color ?? "text-gray-400")} />
      )}
      <span className="text-xs font-medium text-gray-700">{method}</span>
    </div>
  );
}

export function TransactionTable({ transactions, onView }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-gray-400">
        <p className="text-sm font-medium">ไม่พบรายการที่ค้นหา</p>
        <p className="mt-1 text-xs">ลองปรับเงื่อนไขการค้นหาใหม่</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Transaction</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">ลูกค้า</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">ช่องทาง</th>
            <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">สถานะ</th>
            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">จำนวนเงิน</th>
            <th className="w-12 px-5 py-3.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((tx, i) => {
            const status      = txStatusConfig[tx.status];
            const StatusIcon  = statusIcons[tx.status as keyof typeof statusIcons];
            const avatarColor = avatarColors[i % avatarColors.length];

            return (
              <tr key={tx.id} className="group hover:bg-gray-50/60 transition-colors">

                {/* Transaction ID + Order */}
                <td className="px-5 py-4">
                  <p className="font-mono text-xs font-bold text-gray-800">{tx.id}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-gray-400">{tx.orderId}</p>
                </td>

                {/* Customer */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold", avatarColor)}>
                      {tx.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">{tx.customer}</p>
                      <p className="text-[11px] text-gray-400">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                </td>

                {/* Method + Gateway */}
                <td className="px-5 py-4">
                  <MethodCell method={tx.method} />
                  <div className="mt-1.5">
                    <GatewayChip gateway={tx.gateway} />
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4 text-center">
                  <Badge variant={status.variant} className="inline-flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[tx.status])} />
                    {status.label}
                  </Badge>
                </td>

                {/* Amount */}
                <td className="px-5 py-4 text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    tx.status === "failed"   && "text-gray-300 line-through",
                    tx.status === "refunded" && "text-gray-400",
                    tx.status === "success"  && "text-gray-900",
                    tx.status === "pending"  && "text-gray-700",
                  )}>
                    {formatCurrency(tx.amount, tx.currency)}
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{tx.currency}</p>
                </td>

                {/* Action */}
                <td className="px-3 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onView(tx)}
                  >
                    <Eye className="h-3.5 w-3.5 text-gray-500" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
