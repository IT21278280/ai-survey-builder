import type { Metadata } from "next";
import { Header } from "@/components/dashboard/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentSurveysTable } from "@/components/dashboard/recent-surveys-table";
import { getUserSurveys } from "@/actions/survey";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { FileText, MessageSquare, TrendingUp, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const surveys = await getUserSurveys();

  const totalResponses = await db.response.count({
    where: { survey: { userId: session!.user!.id! } },
  });

  const publishedCount = surveys.filter((s) => s.isPublished).length;
  const recentSurveys = surveys.slice(0, 8);

  const avgResponses =
    surveys.length > 0 ? Math.round(totalResponses / surveys.length) : 0;

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description={`Welcome back, ${session?.user?.name?.split(" ")[0]}`}
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Forms"
            value={surveys.length}
            icon={FileText}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
            description="All time"
          />
          <StatsCard
            title="Published"
            value={publishedCount}
            icon={Eye}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            description={`${surveys.length - publishedCount} draft${surveys.length - publishedCount !== 1 ? "s" : ""}`}
          />
          <StatsCard
            title="Total Responses"
            value={totalResponses.toLocaleString()}
            icon={MessageSquare}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            description="All forms"
          />
          <StatsCard
            title="Avg. Responses"
            value={avgResponses}
            icon={TrendingUp}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
            description="Per form"
          />
        </div>

        {/* Recent surveys */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Recent Forms</h2>
              <p className="text-xs text-zinc-500">Your latest forms and their performance</p>
            </div>
            <Link href="/forms">
              <Button variant="outline" size="sm" className="gap-1.5">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <RecentSurveysTable surveys={recentSurveys} />
        </div>
      </div>
    </div>
  );
}
