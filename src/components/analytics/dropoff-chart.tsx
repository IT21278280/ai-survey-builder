"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import type { QuestionDropOff, DropOffSummary } from "@/actions/dropoff";
import { TrendingDown, Users, CheckCircle2, AlertTriangle } from "lucide-react";

interface DropOffChartProps {
  data: DropOffSummary;
}

function fmtTime(seconds: number): string {
  if (seconds === 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function truncate(s: string, max = 22): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function DropOffChart({ data }: DropOffChartProps) {
  const { questions, topDropOffIndex, totalSessions, completedSessions, overallDropOffRate } =
    data;

  if (totalSessions === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-zinc-400" />
          <h3 className="text-base font-semibold text-zinc-900">Drop-Off Analysis</h3>
        </div>
        <div className="flex h-48 items-center justify-center rounded-lg bg-zinc-50 text-sm text-zinc-400">
          No respondents yet — data will appear once people start your survey
        </div>
      </div>
    );
  }

  const chartData = questions.map((q, i) => ({
    label: `Q${i + 1}`,
    title: q.questionTitle,
    reached: q.reached,
    answered: q.answered,
    abandoned: q.abandoned,
    dropOffRate: q.dropOffRate,
    isWorst: i === topDropOffIndex && q.abandoned > 0,
  }));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      {/* Header */}
      <div className="border-b border-zinc-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            <h3 className="text-base font-semibold text-zinc-900">Drop-Off Analysis</h3>
          </div>
        </div>
        <p className="mt-0.5 text-sm text-zinc-500">
          Per-question reach, answers, and abandonment across all respondents
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 divide-x divide-zinc-100 border-b border-zinc-100">
        {[
          {
            label: "Total Sessions",
            value: totalSessions,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Completed",
            value: completedSessions,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Overall Drop-Off",
            value: `${overallDropOffRate}%`,
            icon: TrendingDown,
            color: overallDropOffRate > 50 ? "text-rose-600" : "text-amber-600",
            bg: overallDropOffRate > 50 ? "bg-rose-50" : "bg-amber-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="px-6 py-4">
            <div className={cn("mb-2 inline-flex rounded-lg p-1.5", bg)}>
              <Icon className={cn("h-3.5 w-3.5", color)} />
            </div>
            <p className="text-2xl font-bold text-zinc-900">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="px-6 py-5">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 24, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              tickLine={false}
              axisLine={false}
            />
            {/* Left axis: counts */}
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            {/* Right axis: drop-off % */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e4e4e7",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
              }}
              formatter={(value, name) => {
                if (name === "dropOffRate") return [`${value}%`, "Drop-Off Rate"];
                if (name === "reached") return [value, "Reached"];
                if (name === "abandoned") return [value, "Abandoned"];
                return [value, String(name)];
              }}
              labelFormatter={(label) => {
                const item = chartData.find((d) => d.label === String(label));
                return item ? truncate(item.title, 40) : String(label);
              }}
            />
            <Legend
              formatter={(value) => {
                if (value === "reached") return "Reached";
                if (value === "abandoned") return "Abandoned here";
                if (value === "dropOffRate") return "Drop-Off %";
                return value;
              }}
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            />
            {/* Reached bars */}
            <Bar yAxisId="left" dataKey="reached" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.25} maxBarSize={48} />
            {/* Abandoned bars */}
            <Bar yAxisId="left" dataKey="abandoned" radius={[3, 3, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.isWorst ? "#f43f5e" : "#fb923c"}
                />
              ))}
            </Bar>
            {/* Drop-off rate line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="dropOffRate"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={{ fill: "#f43f5e", r: 3 }}
              activeDot={{ r: 5 }}
              strokeDasharray="4 2"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Per-question table */}
      <div className="border-t border-zinc-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Question</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Reached</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Answered</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Abandoned</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Drop-Off</th>
              <th className="px-6 py-2.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wide">Avg Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {questions.map((q, idx) => {
              const isWorst = idx === topDropOffIndex && q.abandoned > 0;
              return (
                <tr
                  key={q.questionId}
                  className={cn(
                    "transition-colors",
                    isWorst ? "bg-rose-50/40" : "hover:bg-zinc-50/50"
                  )}
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
                        {idx + 1}
                      </span>
                      <span className={cn("font-medium truncate max-w-55", isWorst ? "text-rose-700" : "text-zinc-900")}>
                        {q.questionTitle}
                      </span>
                      {isWorst && (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600">{q.reached}</td>
                  <td className="px-4 py-3 text-right text-zinc-600">{q.answered}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "font-medium",
                      q.abandoned === 0 ? "text-emerald-600" : isWorst ? "text-rose-600" : "text-amber-600"
                    )}>
                      {q.abandoned}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            q.dropOffRate === 0
                              ? "bg-emerald-400"
                              : isWorst
                              ? "bg-rose-500"
                              : "bg-amber-400"
                          )}
                          style={{ width: `${q.dropOffRate}%` }}
                        />
                      </div>
                      <span className={cn(
                        "w-9 text-right font-medium text-xs",
                        q.dropOffRate === 0 ? "text-emerald-600" : isWorst ? "text-rose-600" : "text-amber-600"
                      )}>
                        {q.dropOffRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-500 text-xs">{fmtTime(q.avgTimeSpent)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
