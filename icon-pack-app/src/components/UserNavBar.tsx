"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
import { signOutAction } from "@/app/actions/signout";

const APP_VERSION = "1.0.0";

export default function UserNavBar() {
  const { user, plan, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Account";
  const firstName = displayName.split(" ")[0];
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = useCallback(() => {
    setOpen(false);
    startTransition(async () => {
      await signOutAction();
    });
  }, []);

  return (
    <div className="shrink-0 border-b border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-950 px-4 md:px-8 h-12 flex items-center justify-end gap-1">
      <ThemeToggle />

      {!isLoading && user && (
        <div ref={rootRef} className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
            className="inline-flex items-center gap-2 h-9 px-2.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 active:bg-ink-200 dark:active:bg-ink-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 dark:focus-visible:ring-white"
          >
            <span className="w-7 h-7 rounded-full bg-ink-200 dark:bg-ink-700 overflow-hidden shrink-0 flex items-center justify-center text-xs font-semibold text-ink-700 dark:text-ink-200">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span
              className="hidden sm:block text-sm text-ink-600 dark:text-ink-300 leading-none"
              dir="ltr"
            >
              Hi,{" "}
              <span className="font-medium text-ink-900 dark:text-white">{firstName}</span>
            </span>
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              aria-hidden
              className={"text-ink-400 transition-transform " + (open ? "rotate-180" : "")}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {open && (
            <div
              role="menu"
              aria-label="Account menu"
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 shadow-soft z-50 p-1.5"
            >
              {/* User info header */}
              <div className="px-3 py-3 border-b border-ink-100 dark:border-ink-700 mb-1 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-ink-200 dark:bg-ink-700 overflow-hidden shrink-0 flex items-center justify-center text-sm font-semibold text-ink-700 dark:text-ink-200">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                <div className="min-w-0">
                  <div
                    className="text-sm font-semibold text-ink-900 dark:text-white truncate"
                    dir="ltr"
                  >
                    {displayName}
                  </div>
                  <div className="text-xs mt-0.5">
                    {plan === "premium" ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        ✦ Premium
                      </span>
                    ) : (
                      <span className="text-ink-400 dark:text-ink-500">Free plan</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Version */}
              <div className="px-3 h-8 flex items-center justify-between">
                <span className="text-xs text-ink-400 dark:text-ink-500">Version</span>
                <span className="text-xs font-mono text-ink-500 dark:text-ink-400">
                  v{APP_VERSION}
                </span>
              </div>

              <div className="h-px bg-ink-100 dark:bg-ink-700 mx-1 my-1" />

              {plan === "free" && (
                <button
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="w-full text-left px-3 h-9 rounded-lg text-sm font-medium text-ink-900 dark:text-white hover:bg-ink-50 dark:hover:bg-ink-700 active:bg-ink-100 dark:active:bg-ink-600 transition-colors"
                >
                  Upgrade to Premium →
                </button>
              )}

              <button
                role="menuitem"
                onClick={handleSignOut}
                disabled={isPending}
                className="w-full text-left px-3 h-9 rounded-lg text-sm text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 hover:text-ink-900 dark:hover:text-white active:bg-ink-100 dark:active:bg-ink-600 active:text-ink-900 dark:active:text-white disabled:opacity-50 transition-colors"
              >
                {isPending ? "Signing out…" : "Sign out"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
