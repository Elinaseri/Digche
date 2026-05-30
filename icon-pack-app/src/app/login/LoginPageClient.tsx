"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

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

const FLOAT_SLOTS = [
  { top: "6%",  left: "4%",  size: 88,  delay: 0.0 },
  { top: "4%",  left: "36%", size: 72,  delay: 0.5 },
  { top: "5%",  left: "64%", size: 96,  delay: 1.1 },
  { top: "27%", left: "14%", size: 80,  delay: 1.6 },
  { top: "29%", left: "52%", size: 68,  delay: 0.3 },
  { top: "26%", left: "77%", size: 72,  delay: 0.9 },
  { top: "52%", left: "2%",  size: 72,  delay: 1.3 },
  { top: "50%", left: "33%", size: 88,  delay: 0.7 },
  { top: "49%", left: "67%", size: 76,  delay: 1.9 },
  { top: "72%", left: "10%", size: 96,  delay: 0.4 },
  { top: "70%", left: "46%", size: 72,  delay: 1.2 },
  { top: "72%", left: "75%", size: 84,  delay: 0.8 },
];

const PASTEL_BG = [
  "bg-blue-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-green-100",
  "bg-amber-100",
  "bg-orange-100",
  "bg-teal-100",
  "bg-indigo-100",
  "bg-rose-100",
  "bg-cyan-100",
  "bg-violet-100",
  "bg-emerald-100",
];

const ICON_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#14b8a6",
  "#6366f1",
  "#f43f5e",
  "#06b6d4",
  "#7c3aed",
  "#059669",
];

export default function LoginPageClient({ showcaseIcons }: Props) {
  const [tab, setTab] = useState<Tab>("login");
  const [isPending, setIsPending] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsPending(true);

    try {
      const supabase = createClient();

      if (tab === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) { setError(authError.message); return; }
        window.location.href = "/";
      } else {
        if (!name.trim()) { setError("Please enter your name."); return; }
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (authError) { setError(authError.message); return; }
        if (!data.session) {
          setInfo("Check your email to confirm your account, then log in.");
          switchTab("login");
          return;
        }
        window.location.href = "/";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left panel — showcase ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col overflow-hidden">
        <IconShowcase icons={showcaseIcons} />
      </div>

      {/* ── Right panel — form ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="mb-8 text-center lg:text-left">
            <span className="text-xl font-bold text-ink-900 tracking-tight">Digche</span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-8">
            {(["login", "register"] as Tab[]).map((t) => (
              <button key={t} type="button" onClick={() => switchTab(t)}
                className={"pb-3 pr-5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px " +
                  (tab === t
                    ? "border-ink-900 text-ink-900"
                    : "border-transparent text-slate-400 hover:text-slate-700")}>
                {t === "login" ? "Log in" : "Register"}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-ink-900 mb-6">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h1>

          {/* Google */}
          <button type="button" onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-slate-200 bg-white hover:border-slate-400 text-sm font-medium text-ink-900 transition-colors mb-5">
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or with email</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "register" && (
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <UserIcon />
                </span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" autoComplete="name" required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors" />
              </div>
            )}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <MailIcon />
              </span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" autoComplete="email" required
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors" />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <LockIcon />
              </span>
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                required minLength={6}
                className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            {info && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{info}</p>
            )}

            <button type="submit" disabled={isPending}
              className="w-full h-11 rounded-xl bg-ink-900 text-white text-sm font-semibold hover:bg-ink-700 disabled:opacity-50 transition-colors mt-1">
              {isPending ? "Please wait…" : tab === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-slate-400">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-slate-700">terms of service</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Icon Showcase (left panel) ───────────────────────────────────────────────

function IconShowcase({ icons }: { icons: ShowcaseIcon[] }) {
  const [style, setStyle] = useState<IconStyle>("Linear");

  const tiles = useMemo(() => {
    if (icons.length === 0) return [];
    const n = Math.min(icons.length, FLOAT_SLOTS.length);
    const step = Math.max(1, Math.floor(icons.length / n));
    return Array.from({ length: n }, (_, i) => icons[(i * step) % icons.length]).filter(Boolean);
  }, [icons]);

  return (
    <div className="relative flex flex-col h-full bg-ink-50 overflow-hidden">
      <style>{`
        @keyframes digche-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        .digche-float-icon > svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>

      {/* Floating tiles */}
      <div className="absolute inset-0">
        {tiles.map((icon, i) => {
          const slot = FLOAT_SLOTS[i];
          if (!slot) return null;
          const body = icon.bodies[style] ?? Object.values(icon.bodies)[0] ?? "";
          const iconSize = Math.round(slot.size * 0.48);
          return (
            <div
              key={icon.slug}
              style={{
                position: "absolute",
                top: slot.top,
                left: slot.left,
                width: slot.size,
                height: slot.size,
                animationName: "digche-float",
                animationDuration: "3.6s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${slot.delay}s`,
              }}
              className={"rounded-2xl flex items-center justify-center shadow-sm " + PASTEL_BG[i % PASTEL_BG.length]}
            >
              {body && (
                <span
                  className="digche-float-icon"
                  style={{
                    width: iconSize,
                    height: iconSize,
                    color: ICON_COLORS[i % ICON_COLORS.length],
                    opacity: 0.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom bar: brand left, style switcher right */}
      <div className="absolute bottom-8 left-8 right-8 z-10 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tight text-ink-900">Digche Icons</p>
          <p className="text-sm mt-1 text-slate-500">
            {icons.length > 0
              ? `${icons.length}+ icons · Bold, Bulk, Linear & Outline`
              : "Beautiful icons for designers & developers."}
          </p>
        </div>
        <div className="inline-flex items-center p-1 rounded-xl bg-white shadow-sm border border-slate-200 gap-0.5 mb-1">
          {STYLES.map((s) => (
            <button key={s} type="button" onClick={() => setStyle(s)}
              className={"px-3 h-7 text-xs rounded-lg transition-colors font-medium " +
                (style === s
                  ? "bg-ink-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800")}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Small utility icons ──────────────────────────────────────────────────────

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M1 1l22 22" />
    </svg>
  );
}
