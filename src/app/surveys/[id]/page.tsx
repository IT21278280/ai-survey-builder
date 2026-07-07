import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedSurveyById, getAllPublishedSurveyIds } from "@/lib/analytics";
import { trackSurveyView } from "@/actions/response";
import { PublicSurveyForm } from "./survey-form";

interface SurveyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const ids = await getAllPublishedSurveyIds();
    return ids.map((id) => ({ id }));
  } catch {
    // DB unavailable at build time — pages are generated on-demand via ISR
    return [];
  }
}

export async function generateMetadata({
  params,
}: SurveyPageProps): Promise<Metadata> {
  const { id } = await params;
  const survey = await getPublishedSurveyById(id);

  if (!survey) {
    return { title: "Survey Not Found" };
  }

  const description = survey.description ?? `Complete the "${survey.title}" survey.`;

  return {
    title: survey.title,
    description,
    openGraph: {
      title: survey.title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: survey.title,
      description,
    },
  };
}

export const revalidate = 60; // ISR — revalidate every 60 s

export default async function PublicSurveyPage({ params }: SurveyPageProps) {
  const { id } = await params;

  const survey = await getPublishedSurveyById(id);

  if (!survey) notFound();

  // Fire-and-forget: track the view
  void trackSurveyView(survey.id);

  return <PublicSurveyForm survey={survey} />;
}
