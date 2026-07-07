"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SurveyBarData {
  title: string;
  totalResponses: number;
  totalViews: number;
  completionRate: number;
}

interface SurveysBarChartProps {
  data: SurveyBarData[];
}

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#f97316",
];

export function SurveysBarChart({ data }: SurveysBarChartProps) {
  const truncated = data.slice(0, 7).map((d, i) => ({
    ...d,
    label: d.title.length > 14 ? d.title.slice(0, 14) + "…" : d.title,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-zinc-900">Responses by Survey</h3>
        <p className="text-sm text-zinc-500">Top surveys by response count</p>
      </div>

      {truncated.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg bg-zinc-50 text-sm text-zinc-400">
          No surveys found
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={truncated}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
              }}
              formatter={(value, name) => [
                value,
                name === "totalResponses" ? "Responses" : String(name),
              ]}
              labelFormatter={(label) => {
                const item = truncated.find((d) => d.label === label);
                return item?.title ?? label;
              }}
            />
            <Bar dataKey="totalResponses" radius={[4, 4, 0, 0]}>
              {truncated.map((entry, index) => {
                const fill = entry.color ?? "#6366f1";
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
