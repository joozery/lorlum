import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface HistoryItem {
  id: string; sku: string; name: string;
  type: string; qty: number; note: string; date: string;
}

const typeConfig = {
  in: {
    label: "รับเข้า",
    icon: TrendingUp,
    chip: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot:  "bg-emerald-500",
    qty:  "text-emerald-600",
  },
  out: {
    label: "จ่ายออก",
    icon: TrendingDown,
    chip: "bg-red-50 text-red-600 border border-red-100",
    dot:  "bg-red-500",
    qty:  "text-red-500",
  },
  adjustment: {
    label: "ปรับยอด",
    icon: ArrowUpDown,
    chip: "bg-gray-50 text-gray-600 border border-gray-200",
    dot:  "bg-gray-400",
    qty:  "text-gray-600",
  },
} as const;

export function StockHistoryTable({ history = [] }: { history?: HistoryItem[] }) {
  if (history.length === 0) return (
    <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-gray-400 text-sm">
      ยังไม่มีประวัติการเคลื่อนไหวของสต็อก
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">ประเภท</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">สินค้า</th>
            <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">จำนวน</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">หมายเหตุ</th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">วันที่</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {history.map((h) => {
            const cfg  = typeConfig[h.type as keyof typeof typeConfig] ?? typeConfig.adjustment;
            const Icon = cfg.icon;
            const sign = h.qty > 0 ? `+${h.qty}` : String(h.qty);

            return (
              <tr key={h.id} className="hover:bg-gray-50/60 transition-colors">

                {/* Type badge */}
                <td className="px-5 py-4">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", cfg.chip)}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </td>

                {/* Product */}
                <td className="px-5 py-4">
                  <p className="text-xs font-semibold text-gray-800">{h.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-gray-400">{h.sku}</p>
                </td>

                {/* Quantity */}
                <td className="px-5 py-4 text-center">
                  <span className={cn("text-sm font-bold", cfg.qty)}>{sign}</span>
                  <span className="ml-1 text-xs text-gray-400">ชิ้น</span>
                </td>

                {/* Note */}
                <td className="px-5 py-4">
                  <p className="max-w-[200px] truncate text-xs text-gray-500">{h.note}</p>
                </td>

                {/* Date */}
                <td className="px-5 py-4">
                  <p className="text-xs text-gray-700">{formatDate(h.date)}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
