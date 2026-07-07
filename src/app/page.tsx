import Link from "next/link";
import { Zap, ArrowRight, CheckCircle, BarChart2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Wand2,
    title: "AI-Powered Generation",
    description:
      "Describe your goal and let AI generate complete surveys in seconds.",
  },
  {
    icon: BarChart2,
    title: "Real-time Analytics",
    description:
      "Track responses, completion rates, and insights with live dashboards.",
  },
  {
    icon: CheckCircle,
    title: "Drag & Drop Builder",
    description:
      "Build complex forms visually with 10+ question types and instant previews.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">AI FormForge</span>
            <div className="text-xs text-zinc-500">Smart forms, faster insights</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-zinc-700">
              Sign in
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <Wand2 className="h-3.5 w-3.5" />
          Powered by AI
        </div>

        <h1 className="mx-auto max-w-3xl mb-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl">
          Build smarter forms that convert
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Create surveys and forms with AI-powered suggestions, instant previews,
          and built-in analytics — so you can make decisions faster.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              Start Building Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full border-zinc-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
              View Demo
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="transform rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h4 className="mb-2 text-lg font-semibold text-zinc-900">Why teams love FormForge</h4>
          <p className="text-sm text-zinc-600">Fast setup, flexible question types, and real-time insights that help teams iterate quickly.</p>
        </div>
      </section>
    </main>
  );
}

