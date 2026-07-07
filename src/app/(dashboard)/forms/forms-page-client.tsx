"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateSurveyDialog } from "@/components/surveys/create-survey-dialog";
import { Plus } from "lucide-react";

interface FormsPageClientProps {
  showLabel?: boolean;
}

export function FormsPageClient({ showLabel }: FormsPageClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {showLabel !== false && "New Form"}
      </Button>
      <CreateSurveyDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
