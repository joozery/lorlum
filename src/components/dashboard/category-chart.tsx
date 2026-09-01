"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-900">{payload[0].name}</p>
      <p className="text-xs text-gray-400">{payload[0].value}%</p>
    </div>
  );
}

interface CategoryChartProps {
  data?: CategoryDataPoint[];
}

export function CategoryChart({ data = [] }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] text-gray-400 text-xs">
        ยังไม่มีข้อมูลยอดขาย
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto h-[160px] w-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-bold text-gray-900">{data.length}</p>
          <p className="text-[10px] text-gray-400">หมวดหมู่</p>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: d.color,
                  border: d.color === "#f3f4f6" ? "1px solid #e5e7eb" : undefined,
                }}
              />
              <span className="text-xs text-gray-600">{d.name}</span>
            </div>
            <span className="text-xs font-semibold text-gray-900">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
