"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption,
} from "@/actions/survey";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

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

interface QuestionEditorProps {
  question: Question;
  surveyId: string;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  index: number;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  SHORT_TEXT: "Short text",
  LONG_TEXT: "Long text",
  EMAIL: "Email",
  MULTIPLE_CHOICE: "Multiple choice",
  CHECKBOX: "Checkboxes",
  DROPDOWN: "Dropdown",
  RATING: "Rating",
  SCALE: "Scale",
  DATE: "Date",
  NUMBER: "Number",
};

const TYPE_COLORS: Record<QuestionType, string> = {
  SHORT_TEXT: "bg-blue-50 text-blue-700",
  LONG_TEXT: "bg-blue-50 text-blue-700",
  EMAIL: "bg-indigo-50 text-indigo-700",
  MULTIPLE_CHOICE: "bg-violet-50 text-violet-700",
  CHECKBOX: "bg-violet-50 text-violet-700",
  DROPDOWN: "bg-violet-50 text-violet-700",
  RATING: "bg-amber-50 text-amber-700",
  SCALE: "bg-amber-50 text-amber-700",
  DATE: "bg-emerald-50 text-emerald-700",
  NUMBER: "bg-emerald-50 text-emerald-700",
};

const HAS_OPTIONS: QuestionType[] = ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"];

export function QuestionEditor({
  question,
  surveyId,
  dragHandleProps,
  index,
}: QuestionEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description ?? "");
  const [isRequired, setIsRequired] = useState(question.isRequired);
  const [showDesc, setShowDesc] = useState(!!question.description);
  const [newOption, setNewOption] = useState("");

  const router = useRouter();
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isAddingOption, startAddOption] = useTransition();

  const hasOptions = HAS_OPTIONS.includes(question.type);

  function handleSave() {
    startSave(async () => {
      const result = await updateQuestion(question.id, surveyId, {
        title,
        description: showDesc ? description : "",
        isRequired,
      });
      if (result.success) {
        toast.success("Saved");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to save");
      }
    });
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteQuestion(question.id, surveyId);
      if (result.success) {
        toast.success("Question deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  }

  function handleAddOption() {
    if (!newOption.trim()) return;
    startAddOption(async () => {
      const result = await addOption(question.id, surveyId, newOption.trim());
      if (result.success) {
        setNewOption("");
        toast.success("Option added");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to add option");
      }
    });
  }

  function handleDeleteOption(optionId: string) {
    startAddOption(async () => {
      const result = await deleteOption(optionId, surveyId);
      if (result.success) {
        toast.success("Option deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete option");
      }
    });
  }

  return (
    <div
      className={cn(
        "group rounded-xl border bg-white shadow-sm transition-shadow",
        expanded ? "border-indigo-200 shadow-md" : "border-zinc-200"
      )}
    >
      {/* Header row (always visible) */}
      <div
        className="flex cursor-pointer items-start gap-3 p-4"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="mt-0.5 flex shrink-0 cursor-grab touch-none text-zinc-300 hover:text-zinc-500"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Number */}
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500">
          {index + 1}
        </span>

        {/* Type badge + title */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              "mb-1 self-start rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              TYPE_COLORS[question.type]
            )}
          >
            {TYPE_LABELS[question.type]}
          </span>
          <p className="truncate text-sm font-medium text-zinc-900">
            {title || <span className="text-zinc-400 italic">Untitled question</span>}
          </p>
        </div>

        {/* Required badge */}
        {isRequired && (
          <span className="mt-0.5 shrink-0 rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
            Required
          </span>
        )}

        {/* Expand toggle */}
        <button
          className="mt-0.5 shrink-0 text-zinc-400"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3">
          <div className="space-y-3">
            {/* Title input */}
            <div className="space-y-1">
              <Label htmlFor={`q-title-${question.id}`}>Question</Label>
              <Input
                id={`q-title-${question.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your question"
              />
            </div>

            {/* Description toggle + input */}
            <button
              type="button"
              onClick={() => setShowDesc((v) => !v)}
              className="text-xs text-indigo-600 hover:underline"
            >
              {showDesc ? "Remove description" : "+ Add description"}
            </button>
            {showDesc && (
              <div className="space-y-1">
                <Label htmlFor={`q-desc-${question.id}`}>Description</Label>
                <Textarea
                  id={`q-desc-${question.id}`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional helper text shown below the question"
                  rows={2}
                  className="resize-none"
                />
              </div>
            )}

            {/* Options (for choice-type questions) */}
            {hasOptions && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-1.5">
                  {question.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-zinc-300" />
                      <span className="flex-1 text-sm text-zinc-700">{opt.label}</span>
                      <button
                        onClick={() => handleDeleteOption(opt.id)}
                        className="text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add option..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddOption}
                    disabled={isAddingOption || !newOption.trim()}
                    className="h-8 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Rating preview */}
            {question.type === "RATING" && (
              <div className="space-y-1">
                <Label>Preview</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="h-6 w-6 text-zinc-200" />
                  ))}
                </div>
              </div>
            )}

            {/* Footer row: Required switch + actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id={`req-${question.id}`}
                  checked={isRequired}
                  onCheckedChange={setIsRequired}
                />
                <Label htmlFor={`req-${question.id}`} className="text-xs">
                  Required
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-7 gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-7"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
