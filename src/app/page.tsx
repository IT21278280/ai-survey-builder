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
      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">AI FormForge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Get Started Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <Wand2 className="h-3.5 w-3.5" />
          Powered by AI
        </div>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl">
          Build smarter forms
          <br />
          <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            with AI
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-gray-500">
          AI FormForge helps you create professional surveys and forms in
          seconds. Collect responses, analyze data, and make better decisions.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Start Building Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

