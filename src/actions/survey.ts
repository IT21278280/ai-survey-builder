"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import {
  createSurveySchema,
  updateSurveySchema,
  questionSchema,
  updateQuestionSchema,
} from "@/lib/validations/survey";
import type { ActionResult } from "@/types";
import type { Prisma, Survey } from "@prisma/client";

// ─── Survey CRUD ──────────────────────────────────────────────────────────────

export async function createSurvey(
  formData: FormData
): Promise<ActionResult<Survey>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = createSurveySchema.safeParse(raw);
  if (!parsed.success) {
    const issueMessage = parsed.error.issues[0]?.message ?? "Invalid survey data";
    return { success: false, error: issueMessage };
  }

  try {
    const survey = await db.survey.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        slug: generateSlug(parsed.data.title),
        userId: session.user.id,
      },
    });
    revalidatePath("/forms");
    revalidatePath("/dashboard");
    return { success: true, data: survey };
  } catch {
    return { success: false, error: "Failed to create survey" };
  }
}

export async function updateSurvey(
  id: string,
  data: Record<string, unknown>
): Promise<ActionResult<Survey>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const parsed = updateSurveySchema.safeParse(data);
  if (!parsed.success) {
    const issueMessage = parsed.error.issues[0]?.message ?? "Invalid survey data";
    return { success: false, error: issueMessage };
  }

  try {
    const updateData: Prisma.SurveyUpdateInput = {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description ?? null }
        : {}),
      ...(parsed.data.isPublished !== undefined ? { isPublished: parsed.data.isPublished } : {}),
      ...(parsed.data.isArchived !== undefined ? { isArchived: parsed.data.isArchived } : {}),
    };

    const survey = await db.survey.update({
      where: { id, userId: session.user.id },
      data: updateData,
    });
    revalidatePath(`/forms/${id}`);
    revalidatePath(`/forms/${id}/edit`);
    revalidatePath("/forms");
    revalidatePath("/dashboard");
    return { success: true, data: survey };
  } catch {
    return { success: false, error: "Failed to update survey" };
  }
}

export async function deleteSurvey(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await db.survey.delete({ where: { id, userId: session.user.id } });
    revalidatePath("/forms");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete survey" };
  }
}

export async function duplicateSurvey(id: string): Promise<ActionResult<Survey>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const original = await db.survey.findUnique({
      where: { id, userId: session.user.id },
      include: { questions: { include: { options: true } } },
    });
    if (!original) return { success: false, error: "Survey not found" };

    const copy = await db.survey.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        slug: generateSlug(`${original.title} copy`),
        userId: session.user.id,
        questions: {
          create: original.questions.map((q) => ({
            type: q.type,
            title: q.title,
            description: q.description,
            isRequired: q.isRequired,
            order: q.order,
            options: {
              create: q.options.map((o) => ({
                label: o.label,
                value: o.value,
                order: o.order,
              })),
            },
          })),
        },
      },
    });
    revalidatePath("/forms");
    return { success: true, data: copy };
  } catch {
    return { success: false, error: "Failed to duplicate survey" };
  }
}

// ─── Survey Queries ───────────────────────────────────────────────────────────

export async function getUserSurveys() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.survey.findMany({
    where: { userId: session.user.id, isArchived: false },
    include: { _count: { select: { responses: true, questions: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getSurveyById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.survey.findUnique({
    where: { id, userId: session.user.id },
    include: {
      questions: {
        include: { options: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { responses: true } },
    },
  });
}

// ─── Question CRUD ────────────────────────────────────────────────────────────

type CreatedQuestion = Prisma.QuestionGetPayload<{
  include: { options: true };
}>;

export async function addQuestion(
  surveyId: string,
  data: Record<string, unknown>
): Promise<ActionResult<CreatedQuestion>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const survey = await db.survey.findUnique({
    where: { id: surveyId },
    select: { userId: true },
  });

  if (!survey || survey.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = questionSchema.safeParse(data);
  if (!parsed.success) {
    const issueMessage = parsed.error.issues[0]?.message ?? "Invalid question data";
    return { success: false, error: issueMessage };
  }

  try {
    const { options, ...questionData } = parsed.data;
    const questionCreateData: Prisma.QuestionCreateInput = {
      ...questionData,
      description: questionData.description ?? null,
      survey: {
        connect: { id: surveyId },
      },
      ...(options
        ? {
            options: {
              create: options.map((o) => ({
                label: o.label,
                value: o.value,
                order: o.order,
              })),
            },
          }
        : {}),
    };

    const question = await db.question.create({
      data: questionCreateData,
      include: { options: true },
    });
    revalidatePath(`/forms/${surveyId}/edit`);
    return { success: true, data: question };
  } catch {
    return { success: false, error: "Failed to add question" };
  }
}

export async function updateQuestion(
  questionId: string,
  surveyId: string,
  data: Record<string, unknown>
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const parsed = updateQuestionSchema.safeParse(data);
  if (!parsed.success) {
    const issueMessage = parsed.error.issues[0]?.message ?? "Invalid question data";
    return { success: false, error: issueMessage };
  }

  try {
    const updateData: Prisma.QuestionUpdateInput = {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description === "" ? null : parsed.data.description }
        : {}),
      ...(parsed.data.isRequired !== undefined ? { isRequired: parsed.data.isRequired } : {}),
    };

    const result = await db.question.updateMany({
      where: { id: questionId, survey: { userId: session.user.id } },
      data: updateData,
    });

    if (result.count === 0) {
      return { success: false, error: "Unauthorized" };
    }

    revalidatePath(`/forms/${surveyId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update question" };
  }
}

export async function deleteQuestion(
  questionId: string,
  surveyId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const result = await db.question.deleteMany({
      where: { id: questionId, survey: { userId: session.user.id } },
    });

    if (result.count === 0) {
      return { success: false, error: "Unauthorized" };
    }

    revalidatePath(`/forms/${surveyId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete question" };
  }
}

export async function reorderQuestions(
  surveyId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const ownedQuestions = await db.question.findMany({
    where: {
      id: { in: orderedIds },
      survey: { userId: session.user.id },
    },
    select: { id: true },
  });

  if (ownedQuestions.length !== orderedIds.length) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.$transaction(
      orderedIds.map((id, index) =>
        db.question.update({
          where: { id },
          data: { order: index },
        })
      )
    );
    revalidatePath(`/forms/${surveyId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save question order" };
  }
}

// ─── Question Options ─────────────────────────────────────────────────────────

export async function addOption(
  questionId: string,
  surveyId: string,
  label: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: { surveyId: true, survey: { select: { userId: true } } },
  });

  if (!question || question.survey.userId !== session.user.id || question.surveyId !== surveyId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const count = await db.questionOption.count({ where: { questionId } });
    await db.questionOption.create({
      data: {
        questionId,
        label,
        value: label.toLowerCase().replace(/\s+/g, "_"),
        order: count,
      },
    });
    revalidatePath(`/forms/${surveyId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add option" };
  }
}

export async function updateOption(
  optionId: string,
  surveyId: string,
  label: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const option = await db.questionOption.findUnique({
    where: { id: optionId },
    select: { question: { select: { surveyId: true, survey: { select: { userId: true } } } } },
  });

  if (!option || option.question.survey.userId !== session.user.id || option.question.surveyId !== surveyId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.questionOption.update({
      where: { id: optionId },
      data: { label, value: label.toLowerCase().replace(/\s+/g, "_") },
    });
    revalidatePath(`/forms/${surveyId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update option" };
  }
}

export async function deleteOption(
  optionId: string,
  surveyId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const option = await db.questionOption.findUnique({
    where: { id: optionId },
    select: { question: { select: { surveyId: true, survey: { select: { userId: true } } } } },
  });

  if (!option || option.question.survey.userId !== session.user.id || option.question.surveyId !== surveyId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.questionOption.delete({ where: { id: optionId } });
    revalidatePath(`/forms/${surveyId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete option" };
  }
}

