"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitResponse } from "@/actions/response";
import { toast } from "sonner";
import { CheckCircle, Zap } from "lucide-react";
import type { SurveyWithQuestions } from "@/types/survey";

interface SurveyFormProps {
  survey: SurveyWithQuestions;
}

export function SurveyForm({ survey }: SurveyFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: Record<string, unknown>) => {
    startTransition(async () => {
      const answers = survey.questions.flatMap((q) => {
        const rawValue = data[q.id];
        const isSingleSelect = q.type === "MULTIPLE_CHOICE" || q.type === "DROPDOWN";
        const isCheckbox = q.type === "CHECKBOX";

        if (isCheckbox && Array.isArray(rawValue)) {
          return rawValue.map((selectedOptionId) => ({
            questionId: q.id,
            optionId: String(selectedOptionId),
            value: undefined,
          }));
        }

        const answerValue = Array.isArray(rawValue)
          ? rawValue.join(",")
          : typeof rawValue === "string"
          ? rawValue
          : undefined;

        return [
          {
            questionId: q.id,
            optionId: isSingleSelect && typeof answerValue === "string" ? answerValue : undefined,
            value:
              isSingleSelect && typeof answerValue === "string"
                ? undefined
                : answerValue,
          },
        ];
      });

      const result = await submitResponse({
        surveyId: survey.id,
        answers,
      });

      if (result.success) {
        setSubmitted(true);
      } else {
        toast.error(result.error ?? "Failed to submit. Please try again.");
      }
    });
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Thank you!
          </h2>
          <p className="mt-2 text-gray-500">
            Your response has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-indigo-600 p-8 text-white">
          <h1 className="text-2xl font-bold">{survey.title}</h1>
          {survey.description && (
            <p className="mt-2 text-indigo-100">{survey.description}</p>
          )}
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {survey.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="mb-1 text-xs font-medium text-gray-400">
                {index + 1} / {survey.questions.length}
              </p>
              <p className="mb-4 text-base font-medium text-gray-900">
                {question.title}
                {question.isRequired && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </p>
              {question.description && (
                <p className="mb-3 text-sm text-gray-500">
                  {question.description}
                </p>
              )}

              {/* Render input by type */}
              {(question.type === "SHORT_TEXT" ||
                question.type === "EMAIL" ||
                question.type === "NUMBER" ||
                question.type === "DATE") && (
                <Input
                  type={
                    question.type === "EMAIL"
                      ? "email"
                      : question.type === "NUMBER"
                      ? "number"
                      : question.type === "DATE"
                      ? "date"
                      : "text"
                  }
                  placeholder="Your answer..."
                  {...register(question.id, { required: question.isRequired })}
                />
              )}

              {question.type === "LONG_TEXT" && (
                <Textarea
                  placeholder="Your answer..."
                  {...register(question.id, { required: question.isRequired })}
                />
              )}

              {(question.type === "MULTIPLE_CHOICE" ||
                question.type === "DROPDOWN") && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        value={option.id}
                        className="h-4 w-4 text-indigo-600"
                        {...register(question.id, { required: question.isRequired })}
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "CHECKBOX" && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        value={option.id}
                        className="h-4 w-4 rounded text-indigo-600"
                        {...register(question.id)}
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "RATING" && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="cursor-pointer text-2xl">
                      <input
                        type="radio"
                        value={String(star)}
                        className="sr-only"
                        {...register(question.id, { required: question.isRequired })}
                      />
                      <span className="text-gray-300 hover:text-yellow-400">★</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "SCALE" && (
                <div className="flex gap-1 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <label key={n} className="cursor-pointer">
                      <input
                        type="radio"
                        value={String(n)}
                        className="sr-only"
                        {...register(question.id, { required: question.isRequired })}
                      />
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-sm hover:border-indigo-500 hover:bg-indigo-50">
                        {n}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={isPending}
          >
            Submit Response
          </Button>
        </form>

        {/* Branding */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
          Powered by AI FormForge
        </div>
      </div>
    </div>
  );
}
