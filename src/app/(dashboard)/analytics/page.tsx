import type { Metadata } from "next";
import { Header } from "@/components/dashboard/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ResponsesChart } from "@/components/analytics/responses-chart";
import { SurveysBarChart } from "@/components/analytics/surveys-bar-chart";
import { DropOffSection } from "@/components/analytics/dropoff-section";
import { auth } from "@/lib/auth";
import { getAllSurveysAnalytics, getSurveyAnalytics } from "@/lib/analytics";
import { getDropOffAnalytics } from "@/actions/dropoff";
import { db } from "@/lib/db";
import {
  Eye,
  MessageSquare,
  TrendingUp,
  FileText,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

function fmtTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ survey?: string }>;
}) {
  const { survey: selectedSurveyId } = await searchParams;
  const session = await auth();
  const userId = session!.user!.id!;

  const allSurveys = await getAllSurveysAnalytics(userId);
  const totalViews = allSurveys.reduce((s, a) => s + a.totalViews, 0);
  const totalResponses = allSurveys.reduce((s, a) => s + a.totalResponses, 0);
  const avgCompletionRate =
    allSurveys.length > 0
      ? allSurveys.reduce((s, a) => s + a.completionRate, 0) / allSurveys.length
      : 0;

  const totalAvgTime = await (async () => {
    const analytics = await db.surveyAnalytics.findMany({
      where: { survey: { userId } },
      select: { avgCompletionTime: true },
    });
    if (analytics.length === 0) return 0;
    return Math.round(
      analytics.reduce((s, a) => s + a.avgCompletionTime, 0) / analytics.length
    );
  })();

  const firstPublished = allSurveys.find((s) => s.isPublished);
  const focusId = selectedSurveyId ?? firstPublished?.id;
  const focusSurvey = focusId ? await getSurveyAnalytics(focusId, userId) : null;

  const dropOffResult = focusId
    ? await getDropOffAnalytics(focusId).catch(() => null)
    : null;
  const dropOffData = dropOffResult?.success ? dropOffResult.data : null;

  const publishedSurveys = await db.survey.findMany({
    where: { userId, isPublished: true, isArchived: false },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <Header title="Analytics" description="Track your survey performance" />
      <div className="p-6 space-y-8">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Forms"
            value={allSurveys.length}
            icon={FileText}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-100"
          />
          <StatsCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            icon={Eye}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatsCard
            title="Total Responses"
            value={totalResponses.toLocaleString()}
            icon={MessageSquare}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
          />
          <StatsCard
            title="Avg. Completion"
            value={`${Math.round(avgCompletionRate)}%`}
            icon={TrendingUp}
            iconColor="text-violet-600"
            iconBg="bg-violet-100"
          />
        </div>

        {allSurveys.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-white py-20 text-center">
            <TrendingUp className="mx-auto mb-3 h-8 w-8 text-zinc-200" />
            <p className="text-sm text-zinc-400">
              No analytics yet. Publish a form and start collecting responses.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {focusSurvey ? (
                <ResponsesChart data={focusSurvey.dailyResponses} />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm text-zinc-400">
                  Select a published survey to see responses over time
                </div>
              )}
              <SurveysBarChart data={allSurveys} />
            </div>

            {publishedSurveys.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-6 py-4">
                  <h3 className="font-semibold text-zinc-900">Survey Details</h3>
                  <p className="text-sm text-zinc-500">Select a survey to see its stats</p>
                </div>
                <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-zinc-100">
                  {publishedSurveys.map((s) => (
                    <Link
                      key={s.id}
                      href={`/analytics?survey=${s.id}`}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                        (selectedSurveyId ?? firstPublished?.id) === s.id
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      )}
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>

                {focusSurvey ? (
                  <div className="grid grid-cols-2 divide-x divide-y divide-zinc-100 sm:grid-cols-4">
                    {[
                      { label: "Views", value: focusSurvey.totalViews.toLocaleString(), icon: Eye, color: "text-blue-600" },
                      { label: "Responses", value: focusSurvey.totalResponses.toLocaleString(), icon: MessageSquare, color: "text-emerald-600" },
                      { label: "Completion Rate", value: `${Math.round(focusSurvey.completionRate)}%`, icon: TrendingUp, color: "text-violet-600" },
                      { label: "Avg. Time", value: fmtTime(focusSurvey.avgCompletionTime), icon: Clock, color: "text-amber-600" },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                          <Icon className={cn("h-3.5 w-3.5", color)} />
                          {label}
                        </div>
                        <p className="text-2xl font-bold text-zinc-900">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-sm text-zinc-400">Select a survey above</div>
                )}

                {focusSurvey && (
                  <div className="border-t border-zinc-100 px-6 py-3 flex items-center justify-end">
                    <Link
                      href={`/forms/${focusSurvey.id}/edit`}
                      className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Edit form <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Drop-off analysis */}
            {dropOffData && (
              <DropOffSection data={dropOffData} />
            )}

            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <div className="border-b border-zinc-100 px-6 py-4">
                <h3 className="font-semibold text-zinc-900">All Forms</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Form</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Responses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {allSurveys.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-zinc-900">
                        <Link href={`/forms/${s.id}/edit`} className="hover:text-indigo-600 transition-colors">
                          {s.title}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          s.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                        )}>
                          {s.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-600">{s.totalViews.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-zinc-600">{s.totalResponses.toLocaleString()}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(s.completionRate, 100)}%` }} />
                          </div>
                          <span className="text-zinc-600">{Math.round(s.completionRate)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

