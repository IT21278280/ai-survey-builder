import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ExternalLink, Edit, BarChart2, FileText } from "lucide-react";

interface Survey {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt: Date;
  createdAt: Date;
  _count: { responses: number };
}

interface RecentSurveysTableProps {
  surveys: Survey[];
}

export function RecentSurveysTable({ surveys }: RecentSurveysTableProps) {
  if (surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
          <FileText className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900">No forms yet</h3>
        <p className="mt-1 text-sm text-zinc-500">Create your first form to get started.</p>
        <Link href="/forms/new" className="mt-4">
          <Button size="sm">Create Form</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Form
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Responses
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Last Updated
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {surveys.map((survey) => (
            <tr key={survey.id} className="group transition-colors hover:bg-zinc-50/50">
              <td className="px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-zinc-900 group-hover:text-indigo-600 transition-colors truncate max-w-60">
                    {survey.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">/s/{survey.slug}</p>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <Badge variant={survey.isPublished ? "success" : "secondary"}>
                  {survey.isPublished ? "Published" : "Draft"}
                </Badge>
              </td>
              <td className="px-4 py-3.5">
                <span className="text-sm tabular-nums text-zinc-700">
                  {survey._count.responses.toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <span className="text-sm text-zinc-400">{formatDate(survey.updatedAt)}</span>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  {survey.isPublished && (
                    <Link href={`/s/${survey.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                  <Link href={`/analytics?survey=${survey.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <BarChart2 className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link href={`/forms/${survey.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
