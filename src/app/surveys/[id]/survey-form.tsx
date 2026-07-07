"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitResponse } from "@/actions/response";
import { batchTrackInteractions, type InteractionPayload } from "@/actions/dropoff";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicSurvey } from "@/lib/analytics";

interface PublicSurveyFormProps {
  survey: PublicSurvey;
}

export function PublicSurveyForm({ survey }: PublicSurveyFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [starHover, setStarHover] = useState<Record<string, number>>({});

  // ── Drop-off tracking ────────────────────────────────────────────────────
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const startTimeRef = useRef(0);
  const questionStartRef = useRef(0);
  // Accumulated interactions for all questions navigated so far
  const interactionsRef = useRef<InteractionPayload[]>([]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    questionStartRef.current = Date.now();
  }, []);

  const questions = survey.questions;
  const totalSteps = questions.length;
  const question = questions[currentStep];
  const isLast = currentStep === totalSteps - 1;

  /** Snapshot the current question's time and push to accumulator */
  const recordCurrentQuestion = useCallback(
    (abandoned: boolean) => {
      const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
      const q = questions[currentStep];
      if (!q) return;

      // Overwrite if already recorded (e.g. prev→next→prev)
      const existing = interactionsRef.current.findIndex(
        (i) => i.questionId === q.id
      );
      const entry: InteractionPayload = {
        questionId: q.id,
        questionIndex: currentStep,
        timeSpent,
        abandoned,
      };
      if (existing >= 0) {
        interactionsRef.current[existing] = entry;
      } else {
        interactionsRef.current.push(entry);
      }
    },
    [currentStep, questions]
  );

  /** Reset the per-question clock whenever the step changes */
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentStep]);

  /** Abandonment beacon — fires when the user closes/navigates away */
  useEffect(() => {
    function handleUnload() {
      if (submitted) return;
      const q = questions[currentStep];
      if (!q) return;
      const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
      const payload = JSON.stringify({
        surveyId: survey.id,
        sessionId: sessionIdRef.current,
        questionId: q.id,
        questionIndex: currentStep,
        timeSpent,
      });
      try {
        navigator.sendBeacon("/api/track/abandon", new Blob([payload], { type: "application/json" }));
      } catch {
        // Silently ignore — beacon is best-effort
      }
    }

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [currentStep, questions, submitted, survey.id]);

  // ── Answer helpers ───────────────────────────────────────────────────────
  function setValue(qId: string, val: string | string[]) {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }

  function toggleCheckbox(qId: string, value: string) {
    const current = (answers[qId] as string[]) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(qId, next);
  }

  function canAdvance() {
    if (!question) return false;
    if (!question.isRequired) return true;
    const val = answers[question.id];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return val.trim().length > 0;
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  function handleNext() {
    recordCurrentQuestion(false);
    setCurrentStep((s) => s + 1);
  }

  function handlePrev() {
    recordCurrentQuestion(false);
    setCurrentStep((s) => s - 1);
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  function handleSubmit() {
    recordCurrentQuestion(false);
    const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);

    startTransition(async () => {
      const answerPayload = questions.map((q) => {
        const val = answers[q.id];
        return {
          questionId: q.id,
          value: Array.isArray(val) ? val.join(",") : (val ?? ""),
          optionId: undefined as string | undefined,
        };
      });

      const [responseResult] = await Promise.all([
        submitResponse({ surveyId: survey.id, answers: answerPayload, completionTime }),
        // Fire interaction tracking in parallel — failure is non-fatal
        batchTrackInteractions(
          survey.id,
          sessionIdRef.current,
          interactionsRef.current
        ).catch(() => null),
      ]);

      if (responseResult.success) {
        setSubmitted(true);
      } else {
        toast.error(responseResult.error ?? "Failed to submit. Please try again.");
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-violet-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Thank you!</h2>
          <p className="mt-2 text-zinc-500">
            Your response has been submitted successfully.
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
            <Zap className="h-3 w-3 text-indigo-500" />
            Powered by AI FormForge
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-violet-50 px-4 py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">This survey has no questions yet.</h2>
          <p className="mt-2 text-sm text-zinc-500">Please check back later or contact the survey owner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-violet-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Survey header */}
        <div className="mb-6 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 p-8 text-white shadow-lg shadow-indigo-200/50">
          <div className="mb-2 flex items-center gap-2 text-indigo-200">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-widest">Survey</span>
          </div>
          <h1 className="text-2xl font-bold">{survey.title}</h1>
          {survey.description && (
            <p className="mt-2 text-sm text-indigo-100">{survey.description}</p>
          )}
          {/* Progress bar */}
          <div className="mt-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-indigo-200">
              <span>
                Question {currentStep + 1} of {totalSteps}
              </span>
              <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-indigo-500/40"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-valuenow={currentStep + 1}
              aria-valuetext={`Question ${currentStep + 1} of ${totalSteps}`}
            >
              <div
                className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Question {currentStep + 1}
          </div>
          <h2 className="mb-1 text-lg font-semibold text-zinc-900">
            {question.title}
            {question.isRequired && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </h2>
          {question.description && (
            <p className="mb-5 text-sm text-zinc-500">{question.description}</p>
          )}

          <fieldset className="mt-5">
            <legend className="sr-only">Answer the current question</legend>
            {/* SHORT_TEXT / EMAIL / NUMBER / DATE */}
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
                placeholder={
                  question.type === "EMAIL"
                    ? "your@email.com"
                    : "Your answer..."
                }
                value={(answers[question.id] as string) ?? ""}
                onChange={(e) => setValue(question.id, e.target.value)}
                className="text-base"
                aria-label={question.title}
                aria-required={question.isRequired}
                autoFocus
              />
            )}

            {/* LONG_TEXT */}
            {question.type === "LONG_TEXT" && (
              <Textarea
                placeholder="Your answer..."
                rows={4}
                value={(answers[question.id] as string) ?? ""}
                onChange={(e) => setValue(question.id, e.target.value)}
                className="resize-none text-base"
                aria-label={question.title}
                aria-required={question.isRequired}
                autoFocus
              />
            )}

            {/* MULTIPLE_CHOICE */}
            {question.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                {question.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setValue(question.id, opt.value)}
                    aria-pressed={answers[question.id] === opt.value}
                    aria-label={`Select ${opt.label}`}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                      answers[question.id] === opt.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                        answers[question.id] === opt.value
                          ? "border-indigo-500 bg-indigo-500"
                          : "border-zinc-300"
                      )}
                    >
                      {answers[question.id] === opt.value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* CHECKBOX */}
            {question.type === "CHECKBOX" && (
              <div className="space-y-2">
                {question.options.map((opt) => {
                  const selected = ((answers[question.id] as string[]) ?? []).includes(opt.value);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleCheckbox(question.id, opt.value)}
                      aria-pressed={selected}
                      aria-label={`Select ${opt.label}`}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                        selected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2",
                          selected ? "border-indigo-500 bg-indigo-500" : "border-zinc-300"
                        )}
                      >
                        {selected && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* DROPDOWN */}
            {question.type === "DROPDOWN" && (
              <select
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={(answers[question.id] as string) ?? ""}
                onChange={(e) => setValue(question.id, e.target.value)}
                aria-label={question.title}
                aria-required={question.isRequired}
              >
                <option value="">Select an option...</option>
                {question.options.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* RATING */}
            {question.type === "RATING" && (
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const hover = starHover[question.id] ?? 0;
                  const selected = Number(answers[question.id] ?? 0);
                  const active = hover > 0 ? n <= hover : n <= selected;
                  return (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() =>
                        setStarHover((p) => ({ ...p, [question.id]: n }))
                      }
                      onMouseLeave={() =>
                        setStarHover((p) => ({ ...p, [question.id]: 0 }))
                      }
                      onClick={() => setValue(question.id, String(n))}
                      aria-label={`Rate ${n} out of 5`}
                      aria-pressed={active}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-9 w-9 transition-colors",
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "fill-zinc-100 text-zinc-300"
                        )}
                      />
                    </button>
                  );
                })}
                {answers[question.id] && (
                  <span className="ml-2 text-sm font-medium text-zinc-600">
                    {answers[question.id]} / 5
                  </span>
                )}
              </div>
            )}

            {/* SCALE */}
            {question.type === "SCALE" && (
              <div className="space-y-3">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={answers[question.id] ?? "5"}
                  onChange={(e) => setValue(question.id, e.target.value)}
                  aria-label={question.title}
                  aria-required={question.isRequired}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>1</span>
                  <span className="font-semibold text-indigo-600 text-base">
                    {answers[question.id] ?? "5"}
                  </span>
                  <span>10</span>
                </div>
              </div>
            )}
          </fieldset>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {isLast ? (
            <Button
              onClick={handleSubmit}
              disabled={isPending || (question.isRequired && !canAdvance())}
              className="gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canAdvance()}
              className="gap-1.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
