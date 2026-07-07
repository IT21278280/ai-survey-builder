import { db } from "@/lib/db";
import type { Survey, Question, QuestionOption } from "@prisma/client";

export type PublicSurvey = Survey & {
  questions: (Question & { options: QuestionOption[] })[];
};

export async function getPublishedSurveyById(id: string): Promise<PublicSurvey | null> {
  return db.survey.findUnique({
    where: { id, isPublished: true },
    include: {
      questions: {
        include: { options: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getAllPublishedSurveyIds(): Promise<string[]> {
  const surveys = await db.survey.findMany({
    where: { isPublished: true, isArchived: false },
    select: { id: true },
  });
  return surveys.map((s) => s.id);
}

export type SurveyWithAnalytics = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalViews: number;
  totalResponses: number;
  completionRate: number;
  avgCompletionTime: number;
  questionCount: number;
  dailyResponses: { date: string; count: number }[];
};

export async function getSurveyAnalytics(surveyId: string, userId: string): Promise<SurveyWithAnalytics | null> {
  const survey = await db.survey.findUnique({
    where: { id: surveyId, userId },
    include: {
      analytics: true,
      _count: { select: { questions: true } },
    },
  });

  if (!survey) return null;

  // Get daily responses for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const responses = await db.response.findMany({
    where: {
      surveyId,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const dateMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateMap.set(d.toISOString().slice(0, 10), 0);
  }
  responses.forEach((r) => {
    const key = r.createdAt.toISOString().slice(0, 10);
    dateMap.set(key, (dateMap.get(key) ?? 0) + 1);
  });

  const dailyResponses = Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    id: survey.id,
    title: survey.title,
    slug: survey.slug,
    isPublished: survey.isPublished,
    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt,
    totalViews: survey.analytics?.totalViews ?? 0,
    totalResponses: survey.analytics?.totalResponses ?? 0,
    completionRate: survey.analytics?.completionRate ?? 0,
    avgCompletionTime: survey.analytics?.avgCompletionTime ?? 0,
    questionCount: survey._count.questions,
    dailyResponses,
  };
}

export async function getAllSurveysAnalytics(userId: string) {
  const surveys = await db.survey.findMany({
    where: { userId, isArchived: false },
    include: {
      analytics: true,
      _count: { select: { responses: true, questions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return surveys.map((s) => ({
    id: s.id,
    title: s.title,
    isPublished: s.isPublished,
    totalViews: s.analytics?.totalViews ?? 0,
    totalResponses: s._count.responses,
    completionRate: s.analytics?.completionRate ?? 0,
    questionCount: s._count.questions,
  }));
}
