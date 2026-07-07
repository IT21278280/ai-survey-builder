"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InteractionPayload {
  questionId: string;
  questionIndex: number;
  timeSpent: number; // seconds
  abandoned: boolean;
}

export interface QuestionDropOff {
  questionId: string;
  questionTitle: string;
  questionIndex: number;
  reached: number;       // unique sessions that saw this question
  answered: number;      // sessions that moved past this question
  abandoned: number;     // sessions that left at this question
  dropOffRate: number;   // abandoned / reached * 100
  retentionRate: number; // answered / reached * 100
  avgTimeSpent: number;  // seconds
}

export interface DropOffSummary {
  questions: QuestionDropOff[];
  topDropOffIndex: number; // index with highest abandonment
  totalSessions: number;   // unique sessions that started
  completedSessions: number;
  overallDropOffRate: number;
}

// ─── Track a batch of interactions (on submit or navigation) ─────────────────

export async function batchTrackInteractions(
  surveyId: string,
  sessionId: string,
  interactions: InteractionPayload[]
): Promise<ActionResult<void>> {
  if (!surveyId || !sessionId || interactions.length === 0) {
    return { success: false, error: "Missing required fields" };
  }

  // Validate surveyId is a real published survey
  const survey = await db.survey.findUnique({
    where: { id: surveyId, isPublished: true },
    select: { id: true },
  });
  if (!survey) return { success: false, error: "Survey not found" };

  try {
    // Upsert each interaction using the @@unique([sessionId, questionId]) key.
    // Last write wins — ensures abandoned=false from submit overwrites an earlier abandon beacon.
    await db.$transaction(
      interactions.map((i) =>
        db.questionInteraction.upsert({
          where: {
            sessionId_questionId: {
              sessionId,
              questionId: i.questionId,
            },
          },
          create: {
            surveyId,
            questionId: i.questionId,
            sessionId,
            questionIndex: i.questionIndex,
            timeSpent: i.timeSpent,
            abandoned: i.abandoned,
          },
          update: {
            timeSpent: i.timeSpent,
            abandoned: i.abandoned,
          },
        })
      )
    );

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to save interactions" };
  }
}

// ─── Get drop-off analytics for a survey (owner only) ────────────────────────

export async function getDropOffAnalytics(
  surveyId: string
): Promise<ActionResult<DropOffSummary>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  // Verify ownership
  const survey = await db.survey.findUnique({
    where: { id: surveyId, userId: session.user.id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true },
      },
    },
  });
  if (!survey) return { success: false, error: "Survey not found" };

  if (survey.questions.length === 0) {
    return {
      success: true,
      data: {
        questions: [],
        topDropOffIndex: -1,
        totalSessions: 0,
        completedSessions: 0,
        overallDropOffRate: 0,
      },
    };
  }

  // Fetch all interactions for this survey
  const allInteractions = await db.questionInteraction.findMany({
    where: { surveyId },
    select: {
      sessionId: true,
      questionId: true,
      questionIndex: true,
      timeSpent: true,
      abandoned: true,
    },
  });

  // Map: questionId → { reached, abandoned, totalTimeSpent }
  const statsMap = new Map<
    string,
    { reached: Set<string>; abandoned: Set<string>; totalTime: number; timeCount: number }
  >();

  for (const q of survey.questions) {
    statsMap.set(q.id, {
      reached: new Set(),
      abandoned: new Set(),
      totalTime: 0,
      timeCount: 0,
    });
  }

  const allSessions = new Set<string>();

  for (const i of allInteractions) {
    allSessions.add(i.sessionId);
    const stat = statsMap.get(i.questionId);
    if (!stat) continue;

    stat.reached.add(i.sessionId);
    if (i.abandoned) stat.abandoned.add(i.sessionId);
    if (i.timeSpent > 0) {
      stat.totalTime += i.timeSpent;
      stat.timeCount++;
    }
  }

  const totalSessions = allSessions.size;

  // Build per-question output
  const questions: QuestionDropOff[] = survey.questions.map((q, idx) => {
    const stat = statsMap.get(q.id)!;
    const reached = stat.reached.size;
    const abandoned = stat.abandoned.size;
    const answered = reached - abandoned;
    const dropOffRate = reached > 0 ? Math.round((abandoned / reached) * 100) : 0;
    const retentionRate = reached > 0 ? Math.round((answered / reached) * 100) : 0;
    const avgTimeSpent =
      stat.timeCount > 0 ? Math.round(stat.totalTime / stat.timeCount) : 0;

    return {
      questionId: q.id,
      questionTitle: q.title,
      questionIndex: idx,
      reached,
      answered,
      abandoned,
      dropOffRate,
      retentionRate,
      avgTimeSpent,
    };
  });

  // Find the question with the highest absolute abandonment
  const topDropOffIndex = questions.reduce(
    (maxIdx, q, idx) =>
      q.abandoned > (questions[maxIdx]?.abandoned ?? 0) ? idx : maxIdx,
    0
  );

  // Completed sessions = those who answered the last question without abandoning
  const lastQuestion = questions[questions.length - 1];
  const completedSessions = lastQuestion?.answered ?? 0;

  const overallDropOffRate =
    totalSessions > 0
      ? Math.round(((totalSessions - completedSessions) / totalSessions) * 100)
      : 0;

  return {
    success: true,
    data: {
      questions,
      topDropOffIndex,
      totalSessions,
      completedSessions,
      overallDropOffRate,
    },
  };
}
