import { StatsCard } from "@/components/dashboard/stats-card";
import { ResponseChart } from "./response-chart";
import { Eye, MessageSquare, TrendingUp, Clock } from "lucide-react";
import type { AnalyticsData } from "@/types/survey";
import { formatPercent } from "@/lib/utils";

interface AnalyticsOverviewProps {
  data: AnalyticsData;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Views"
          value={data.totalViews.toLocaleString()}
          icon={Eye}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Total Responses"
          value={data.totalResponses.toLocaleString()}
          icon={MessageSquare}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Completion Rate"
          value={formatPercent(data.completionRate)}
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
        />
        <StatsCard
          title="Avg. Completion"
          value={`${Math.round(data.avgCompletionTime / 60)}m ${data.avgCompletionTime % 60}s`}
          icon={Clock}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Per-question breakdown */}
      {data.questionBreakdown.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900">
            Question Breakdown
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {data.questionBreakdown.map((q) => (
              <ResponseChart
                key={q.questionId}
                title={q.title}
                data={q.data}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
