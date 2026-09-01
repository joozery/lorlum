"use client";

import { BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
}

export function Sparkline({ data, color = "#111111" }: SparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <BarChart data={chartData} barSize={4} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="rounded-lg border border-gray-100 bg-white px-2 py-1 text-xs shadow">
                {payload[0].value}
              </div>
            ) : null
          }
          cursor={false}
        />
        <Bar dataKey="v" fill={color} radius={[2, 2, 0, 0]} opacity={0.8} />
      </BarChart>
    </ResponsiveContainer>
  );
}
