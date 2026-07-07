import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSurveyById } from "@/actions/survey";
import { FormBuilder } from "@/components/builder/form-builder";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Edit Form" };

interface EditFormPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { id } = await params;
  const survey = await getSurveyById(id);

  if (!survey) notFound();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Breadcrumb bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2.5">
        <Link
          href="/forms"
          className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My Forms
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="max-w-60 truncate text-xs font-medium text-zinc-800">
          {survey.title}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <FormBuilder survey={survey} />
      </div>
    </div>
  );
}
