import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { trackSurveyView } from "@/actions/response";
import { SurveyForm } from "./survey-form";

interface SurveyPageProps {
  params: Promise<{ surveyId: string }>;
}

export async function generateMetadata({
  params,
}: SurveyPageProps): Promise<Metadata> {
  const { surveyId } = await params;
  const survey = await db.survey.findUnique({
    where: { slug: surveyId },
    select: { title: true, description: true },
  });
  return {
    title: survey?.title ?? "Survey",
    description: survey?.description ?? undefined,
  };
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { surveyId } = await params;

  const survey = await db.survey.findUnique({
    where: { slug: surveyId, isPublished: true },
    include: {
      questions: {
        include: { options: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!survey) notFound();

  // Track view (fire and forget)
  void trackSurveyView(survey.id);

  return <SurveyForm survey={survey} />;
}
