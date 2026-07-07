import { QuestionType } from "@prisma/client";

export type { QuestionType };

export interface SurveyWithQuestions {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  isPublished: boolean;
  isArchived: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  questions: QuestionWithOptions[];
  _count?: {
    responses: number;
  };
}

export interface QuestionWithOptions {
  id: string;
  surveyId: string;
  type: QuestionType;
  title: string;
  description: string | null;
  isRequired: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  options: QuestionOptionItem[];
}

export interface QuestionOptionItem {
  id: string;
  questionId: string;
  label: string;
  value: string;
  order: number;
}

export interface AnalyticsData {
  totalViews: number;
  totalResponses: number;
  completionRate: number;
  avgCompletionTime: number;
  questionBreakdown: QuestionBreakdown[];
}

export interface QuestionBreakdown {
  questionId: string;
  title: string;
  type: QuestionType;
  answerCount: number;
  data: AnswerDataPoint[];
}

export interface AnswerDataPoint {
  label: string;
  value: number;
  percentage: number;
}

export type SurveyStatus = "draft" | "published" | "archived";
