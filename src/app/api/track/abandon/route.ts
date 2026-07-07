import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/track/abandon
 *
 * Called via navigator.sendBeacon() when the user closes/navigates away from a survey.
 * Body JSON: { surveyId, sessionId, questionId, questionIndex, timeSpent }
 *
 * Uses sendBeacon so the request fires even after the page unloads.
 * No auth required — survey must be published.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false }, { status: 400 });

    const { surveyId, sessionId, questionId, questionIndex, timeSpent } = body as {
      surveyId?: string;
      sessionId?: string;
      questionId?: string;
      questionIndex?: number;
      timeSpent?: number;
    };

    if (!surveyId || !sessionId || !questionId || questionIndex == null) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Quick auth check — survey must be published
    const survey = await db.survey.findUnique({
      where: { id: surveyId, isPublished: true },
      select: { id: true },
    });
    if (!survey) return NextResponse.json({ ok: false }, { status: 404 });

    // Upsert: create if new session+question, or mark existing as abandoned
    await db.questionInteraction.upsert({
      where: {
        sessionId_questionId: { sessionId, questionId },
      },
      create: {
        surveyId,
        questionId,
        sessionId,
        questionIndex: Math.max(0, Number(questionIndex)),
        timeSpent: Math.max(0, Number(timeSpent ?? 0)),
        abandoned: true,
      },
      update: {
        timeSpent: Math.max(0, Number(timeSpent ?? 0)),
        abandoned: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Silently ignore — beacon requests should never error out to the client
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
