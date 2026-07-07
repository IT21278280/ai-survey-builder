import { notFound } from "next/navigation";
import { getSurveyById } from "@/actions/survey";
import { getSurveyResponses } from "@/actions/response";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ResponsesPageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyResponsesPage({ params }: ResponsesPageProps) {
  const { id } = await params;
  const survey = await getSurveyById(id);

  if (!survey) notFound();

  const responses = await getSurveyResponses(id);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href={`/forms/${id}/edit`}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to form
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-zinc-900">Responses</h1>
            <p className="mt-1 text-sm text-zinc-500">View submitted answers for your published survey.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              <p className="text-zinc-500">Total responses</p>
              <p className="mt-1 text-xl font-semibold text-zinc-900">{responses.length}</p>
            </div>
            {responses.length > 0 && (
              <a
                href={`/forms/${id}/responses/download`}
                download
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50"
              >
                Download CSV
              </a>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        {responses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-zinc-900">No responses yet</p>
            <p className="mt-2 text-sm text-zinc-500">
              Share your public form and start collecting responses from your audience.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-700">
              Public URL:
              <span className="font-medium text-zinc-900">{`/s/${survey.slug}`}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response) => (
              <section
                key={response.id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-zinc-100 bg-zinc-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Response ID</p>
                    <p className="mt-1 text-sm text-zinc-500 break-all">{response.id}</p>
                  </div>
                  <div className="text-sm text-zinc-500">
                    Submitted {formatDate(response.createdAt)}
                  </div>
                </div>
                <div className="divide-y divide-zinc-100 px-6 py-6">
                  {response.answers.map((answer) => (
                    <div key={answer.id} className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-zinc-900">{answer.question.title}</p>
                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                          {answer.option ? answer.option.label : "Free text"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600">
                        {answer.option ? answer.option.label : answer.value ?? "No answer provided."}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
