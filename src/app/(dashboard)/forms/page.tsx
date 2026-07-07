import type { Metadata } from "next";
import { Header } from "@/components/dashboard/header";
import { getUserSurveys } from "@/actions/survey";
import { SurveyCard } from "@/components/surveys/survey-card";
import { FormsPageClient } from "./forms-page-client";
import { FileText } from "lucide-react";

export const metadata: Metadata = { title: "My Forms" };

export default async function FormsPage() {
  const surveys = await getUserSurveys();

  return (
    <div className="flex flex-col">
      <Header
        title="My Forms"
        description={`${surveys.length} form${surveys.length !== 1 ? "s" : ""}`}
        action={<FormsPageClient />}
      />
      <div className="flex-1 p-6">
        {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <FileText className="h-7 w-7 text-indigo-500" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900">No forms yet</h2>
            <p className="mt-1.5 max-w-xs text-sm text-zinc-500">
              Create your first form and start collecting responses in minutes.
            </p>
            <div className="mt-4">
              <FormsPageClient showLabel />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {surveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

