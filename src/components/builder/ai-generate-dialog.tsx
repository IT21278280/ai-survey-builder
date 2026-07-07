"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateSurveyWithAI } from "@/actions/ai";
import { addQuestion, updateSurvey } from "@/actions/survey";
import { toast } from "sonner";
import { Wand2, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionInput } from "@/lib/validations/survey";

interface AiGenerateDialogProps {
  surveyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestionCount: number;
}

type Stage = "input" | "preview" | "done";

export function AiGenerateDialog({
  surveyId,
  open,
  onOpenChange,
  currentQuestionCount,
}: AiGenerateDialogProps) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("input");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [preview, setPreview] = useState<{
    title: string;
    description: string;
    questions: QuestionInput[];
  } | null>(null);
  const [isGenerating, startGenerate] = useTransition();
  const [isAdding, startAdd] = useTransition();

  function handleClose() {
    if (isGenerating || isAdding) return;
    onOpenChange(false);
    setTimeout(() => {
      setStage("input");
      setTopic("");
      setQuestionCount(5);
      setPreview(null);
    }, 300);
  }

  function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Please describe your survey topic");
      return;
    }
    startGenerate(async () => {
      const result = await generateSurveyWithAI(topic, questionCount);
      if (result.success && result.data) {
        setPreview(result.data);
        setStage("preview");
      } else {
        toast.error(result.error ?? "AI generation failed");
      }
    });
  }

  function handleAddQuestions() {
    if (!preview) return;
    startAdd(async () => {
      let failed = 0;
      for (let i = 0; i < preview.questions.length; i++) {
        const q = preview.questions[i];
        const res = await addQuestion(surveyId, {
          ...q,
          order: currentQuestionCount + i,
        });
        if (!res.success) failed++;
      }

      // Optionally update the survey title/description if it currently has no content
      await updateSurvey(surveyId, {
        // Don't overwrite existing title
      });

      if (failed > 0) {
        toast.warning(`Added ${preview.questions.length - failed} of ${preview.questions.length} questions.`);
      } else {
        toast.success(`Added ${preview.questions.length} AI-generated questions!`);
      }

      router.refresh();
      setStage("done");
      setTimeout(handleClose, 1200);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {stage === "input" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                  <Wand2 className="h-4 w-4 text-indigo-600" />
                </div>
                AI Survey Generator
              </DialogTitle>
              <DialogDescription>
                Describe what your survey is about and Gemini will generate
                professional questions for you.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-900">
                  Survey topic
                </label>
                <Textarea
                  placeholder="e.g. Customer satisfaction for our SaaS product, Employee onboarding experience, Event feedback for a tech conference..."
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-900">
                  Number of questions
                </label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Math.max(1, Math.min(15, Number(e.target.value)))
                    )
                  }
                  className="w-28"
                />
                <p className="mt-1 text-xs text-zinc-500">Max 15 questions</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === "preview" && preview && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                </div>
                Review Generated Questions
              </DialogTitle>
              <DialogDescription>
                {preview.questions.length} questions generated for &ldquo;{preview.title}&rdquo;.
                Click &ldquo;Add to Survey&rdquo; to insert them.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-72 overflow-y-auto space-y-2 py-2 pr-1">
              {preview.questions.map((q, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-900 leading-snug">
                      {i + 1}. {q.title}
                      {q.isRequired && (
                        <span className="ml-1 text-red-500 text-xs">*</span>
                      )}
                    </p>
                    <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                      {q.type}
                    </span>
                  </div>
                  {q.options && q.options.length > 0 && (
                    <p className="mt-1 text-xs text-zinc-400">
                      Options: {q.options.map((o) => o.label).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStage("input")}
                disabled={isAdding}
              >
                ← Regenerate
              </Button>
              <Button
                onClick={handleAddQuestions}
                disabled={isAdding}
                className="gap-2"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Add to Survey
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="font-semibold text-zinc-900">Questions Added!</p>
            <p className="mt-1 text-sm text-zinc-500">Your survey has been updated.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
