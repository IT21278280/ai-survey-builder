import { getSurveyById } from "@/actions/survey";
import { getSurveyResponses } from "@/actions/response";
import { NextRequest, NextResponse } from "next/server";

function escapeCsv(value: string) {
  const safeValue = value.replace(/"/g, '""');
  return safeValue.includes(",") || safeValue.includes("\n") || safeValue.includes("\r") || safeValue.includes("\"")
    ? `"${safeValue}"`
    : safeValue;
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const survey = await getSurveyById(id);

  if (!survey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const responses = await getSurveyResponses(id);

  const questionColumns = survey.questions.map((question, index) =>
    `Question ${index + 1}: ${question.title}`
  );
  const headers = ["Response ID", "Submitted At", "Total Answers", ...questionColumns];
  const rows: string[] = [headers.map(escapeCsv).join(",")];

  for (const response of responses) {
    const submittedAt = response.completedAt?.toISOString() ?? response.createdAt.toISOString();
    const answerMap = new Map(response.answers.map((answer) => [answer.questionId, answer]));

    const row = [
      escapeCsv(response.id),
      escapeCsv(submittedAt),
      escapeCsv(String(response.answers.length)),
    ];

    for (const question of survey.questions) {
      const answer = answerMap.get(question.id);
      const answerText = answer
        ? answer.option?.label ?? answer.value ?? ""
        : "";
      row.push(escapeCsv(answerText));
    }

    rows.push(row.join(","));
  }

  const csv = `\uFEFF${rows.join("\r\n")}`;
  const fileName = `responses-${survey.slug}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
