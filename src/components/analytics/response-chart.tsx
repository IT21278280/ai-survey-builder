"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

interface DataPoint {
  label: string;
  value: number;
  percentage: number;
}

interface ResponseChartProps {
  title: string;
  data: DataPoint[];
}

export function ResponseChart({ title, data }: ResponseChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="mb-4 text-sm font-semibold text-gray-900">{title}</h4>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No responses yet
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11 }}
              width={100}
            />
            <Tooltip
              formatter={(value) => [
                `${value}`,
                "Responses",
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((_entry, index) => {
                const fill = COLORS[index % COLORS.length] ?? "#6366f1";
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
