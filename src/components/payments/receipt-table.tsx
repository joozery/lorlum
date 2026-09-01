import { FileText, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
];

interface Receipt {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  amount: number;
  sentAt: string;
  sentCount: number;
}

interface ReceiptTableProps {
  receipts?: Receipt[];
}

export function ReceiptTable({ receipts = [] }: ReceiptTableProps) {
  if (receipts.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-gray-400">
        <p className="text-sm font-medium">ยังไม่มีใบเสร็จ</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">ใบเสร็จ</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">ลูกค้า</th>
            <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">จำนวนเงิน</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">ส่งเมื่อ</th>
            <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {receipts.map((r, i) => (
            <tr key={r.id} className="group hover:bg-gray-50/60 transition-colors">
              <td className="px-5 py-4">
                <p className="font-mono text-xs font-bold text-gray-800">{r.id}</p>
                <p className="mt-0.5 font-mono text-[11px] text-gray-400">{r.orderId}</p>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold", avatarColors[i % avatarColors.length])}>
                    {r.customer.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{r.customer}</p>
                    <p className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Mail className="h-3 w-3" />
                      {r.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-right">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(r.amount)}</p>
              </td>
              <td className="px-5 py-4">
                <p className="text-xs text-gray-700">{formatDate(r.sentAt)}</p>
                <p className="text-[11px] text-gray-400">ส่งแล้ว {r.sentCount} ครั้ง</p>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-gray-600 hover:text-gray-900">
                    <FileText className="h-3.5 w-3.5" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Send className="h-3.5 w-3.5" /> ส่งซ้ำ
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
