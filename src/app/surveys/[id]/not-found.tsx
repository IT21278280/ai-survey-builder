import Link from "next/link";

export default function SurveyNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-violet-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-3xl">
          🔍
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Survey Not Found</h2>
        <p className="mt-2 text-zinc-500">
          This survey may no longer be active or the link is incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
