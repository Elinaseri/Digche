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

// Semantic keyword map for each menu slot
const MENU_CONFIG: { label: string; keywords: string[] }[] = [
  { label: "Dashboard",      keywords: ["category", "dashboard", "home", "grid", "overview"] },
  { label: "My Orders",      keywords: ["bag-tick", "bag-shop", "bag-star", "bag", "shopping", "cart", "order"] },
  { label: "Calendar",       keywords: ["calendar"] },
  { label: "Notifications",  keywords: ["notification", "bell", "alarm", "cloud-notif", "alert"] },
  { label: "Messages",       keywords: ["sms", "direct", "chat", "comment", "message"] },
  { label: "My Files",       keywords: ["folder"] },
  { label: "Settings",       keywords: ["setting", "gear", "settings"] },
  { label: "Profile",        keywords: ["user"] },
];

function findIcon(icons: ShowcaseIcon[], keywords: string[]): ShowcaseIcon | undefined {
  for (const kw of keywords) {
    const found = icons.find(
      (i) => i.slug.toLowerCase().includes(kw) || i.name.toLowerCase().includes(kw)
    );
    if (found) return found;
  }
  return undefined;
}

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
        if (res.error) { setError(res.error); return; }
        router.push("/");
        router.refresh();
      });
    } else {
      if (!name.trim()) { setError("Please enter your name."); return; }
      startTransition(async () => {
        const res = await signUpWithEmailAction(name, email, password);
        if (res.error) { setError(res.error); return; }
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
  const [darkPreview, setDarkPreview] = useState(true);

  // Map each menu slot to the best matching icon from DB
  const menuItems = MENU_CONFIG.map((cfg, i) => {
    const icon = findIcon(icons, cfg.keywords) ?? icons[i];
    return {
      label: cfg.label,
      body: icon ? (icon.bodies[style] ?? Object.values(icon.bodies)[0] ?? "") : "",
      active: i === 0,
    };
  });

  const mainItems = menuItems.slice(0, 5);
  const bottomItems = menuItems.slice(5);

  const dark = darkPreview;
  const panelBg   = dark ? "bg-ink-900" : "bg-slate-100";
  const cardBg    = dark ? "bg-ink-800/70 border-ink-700/50" : "bg-white border-slate-200";
  const headerBg  = dark ? "bg-ink-800 border-b border-ink-700/50" : "bg-slate-50 border-b border-slate-200";
  const appName   = dark ? "text-white" : "text-slate-800";
  const itemActive = dark ? "bg-ink-600 text-white" : "bg-ink-900 text-white";
  const itemNormal = dark ? "text-ink-300 hover:bg-ink-700/60 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  const iconActiveC = "#ffffff";
  const iconNormalC = dark ? "#94a3b8" : "#64748b";
  const divider   = dark ? "bg-ink-700/50" : "bg-slate-200";
  const tabActive = dark ? "bg-ink-700 text-white shadow-sm" : "bg-ink-900 text-white shadow-sm";
  const tabNormal = dark ? "text-ink-400 hover:text-ink-100" : "text-slate-500 hover:text-slate-800";
  const tabBg     = dark ? "bg-ink-800" : "bg-white shadow-sm border border-slate-200";
  const toggleBtn = dark
    ? "bg-ink-800 text-ink-300 hover:bg-ink-700 hover:text-white"
    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800";

  return (
    <div className={"flex flex-col h-full overflow-hidden transition-colors duration-200 " + panelBg}>

      {/* Style switcher + theme toggle */}
      <div className="flex items-center justify-between px-8 pt-7 pb-5 shrink-0">
        <div className={"inline-flex items-center p-1 rounded-xl gap-0.5 " + tabBg}>
          {STYLES.map((s) => (
            <button key={s} type="button" onClick={() => setStyle(s)}
              className={"px-3 h-7 text-xs rounded-lg transition-colors font-medium " + (style === s ? tabActive : tabNormal)}>
              {s}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setDarkPreview((v) => !v)}
          className={"w-8 h-8 rounded-lg flex items-center justify-center transition-colors " + toggleBtn}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Mock navigation card */}
      <div className="flex-1 flex items-center justify-center px-10 overflow-hidden">
        <div className={"w-full max-w-[220px] rounded-2xl border overflow-hidden shadow-xl " + cardBg}>

          {/* App header */}
          <div className={"px-4 py-3 flex items-center gap-2.5 " + headerBg}>
            <div className={"w-6 h-6 rounded-md flex items-center justify-center shrink-0 " + (dark ? "bg-ink-600" : "bg-ink-900")}>
              <svg viewBox="0 0 40 40" width="14" height="14">
                <circle cx="20" cy="20" r="9" fill="none" stroke="white" strokeWidth="2.4" />
                <path d="M13.5 21.6 A6.6 6.6 0 0 1 26.2 18.4 Z" fill="white" />
              </svg>
            </div>
            <span className={"text-xs font-semibold " + appName}>Workspace</span>
          </div>

          {/* Main nav */}
          <div className="px-2 pt-2 pb-1">
            {mainItems.map((item, i) => (
              <div key={i}
                className={"flex items-center gap-2.5 px-2.5 h-8 rounded-lg mb-0.5 transition-colors cursor-default " +
                  (item.active ? itemActive : itemNormal)}>
                {item.body ? (
                  <span style={{ width: 15, height: 15, color: item.active ? iconActiveC : iconNormalC, display: "flex", flexShrink: 0 }}
                    dangerouslySetInnerHTML={{ __html: item.body }} />
                ) : (
                  <span style={{ width: 15, height: 15, background: item.active ? "rgba(255,255,255,0.25)" : (dark ? "#334155" : "#e2e8f0"), borderRadius: 3, flexShrink: 0 }} />
                )}
                <span className="text-xs font-medium truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          {bottomItems.length > 0 && (
            <>
              <div className={"mx-3 my-1 h-px " + divider} />
              <div className="px-2 pb-2">
                {bottomItems.map((item, i) => (
                  <div key={i}
                    className={"flex items-center gap-2.5 px-2.5 h-8 rounded-lg mb-0.5 transition-colors cursor-default " + itemNormal}>
                    {item.body ? (
                      <span style={{ width: 15, height: 15, color: iconNormalC, display: "flex", flexShrink: 0 }}
                        dangerouslySetInnerHTML={{ __html: item.body }} />
                    ) : (
                      <span style={{ width: 15, height: 15, background: dark ? "#334155" : "#e2e8f0", borderRadius: 3, flexShrink: 0 }} />
                    )}
                    <span className="text-xs font-medium truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Brand */}
      <div className="px-8 pb-8 pt-5 shrink-0">
        <p className={"text-2xl font-bold tracking-tight " + (dark ? "text-white" : "text-ink-900")}>
          Digche Icons
        </p>
        <p className={"text-sm mt-1 " + (dark ? "text-ink-400" : "text-slate-500")}>
          {icons.length > 0
            ? `${icons.length}+ icons · Bold, Bulk, Linear & Outline`
            : "Beautiful icons for designers & developers."}
        </p>
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

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
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
