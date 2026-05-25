"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAction } from "./actions";
import DigLogo from "@/components/DigLogo";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await signInAction(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-ink-800 rounded-2xl shadow-soft border border-ink-200 dark:border-ink-700 p-8">
        <div className="flex justify-center mb-8">
          <DigLogo size={40} variant="full" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-ink-900 dark:text-white">
            Admin Sign In
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Access is restricted to admins only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="w-full h-10 px-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full h-10 px-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-10 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 active:bg-ink-800 dark:active:bg-ink-200 disabled:opacity-50 transition-colors"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
