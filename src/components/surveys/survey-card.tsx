"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditSurveyDialog } from "./edit-survey-dialog";
import { DeleteSurveyDialog } from "./delete-survey-dialog";
import { duplicateSurvey } from "@/actions/survey";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  BarChart2,
  MessageSquare,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { responses: number; questions: number };
}

interface SurveyCardProps {
  survey: Survey;
}

export function SurveyCard({ survey }: SurveyCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDuplicating, startDuplicate] = useTransition();

  function handleDuplicate() {
    startDuplicate(async () => {
      const result = await duplicateSurvey(survey.id);
      if (result.success) {
        toast.success("Form duplicated");
      } else {
        toast.error(result.error ?? "Failed to duplicate");
      }
    });
  }

  return (
    <>
      <div className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
            <FileText className="h-4.5 w-4.5 text-indigo-600" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/forms/${survey.id}/edit`} className="flex items-center gap-2">
                  <Edit className="h-3.5 w-3.5" />
                  Edit builder
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setShowEdit(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleDuplicate}
                disabled={isDuplicating}
                className="flex items-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </DropdownMenuItem>
              {survey.isPublished && (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/s/${survey.slug}`}
                    target="_blank"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View live
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onSelect={() => setShowDelete(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <Link href={`/forms/${survey.id}/edit`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
            {survey.title}
          </h3>
          {survey.description && (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{survey.description}</p>
          )}
        </Link>

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between">
          <Badge variant={survey.isPublished ? "success" : "secondary"}>
            {survey.isPublished ? "Published" : "Draft"}
          </Badge>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {survey._count.questions}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {survey._count.responses}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
          <span className="text-[11px] text-zinc-400">{formatDate(survey.updatedAt)}</span>
          <Link href={`/analytics?survey=${survey.id}`}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <BarChart2 className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <EditSurveyDialog open={showEdit} onOpenChange={setShowEdit} survey={survey} />
      <DeleteSurveyDialog open={showDelete} onOpenChange={setShowDelete} survey={survey} />
    </>
  );
}
