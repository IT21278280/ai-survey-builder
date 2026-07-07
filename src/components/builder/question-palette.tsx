"use client";

import { useTransition } from "react";
import {
  Type,
  AlignLeft,
  Mail,
  List,
  CheckSquare,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DROPDOWN"
  | "RATING"
  | "SCALE"
  | "DATE"
  | "EMAIL"
  | "NUMBER";

interface QuestionPaletteProps {
  surveyId: string;
  questionCount: number;
  onAddQuestion: (qt: QPaletteItem) => Promise<void> | void;
}

interface QPaletteItem {
  type: QuestionType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  defaultOptions?: { label: string; value: string; order: number }[];
}

const QUESTION_TYPES: QPaletteItem[] = [
  {
    type: "SHORT_TEXT",
    label: "Short Text",
    description: "Single-line text response",
    icon: Type,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    type: "LONG_TEXT",
    label: "Long Text",
    description: "Multi-line textarea response",
    icon: AlignLeft,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    type: "EMAIL",
    label: "Email",
    description: "Email address input",
    icon: Mail,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    type: "MULTIPLE_CHOICE",
    label: "Multiple Choice",
    description: "Single-select radio buttons",
    icon: List,
    color: "text-violet-600",
    bg: "bg-violet-50",
    defaultOptions: [
      { label: "Option 1", value: "option_1", order: 0 },
      { label: "Option 2", value: "option_2", order: 1 },
    ],
  },
  {
    type: "CHECKBOX",
    label: "Checkboxes",
    description: "Multi-select checkboxes",
    icon: CheckSquare,
    color: "text-violet-600",
    bg: "bg-violet-50",
    defaultOptions: [
      { label: "Option 1", value: "option_1", order: 0 },
      { label: "Option 2", value: "option_2", order: 1 },
    ],
  },
  {
    type: "RATING",
    label: "Rating",
    description: "1–5 star rating",
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export function QuestionPalette({ surveyId, questionCount, onAddQuestion }: QuestionPaletteProps) {
  const [isPending, startTransition] = useTransition();

  function handleAdd(qt: QPaletteItem) {
    startTransition(() => {
      void onAddQuestion(qt);
    });
  }

  return (
    <div className="space-y-1.5">
      {QUESTION_TYPES.map((qt) => (
        <button
          key={qt.type}
          onClick={() => handleAdd(qt)}
          disabled={isPending}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm transition-all",
            "hover:border-indigo-300 hover:shadow-sm disabled:opacity-60"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              qt.bg
            )}
          >
            <qt.icon className={cn("h-4 w-4", qt.color)} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-zinc-900 truncate">{qt.label}</p>
            <p className="text-xs text-zinc-400 truncate">{qt.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

