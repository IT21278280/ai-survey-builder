import { z } from "zod";

export const createSurveySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  description: z.string().max(500, "Description must be under 500 characters").optional(),
});

export const questionSchema = z.object({
  type: z.enum([
    "SHORT_TEXT",
    "LONG_TEXT",
    "MULTIPLE_CHOICE",
    "CHECKBOX",
    "DROPDOWN",
    "RATING",
    "SCALE",
    "DATE",
    "EMAIL",
    "NUMBER",
  ]),
  title: z.string().min(1, "Question title is required").max(300),
  description: z.string().max(500).optional(),
  isRequired: z.boolean().default(false),
  order: z.number().int().min(0),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        order: z.number().int().min(0),
      })
    )
    .optional(),
});

export const updateSurveySchema = createSurveySchema.partial().extend({
  isPublished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const submitResponseSchema = z.object({
  surveyId: z.string().cuid(),
  answers: z.array(
    z.object({
      questionId: z.string().cuid(),
      optionId: z.string().cuid().optional(),
      value: z.string().optional(),
    })
  ),
  completionTime: z.number().int().min(0).optional(), // seconds
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;

export const updateQuestionSchema = z.object({
  title: z.string().min(1, "Question title is required").max(300).optional(),
  description: z.string().max(500).optional(),
  isRequired: z.boolean().optional(),
});

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
