"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface RevenueDataPoint {
  day: string;
  revenue: number;
  orders: number;
}

function formatK(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3.5 py-3 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-gray-400">วัน{label}</p>
      <p className="text-sm font-bold text-gray-900">
        ฿{payload[0].value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-400">{payload[1]?.value} ออเดอร์</p>
    </div>
  );
}

interface RevenueChartProps {
  data?: RevenueDataPoint[];
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#111" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#111" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatK}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#111111"
          strokeWidth={2}
          fill="url(#revGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#111", stroke: "#fff", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="orders"
          stroke="transparent"
          fill="transparent"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
