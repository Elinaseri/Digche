"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInWithEmailAction, signUpWithEmailAction } from "./actions";

type Tab = "login" | "register";
type IconStyle = "Linear" | "Bold" | "Outline" | "Bulk";

export interface ShowcaseIcon {
  slug: string;
  name: string;
  bodies: Partial<Record<string, string>>;
}

interface Props {
  showcaseIcons: ShowcaseIcon[];
}

const STYLES: IconStyle[] = ["Linear", "Bold", "Outline", "Bulk"];

export default function LoginPageClient({ showcaseIcons }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
    setInfo(null);
  }

  function handleGoogleSignIn() {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (tab === "login") {
      startTransition(async () => {
        const res = await signInWithEmailAction(email, password);
        if (res.error) {
          setError(res.error);
          return;
        }
        router.push("/");
        router.refresh();
      });
    } else {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      startTransition(async () => {
        const res = await signUpWithEmailAction(name, email, password);
        if (res.error) {
          setError(res.error);
          return;
        }
        if (res.needsConfirmation) {
          setInfo("Check your email to confirm your account, then log in.");
          switchTab("login");
          return;
        }
        router.push("/");
        router.refresh();
      });
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — interactive showcase ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-ink-950 overflow-hidden flex-col">
        <IconShowcase icons={showcaseIcons} />
      </div>

      {/* ── Right panel — form ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-ink-950 min-h-screen">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 text-center lg:text-left">
            <span className="text-xl font-bold text-ink-900 dark:text-white tracking-tight">
              Digche
            </span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-ink-200 dark:border-ink-700 mb-8">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={
                  "pb-3 pr-5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px " +
                  (tab === t
                    ? "border-ink-900 dark:border-white text-ink-900 dark:text-white"
                    : "border-transparent text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300")
                }
              >
                {t === "login" ? "Log in" : "Register"}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-ink-900 dark:text-white mb-6">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h1>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 hover:border-ink-400 dark:hover:border-ink-500 text-sm font-medium text-ink-900 dark:text-white transition-colors mb-5"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-ink-100 dark:bg-ink-700" />
            <span className="text-xs text-ink-400 dark:text-ink-500">or with email</span>
            <div className="flex-1 h-px bg-ink-100 dark:bg-ink-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "register" && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
                className="w-full h-11 px-4 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
              className="w-full h-11 px-4 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
                className="w-full h-11 px-4 pr-11 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-semibold hover:bg-ink-700 dark:hover:bg-ink-100 disabled:opacity-50 transition-colors mt-1"
            >
              {isPending
                ? "Please wait…"
                : tab === "login"
                ? "Log in"
                : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-ink-400 dark:text-ink-500">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-ink-700 dark:hover:text-ink-300">
              terms of service
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Icon Showcase ────────────────────────────────────────────────────────────

function IconShowcase({ icons }: { icons: ShowcaseIcon[] }) {
  const [style, setStyle] = useState<IconStyle>("Linear");
  const [visible, setVisible] = useState(true);
  const [darkPreview, setDarkPreview] = useState(true);

  // Fade out → change style → fade in
  const [pendingStyle, setPendingStyle] = useState<IconStyle | null>(null);

  function switchStyle(s: IconStyle) {
    if (s === style) return;
    setVisible(false);
    setPendingStyle(s);
  }

  useEffect(() => {
    if (!visible && pendingStyle) {
      const t = setTimeout(() => {
        setStyle(pendingStyle);
        setPendingStyle(null);
        setVisible(true);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [visible, pendingStyle]);

  // Pick icons that have the selected style; fallback to any available style
  const grid = icons.slice(0, 25).map((icon) => ({
    slug: icon.slug,
    name: icon.name,
    body: icon.bodies[style] ?? Object.values(icon.bodies)[0] ?? "",
    hasStyle: !!icon.bodies[style],
  }));

  const iconColor = darkPreview ? "#e2e8f0" : "#1e293b";
  const tileBg = darkPreview
    ? "bg-ink-800 hover:bg-ink-700"
    : "bg-slate-100 hover:bg-slate-200";

  return (
    <div
      className={
        "flex flex-col h-full transition-colors duration-300 " +
        (darkPreview ? "bg-ink-950" : "bg-slate-50")
      }
    >
      {/* Controls bar */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        {/* Style tabs */}
        <div
          className={
            "inline-flex items-center p-1 rounded-xl gap-0.5 " +
            (darkPreview ? "bg-ink-800" : "bg-white shadow-sm border border-slate-200")
          }
        >
          {STYLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => switchStyle(s)}
              className={
                "px-3 h-7 text-xs rounded-lg transition-all font-medium " +
                (style === s
                  ? darkPreview
                    ? "bg-ink-600 text-white shadow-sm"
                    : "bg-ink-900 text-white shadow-sm"
                  : darkPreview
                  ? "text-ink-400 hover:text-ink-200"
                  : "text-slate-500 hover:text-slate-800")
              }
            >
              {s}
            </button>
          ))}
        </div>

        {/* Dark/light preview toggle */}
        <button
          type="button"
          onClick={() => setDarkPreview((v) => !v)}
          title={darkPreview ? "Switch to light preview" : "Switch to dark preview"}
          className={
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors " +
            (darkPreview
              ? "bg-ink-800 text-ink-300 hover:bg-ink-700 hover:text-white"
              : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800")
          }
        >
          {darkPreview ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Icon grid */}
      <div className="flex-1 px-8 overflow-hidden">
        {icons.length === 0 ? (
          <EmptyShowcase darkPreview={darkPreview} />
        ) : (
          <div
            className="grid gap-2 transition-opacity duration-180"
            style={{
              gridTemplateColumns: "repeat(5, 1fr)",
              opacity: visible ? 1 : 0,
              transition: "opacity 180ms ease",
            }}
          >
            {grid.map((icon) => (
              <div
                key={icon.slug}
                title={icon.name}
                className={
                  "aspect-square rounded-2xl flex items-center justify-center transition-colors cursor-default " +
                  (icon.hasStyle ? "" : "opacity-30 ") +
                  tileBg
                }
              >
                <span
                  className="icon-svg"
                  style={{ width: 28, height: 28, color: iconColor, display: "flex" }}
                  dangerouslySetInnerHTML={{ __html: icon.body }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom brand text */}
      <div className="px-8 pb-10 pt-6">
        <p
          className={
            "text-2xl font-bold tracking-tight " +
            (darkPreview ? "text-white" : "text-ink-900")
          }
        >
          Digche Icons
        </p>
        <p className={darkPreview ? "text-sm text-ink-400 mt-1" : "text-sm text-slate-500 mt-1"}>
          {icons.length > 0
            ? `${icons.length}+ icons · Bold, Bulk, Linear & Outline`
            : "Beautiful, consistent icons for designers & developers."}
        </p>
      </div>
    </div>
  );
}

function EmptyShowcase({ darkPreview }: { darkPreview: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full pb-16 gap-3">
      <div
        className={
          "w-16 h-16 rounded-2xl flex items-center justify-center " +
          (darkPreview ? "bg-ink-800" : "bg-white shadow-sm border border-slate-200")
        }
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke={darkPreview ? "#94a3b8" : "#64748b"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <p
        className={
          "text-sm text-center " + (darkPreview ? "text-ink-400" : "text-slate-500")
        }
      >
        Icons will appear here
        <br />
        once published.
      </p>
    </div>
  );
}

// ── Small icons ──────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M1 1l22 22" />
    </svg>
  );
}
