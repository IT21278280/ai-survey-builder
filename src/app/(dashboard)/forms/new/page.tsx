"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSurveySchema, type CreateSurveyInput } from "@/lib/validations/survey";
import { createSurvey } from "@/actions/survey";
import { toast } from "sonner";
import Link from "next/link";

export default function NewFormPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSurveyInput>({
    resolver: zodResolver(createSurveySchema),
  });

  const onSubmit = (data: CreateSurveyInput) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);

      const result = await createSurvey(formData);
      if (result.success && result.data) {
        toast.success("Form created!");
        router.push(`/forms/${result.data.id}/edit`);
      } else {
        toast.error(result.error ?? "Failed to create form");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create a new form</h1>
          <p className="mt-2 text-sm text-gray-500">
            Give your form a title and we&apos;ll set up the rest.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700" htmlFor="title">
                Form title
              </label>
              <Input
                id="title"
                placeholder="e.g. Customer Satisfaction Survey"
                required
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700" htmlFor="description">
                Description <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <Textarea
                id="description"
                placeholder="Tell respondents what this form is about..."
                rows={3}
                className="resize-none"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/forms" className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending}
              >
                {isPending ? "Creating..." : "Create Form"}
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Or use{" "}
          <span className="inline-flex items-center gap-1 font-medium text-indigo-600">
            <Wand2 className="h-3 w-3" /> AI Generate
          </span>{" "}
          in the editor to auto-build your form.
        </p>
      </div>
    </div>
  );
}
