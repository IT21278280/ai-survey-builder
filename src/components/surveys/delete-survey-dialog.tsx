"use client";

import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteSurvey } from "@/actions/survey";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey: { id: string; title: string };
}

export function DeleteSurveyDialog({ open, onOpenChange, survey }: DeleteSurveyDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSurvey(survey.id);
      if (result.success) {
        toast.success("Form deleted");
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Failed to delete form");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <DialogTitle>Delete form</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{survey.title}&rdquo;? This will permanently
            remove the form and all of its responses. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
