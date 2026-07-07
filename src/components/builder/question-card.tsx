"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionWithOptions } from "@/types/survey";

const TYPE_LABELS: Record<string, string> = {
  SHORT_TEXT: "Short Text",
  LONG_TEXT: "Long Text",
  MULTIPLE_CHOICE: "Multiple Choice",
  CHECKBOX: "Checkbox",
  DROPDOWN: "Dropdown",
  RATING: "Rating",
  SCALE: "Scale",
  DATE: "Date",
  EMAIL: "Email",
  NUMBER: "Number",
};

interface QuestionCardProps {
  question: QuestionWithOptions;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => setIsEditing(!isEditing)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">
              Q{index + 1}
            </span>
            <Badge variant="outline">{TYPE_LABELS[question.type]}</Badge>
            {question.isRequired && (
              <Badge variant="warning">Required</Badge>
            )}
          </div>
          <p className="font-medium text-gray-900">{question.title}</p>
          {question.description && (
            <p className="mt-1 text-sm text-gray-500">{question.description}</p>
          )}
        </div>
      </div>

      {/* Preview of options */}
      {question.options.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {question.options.slice(0, 3).map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <div className="h-3.5 w-3.5 rounded-full border border-gray-300" />
              {option.label}
            </div>
          ))}
          {question.options.length > 3 && (
            <p className="text-xs text-gray-400">
              +{question.options.length - 3} more options
            </p>
          )}
        </div>
      )}

      {/* Rating preview */}
      {question.type === "RATING" && (
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="text-xl text-gray-200">★</span>
          ))}
        </div>
      )}

      {/* Scale preview */}
      {question.type === "SCALE" && (
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <div
              key={n}
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-xs text-gray-400"
            >
              {n}
            </div>
          ))}
        </div>
      )}

      {/* Text input preview */}
      {(question.type === "SHORT_TEXT" ||
        question.type === "EMAIL" ||
        question.type === "NUMBER") && (
        <Input
          className="mt-3 pointer-events-none"
          placeholder={
            question.type === "EMAIL"
              ? "email@example.com"
              : question.type === "NUMBER"
              ? "0"
              : "Your answer..."
          }
          readOnly
        />
      )}

      {question.type === "LONG_TEXT" && (
        <Textarea
          className="mt-3 pointer-events-none"
          placeholder="Your answer..."
          readOnly
        />
      )}
    </div>
  );
}
