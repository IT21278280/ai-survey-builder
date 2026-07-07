"use server";

import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";
import type { QuestionInput } from "@/lib/validations/survey";
import { geminiModel, geminiModelName } from "@/lib/gemini";

interface GeminiQuestion {
  type: string;
  title: string;
  description?: string;
  isRequired?: boolean;
  options?: { label: string }[];
}

interface GeminiResponse {
  title: string;
  description: string;
  questions: GeminiQuestion[];
}

const VALID_TYPES = new Set([
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
]);

function buildPrompt(topic: string, questionCount: number): string {
  return `You are an expert survey designer. Create a professional survey about: "${topic}".

Return ONLY valid JSON — no markdown, no code blocks, no extra text — in exactly this format:
{
  "title": "Survey title",
  "description": "Brief survey description (1-2 sentences)",
  "questions": [
    {
      "type": "SHORT_TEXT",
      "title": "Question text",
      "description": "Optional helper text or leave empty string",
      "isRequired": true,
      "options": []
    }
  ]
}

Rules:
- Generate exactly ${questionCount} questions.
- Use these types: SHORT_TEXT, LONG_TEXT, EMAIL, MULTIPLE_CHOICE, CHECKBOX, DROPDOWN, RATING, SCALE, DATE, NUMBER.
- For MULTIPLE_CHOICE, CHECKBOX, DROPDOWN: include 3-5 options in "options" as [{"label": "Option text"}].
- For other types: "options" should be an empty array [].
- RATING and SCALE questions need no options.
- Make questions relevant, clear, and professional.
- Vary question types for a good survey experience.
- isRequired should be true for the first question and randomly true/false for others.`;
}

function parseGeminiResponse(raw: string, questionCount: number): GeminiResponse {
  // Strip potential markdown code fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as GeminiResponse;

  if (!parsed.title || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid response structure from AI");
  }

  return parsed;
}

function toQuestionInput(q: GeminiQuestion, index: number): QuestionInput {
  const type = VALID_TYPES.has(q.type?.toUpperCase())
    ? (q.type.toUpperCase() as QuestionInput["type"])
    : "SHORT_TEXT";

  const hasOptions =
    type === "MULTIPLE_CHOICE" || type === "CHECKBOX" || type === "DROPDOWN";

  const options =
    hasOptions && Array.isArray(q.options) && q.options.length > 0
      ? q.options.map((o, i) => ({
          label: String(o.label || `Option ${i + 1}`),
          value: String(o.label || `option_${i + 1}`)
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, ""),
          order: i,
        }))
      : undefined;

  return {
    type,
    title: String(q.title || `Question ${index + 1}`),
    description: q.description || undefined,
    isRequired: Boolean(q.isRequired),
    order: index,
    options,
  };
}

export async function generateSurveyWithAI(
  topic: string,
  questionCount: number = 5
): Promise<ActionResult<{ title: string; description: string; questions: QuestionInput[] }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!topic.trim()) {
    return { success: false, error: "Topic is required" };
  }

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: "AI generation is not configured. Please add GEMINI_API_KEY to your environment." };
  }

  const count = Math.max(1, Math.min(questionCount, 15));

  try {
    const prompt = buildPrompt(topic.trim(), count);
    const result = await geminiModel.generateContent(prompt);
    const raw = result.response.text();

    const geminiData = parseGeminiResponse(raw, count);

    const questions = geminiData.questions
      .slice(0, count)
      .map((q, i) => toQuestionInput(q, i));

    return {
      success: true,
      data: {
        title: geminiData.title,
        description: geminiData.description,
        questions,
      },
    };
  } catch (error) {
    console.error("[AI] generateSurveyWithAI error:", error);

    const isModelError =
      String(error).includes("models/gemini-1.5-flash") ||
      String(error).includes("model is not found") ||
      String(error).includes("404") ||
      String(error).includes("not supported");

    if (isModelError) {
      const fallbackQuestions = buildFallbackQuestions(topic, count);
      return {
        success: true,
        data: {
          title: `Generated survey for ${topic}`,
          description: `Fallback survey generated for ${topic} because the configured Gemini model (${geminiModelName}) is unavailable.`,
          questions: fallbackQuestions,
        },
      };
    }

    const message =
      error instanceof SyntaxError
        ? "AI returned an unexpected response. Please try again."
        : "AI generation failed. Please try again.";
    return { success: false, error: message };
  }
}

function buildFallbackQuestions(topic: string, count: number): QuestionInput[] {
  const normalized = topic.trim() || "your topic";
  const templates: Array<Partial<QuestionInput>> = [
    {
      type: "SHORT_TEXT",
      title: `What is the most important outcome you want from ${normalized}?`,
      description: "Please share your primary goal.",
      isRequired: true,
    },
    {
      type: "LONG_TEXT",
      title: `What are the biggest challenges related to ${normalized}?`,
      description: "Describe the issue in your own words.",
      isRequired: false,
    },
    {
      type: "MULTIPLE_CHOICE",
      title: `How satisfied are you with the current ${normalized} experience?`,
      description: "Choose one option.",
      isRequired: true,
      options: [
        { label: "Very satisfied", value: "very_satisfied", order: 0 },
        { label: "Satisfied", value: "satisfied", order: 1 },
        { label: "Neutral", value: "neutral", order: 2 },
        { label: "Dissatisfied", value: "dissatisfied", order: 3 },
        { label: "Very dissatisfied", value: "very_dissatisfied", order: 4 },
      ],
    },
    {
      type: "CHECKBOX",
      title: `Which of these factors matter most for ${normalized}?`,
      description: "Select all that apply.",
      isRequired: false,
      options: [
        { label: "Quality", value: "quality", order: 0 },
        { label: "Speed", value: "speed", order: 1 },
        { label: "Support", value: "support", order: 2 },
        { label: "Price", value: "price", order: 3 },
      ],
    },
    {
      type: "DROPDOWN",
      title: `How often do you engage with ${normalized}?`,
      description: "Pick a frequency.",
      isRequired: false,
      options: [
        { label: "Daily", value: "daily", order: 0 },
        { label: "Weekly", value: "weekly", order: 1 },
        { label: "Monthly", value: "monthly", order: 2 },
        { label: "Rarely", value: "rarely", order: 3 },
      ],
    },
    {
      type: "RATING",
      title: `Rate your overall satisfaction with ${normalized}.`,
      description: "1 = lowest, 5 = highest.",
      isRequired: false,
    },
    {
      type: "SCALE",
      title: `How important is ${normalized} to your success?`,
      description: "Slide to select a value.",
      isRequired: false,
    },
    {
      type: "EMAIL",
      title: `What email should we use to follow up about ${normalized}?`,
      description: "Optional.",
      isRequired: false,
    },
    {
      type: "NUMBER",
      title: `How many times in the past month have you engaged with ${normalized}?`,
      description: "Enter a number.",
      isRequired: false,
    },
    {
      type: "DATE",
      title: `When was the last time you interacted with ${normalized}?`,
      isRequired: false,
    },
  ];

  return Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length] ?? {};
    return {
      type: template.type ?? "SHORT_TEXT",
      title: template.title ?? `Question ${index + 1}`,
      description: template.description,
      isRequired: template.isRequired ?? false,
      order: index,
      options: template.options,
    } as QuestionInput;
  });
}

