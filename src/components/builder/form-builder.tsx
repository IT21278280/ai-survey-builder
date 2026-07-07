"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { addQuestion, reorderQuestions, updateSurvey } from "@/actions/survey";
import { QuestionEditor } from "./question-editor";
import { QuestionPalette } from "./question-palette";
import { AiGenerateDialog } from "./ai-generate-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wand2, LayoutList, Eye, Sparkles, Copy, MessageSquare } from "lucide-react";
import Link from "next/link";

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

interface QuestionOption {
  id: string;
  label: string;
  value: string;
  order: number;
}

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  isRequired: boolean;
  order: number;
  options: QuestionOption[];
}

interface Survey {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  questions: Question[];
}

interface FormBuilderProps {
  survey: Survey;
}

export function FormBuilder({ survey }: FormBuilderProps) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(survey.isPublished);
  const [isTogglingPublish, startToggle] = useTransition();
  const [, startReorder] = useTransition();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [optimisticQuestions, setOptimisticQuestions] = useState<Question[]>([]);
  // Keep initial value empty so server and client initial render match.
  // Populate origin on mount to avoid hydration mismatch.
  const [clientOrigin, setClientOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientOrigin(window.location.origin);
    }
  }, []);

  // Optimistic ordering — keep a local ordered list
  const [orderedIds, setOrderedIds] = useState<string[]>(
    survey.questions.map((q) => q.id)
  );

  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    survey.questions.forEach((q) => map.set(q.id, q));
    optimisticQuestions.forEach((q) => map.set(q.id, q));
    return map;
  }, [survey.questions, optimisticQuestions]);

  const orderedQuestions = useMemo(() => {
    const knownIds = orderedIds.filter((id) => questionMap.has(id));
    const existingIds = new Set(knownIds);
    const missingIds = [...survey.questions, ...optimisticQuestions]
      .map((question) => question.id)
      .filter((id) => !existingIds.has(id));

    return [...knownIds, ...missingIds]
      .map((id) => questionMap.get(id))
      .filter((question): question is Question => Boolean(question));
  }, [orderedIds, questionMap, survey.questions, optimisticQuestions]);

  function handleDragEnd(result: DropResult) {
    if (!result.destination || result.destination.index === result.source.index)
      return;

    const targetIndex = result.destination.index;
    if (targetIndex < 0 || targetIndex > orderedIds.length) return;

    const previousIds = [...orderedIds];
    const newIds = [...orderedIds];
    const [moved] = newIds.splice(result.source.index, 1);
    if (!moved) return;

    newIds.splice(targetIndex, 0, moved);
    setOrderedIds(newIds);

    startReorder(async () => {
      const res = await reorderQuestions(survey.id, newIds);
      if (!res.success) {
        toast.error("Failed to save order");
        setOrderedIds(previousIds);
      }
    });
  }

  async function handleAddQuestion(qt: {
    type: QuestionType;
    label: string;
    description: string;
    defaultOptions?: { label: string; value: string; order: number }[];
  }) {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticQuestion: Question = {
      id: tempId,
      type: qt.type,
      title: `Untitled ${qt.label}`,
      description: null,
      isRequired: false,
      order: orderedQuestions.length,
      options:
        (qt.defaultOptions ?? []).map((option, index) => ({
          id: `${tempId}-option-${index}`,
          label: option.label,
          value: option.value,
          order: index,
        })),
    };

    setOptimisticQuestions((prev) => [...prev, optimisticQuestion]);
    setOrderedIds((prev) => [...prev, tempId]);

    const result = await addQuestion(survey.id, {
      type: qt.type,
      title: optimisticQuestion.title,
      isRequired: false,
      order: orderedQuestions.length,
      options: optimisticQuestion.options,
    });

    if (!result.success || !result.data) {
      setOptimisticQuestions((prev) => prev.filter((question) => question.id !== tempId));
      setOrderedIds((prev) => prev.filter((id) => id !== tempId));
      toast.error(result.error ?? "Failed to add question");
      return;
    }

    const createdQuestion: Question = {
      id: result.data.id,
      type: result.data.type as QuestionType,
      title: result.data.title,
      description: result.data.description ?? null,
      isRequired: result.data.isRequired,
      order: result.data.order,
      options:
        result.data.options?.map((option) => ({
          id: option.id,
          label: option.label,
          value: option.value,
          order: option.order,
        })) ?? [],
    };

    setOptimisticQuestions((prev) =>
      prev.filter((question) => question.id !== tempId).concat(createdQuestion)
    );
    setOrderedIds((prev) => prev.map((id) => (id === tempId ? createdQuestion.id : id)));
    router.refresh();
  }

  const publicPath = `/s/${survey.slug}`;
  const publicUrl = clientOrigin ? `${clientOrigin}${publicPath}` : publicPath;

  function copyShareLink() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => {
      toast.success("Share link copied");
    });
  }

  function handleTogglePublish() {
    const next = !isPublished;
    setIsPublished(next);
    startToggle(async () => {
      const res = await updateSurvey(survey.id, { isPublished: next });
      if (res.success) {
        toast.success(next ? "Form published" : "Form unpublished");
        router.refresh();
      } else {
        setIsPublished(!next);
        toast.error(res.error ?? "Failed to update");
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
            <LayoutList className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-zinc-900 leading-none">
              {survey.title}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-400 leading-none">
              {orderedQuestions.length} question
              {orderedQuestions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Publish toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="publish-toggle"
              checked={isPublished}
              onCheckedChange={handleTogglePublish}
              disabled={isTogglingPublish}
            />
            <Label htmlFor="publish-toggle" className="text-xs font-medium">
              {isPublished ? "Published" : "Draft"}
            </Label>
          </div>

          {/* AI Generate */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setAiDialogOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            AI Generate
          </Button>

          {/* View live */}
          {isPublished && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => router.push(`/forms/${survey.id}/responses`)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Responses
            </Button>
          )}

          {isPublished && (
            <Link href={`/s/${survey.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Live form URL
            </p>
            <p className="mt-1 truncate text-sm font-medium text-zinc-900">
              {isPublished ? publicUrl : "Publish the survey to generate a public share link."}
            </p>
          </div>
          {isPublished ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={copyShareLink}>
              <Copy className="h-3.5 w-3.5" />
              Copy link
            </Button>
          ) : null}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Questions list */}
        <div className="flex-1 overflow-y-auto p-5">
          {orderedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 py-24 text-center">
              <Wand2 className="mb-3 h-8 w-8 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-500">
                No questions yet
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Add questions from the panel on the right
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {orderedQuestions.map((question, index) => (
                      <Draggable
                        key={question.id}
                        draggableId={question.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.85 : 1,
                            }}
                          >
                            <QuestionEditor
                              question={question}
                              surveyId={survey.id}
                              dragHandleProps={provided.dragHandleProps}
                              index={index}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Sidebar: question palette */}
        <div className="w-60 shrink-0 overflow-y-auto border-l border-zinc-200 bg-zinc-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Add question
          </p>
          <QuestionPalette
            surveyId={survey.id}
            questionCount={orderedQuestions.length}
            onAddQuestion={handleAddQuestion}
          />
        </div>
      </div>

      <AiGenerateDialog
        surveyId={survey.id}
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        currentQuestionCount={orderedQuestions.length}
      />
    </div>
  );
}
