import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error;

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center">
      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="grid grid-cols-1 gap-8 rounded-2xl md:grid-cols-2">
          {/* Left: contextual marketing / copy */}
          <section className="order-2 flex flex-col justify-center gap-6 rounded-2xl p-6 md:order-1 md:pr-8">
            <div className="mb-2">
              <h1 className="text-2xl font-extrabold text-zinc-900">Welcome to FormForge</h1>
              <p className="mt-2 text-sm text-zinc-600">Sign in with Google to access your forms, analytics, and AI-powered form generation.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 flex-shrink-0 rounded-md bg-indigo-50 p-1 text-indigo-600">
                  🔒
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">Secure by default</h4>
                  <p className="text-xs text-zinc-500">We store sessions in your database and never share your data without consent.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 flex-shrink-0 rounded-md bg-indigo-50 p-1 text-indigo-600">⚡</div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">Fast setup</h4>
                  <p className="text-xs text-zinc-500">Create surveys quickly with AI suggestions and publish instantly.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Global error banner (e.g. OAuthAccountNotLinked) */}
          {error === "OAuthAccountNotLinked" && (
            <div className="md:col-span-2">
              <div className="mb-4 rounded-lg border-l-4 border-rose-500 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-700">Account already linked</p>
                <p className="mt-1 text-sm text-rose-700">
                  The Google account you tried to sign in with is already associated with a different user in the system.
                  If this is your account, sign in with the same provider you originally used or contact support to merge accounts.
                </p>
              </div>
            </div>
          )}

          {/* Right: login card */}
          <section className="order-1 md:order-2">
            <LoginForm />
          </section>
        </div>
      </main>
    </div>
  );
}
