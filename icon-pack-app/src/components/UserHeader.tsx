"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props { displayName: string; }

export default function UserHeader({ displayName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 dark:border-ink-800 bg-white/80 dark:bg-ink-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <span className="font-semibold text-sm text-ink-900 dark:text-white tracking-tight">
          Digche Icons
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-600 dark:text-ink-400 hidden sm:block">
            Hi, <span className="font-medium text-ink-900 dark:text-white">{displayName}</span>
          </span>
          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="h-8 px-3 rounded-lg text-xs font-medium text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? "…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
