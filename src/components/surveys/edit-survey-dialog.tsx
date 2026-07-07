"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateSurvey } from "@/actions/survey";
import { toast } from "sonner";

interface EditSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey: {
    id: string;
    title: string;
    description: string | null;
    isPublished: boolean;
  };
}

export function EditSurveyDialog({ open, onOpenChange, survey }: EditSurveyDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(survey.isPublished);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || undefined,
      isPublished,
    };

    startTransition(async () => {
      const result = await updateSurvey(survey.id, data);
      if (result.success) {
        toast.success("Form updated!");
        onOpenChange(false);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>Edit form</DialogTitle>
          <DialogDescription>Update your form&apos;s details and settings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-survey-form">
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={survey.title}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={survey.description ?? ""}
                rows={3}
                disabled={isPending}
                className="resize-none"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
              <div>
                <p className="text-sm font-medium text-zinc-900">Published</p>
                <p className="text-xs text-zinc-500">
                  {isPublished ? "Accepting responses" : "Hidden from public"}
                </p>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={setIsPublished}
                disabled={isPending}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="edit-survey-form" disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
