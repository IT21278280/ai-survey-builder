"use server";

import { db } from "@/lib/db";
import { submitResponseSchema } from "@/lib/validations/survey";
import type { ActionResult } from "@/types";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limiter";
import type { Prisma } from "@prisma/client";

export async function submitResponse(
  data: Record<string, unknown>
): Promise<ActionResult<{ id: string }>> {
  const parsed = submitResponseSchema.safeParse(data);
  if (!parsed.success) {
    const issueMessage = parsed.error.issues[0]?.message ?? "Invalid response data";
    return { success: false, error: issueMessage };
  }

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const cloudflareIp = headersList.get("cf-connecting-ip");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ?? realIp ?? cloudflareIp ?? "unknown";
  const userAgent = headersList.get("user-agent")?.slice(0, 500) ?? undefined;

  // Rate limit: 5 submissions per survey per IP per 10 minutes
  const rateLimitKey = `response:${parsed.data.surveyId}:${ipAddress}`;
  const rl = checkRateLimit(rateLimitKey, { windowMs: 10 * 60 * 1000, limit: 5 });
  if (!rl.success) {
    return {
      success: false,
      error: "Too many submissions. Please wait a few minutes and try again.",
    };
  }

  try {
    const survey = await db.survey.findUnique({
      where: { id: parsed.data.surveyId, isPublished: true },
    });

    if (!survey) {
      return { success: false, error: "Survey not found or not published" };
    }

    const completedAt = new Date();

    const response = await db.response.create({
      data: {
        surveyId: parsed.data.surveyId,
        ipAddress,
        userAgent: userAgent ?? null,
        completedAt,
        answers: {
          create: parsed.data.answers.map((a) => {
            const answerData: Prisma.AnswerCreateWithoutResponseInput = {
              question: {
                connect: { id: a.questionId },
              },
              value: a.value ?? null,
            };

            if (a.optionId) {
              answerData.option = {
                connect: { id: a.optionId },
              };
            }

            return answerData;
          }),
        },
      },
    });

    // Recalculate analytics
    const totalResponses = await db.response.count({
      where: { surveyId: parsed.data.surveyId },
    });

    // Completion rate = responses with completedAt / total (treat all as complete for now)
    const completionRate = 100;

    // Average completion time
    const completionTime = parsed.data.completionTime;
    const analytics = await db.surveyAnalytics.findUnique({
      where: { surveyId: parsed.data.surveyId },
    });

    let newAvgTime = analytics?.avgCompletionTime ?? 0;
    if (completionTime != null && completionTime > 0) {
      const prevTotal = (analytics?.avgCompletionTime ?? 0) * (totalResponses - 1);
      newAvgTime = Math.round((prevTotal + completionTime) / totalResponses);
    }

    await db.surveyAnalytics.upsert({
      where: { surveyId: parsed.data.surveyId },
      create: {
        surveyId: parsed.data.surveyId,
        totalResponses: 1,
        completionRate,
        avgCompletionTime: completionTime ?? 0,
        lastCalculated: new Date(),
      },
      update: {
        totalResponses: { increment: 1 },
        completionRate,
        avgCompletionTime: newAvgTime,
        lastCalculated: new Date(),
      },
    });

    return { success: true, data: { id: response.id } };
  } catch {
    return { success: false, error: "Failed to submit response" };
  }
}

export async function getSurveyResponses(surveyId: string) {
  return db.response.findMany({
    where: { surveyId },
    include: {
      answers: {
        include: {
          question: true,
          option: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function trackSurveyView(surveyId: string) {
  await db.surveyAnalytics.upsert({
    where: { surveyId },
    create: {
      surveyId,
      totalViews: 1,
    },
    update: {
      totalViews: { increment: 1 },
    },
  });
}

