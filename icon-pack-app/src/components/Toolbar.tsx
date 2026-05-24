"use client";

import { useEffect, useRef } from "react";
import type { IconStyle } from "@/lib/types";
import DigLogo from "./DigLogo";
import ThemeToggle from "./ThemeToggle";
import DownloadDropdown from "./DownloadDropdown";
import type { DownloadItem } from "./DownloadMenuItem";
import AccountMenu from "./AccountMenu";
import { useAuth } from "@/lib/auth";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  style: IconStyle;
  onStyleChange: (s: IconStyle) => void;
  size: number;
  onSizeChange: (s: number) => void;
  color: string;
  onColorChange: (c: string) => void;
  sizeOptions: number[];
  styles: IconStyle[];
  totalShown: number;
  total: number;
  onToggleSidebar: () => void;
  onDownloadEntirePack: () => void;
}

export default function Toolbar({
  query,
  onQueryChange,
  style,
  onStyleChange,
  size,
  onSizeChange,
  color,
  onColorChange,
  sizeOptions,
  styles,
  totalShown,
  total,
  onToggleSidebar,
  onDownloadEntirePack,
}: Props) {
  const { user, isLoading, openAuthModal } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const bulkItems: DownloadItem[] = [
    {
      id: "pack",
      label: "Download entire pack",
      description: "All icons · current style · SVG",
      onSelect: onDownloadEntirePack,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-ink-900/85 backdrop-blur border-b border-ink-200 dark:border-ink-700">
      <div className="px-5 md:px-8 py-3 flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800"
          aria-label="Toggle categories"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 mr-2">
          <DigLogo size={32} variant="full" />
          <span className="hidden lg:inline text-xs text-ink-500 ml-1">
            {totalShown.toLocaleString()} / {total.toLocaleString()}
          </span>
        </div>

        <div className="flex-1 min-w-[220px] max-w-xl relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="search"
            placeholder="Search icons..."
            className={"w-full h-10 pl-10 rounded-xl bg-ink-100 dark:bg-ink-800 border border-transparent focus:bg-white dark:focus:bg-ink-900 focus:border-ink-300 dark:focus:border-ink-600 focus:outline-none text-sm placeholder:text-ink-400 dark:text-ink-100 " + (query ? "pr-9" : "pr-3")}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900 dark:hover:text-white"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <SegmentedControl
          options={styles}
          value={style}
          onChange={(v) => onStyleChange(v as IconStyle)}
          ariaLabel="Icon style"
        />

        <SizePicker options={sizeOptions} value={size} onChange={onSizeChange} />

        <ColorPicker value={color} onChange={onColorChange} />

        <DownloadDropdown
          items={bulkItems}
          label="Download"
          ariaLabel="Bulk download options"
        />

        <div className="flex items-center gap-2">
          {!isLoading && (
            user ? (
              <AccountMenu />
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="h-9 px-4 rounded-xl text-sm font-medium bg-ink-900 dark:bg-white text-white dark:text-ink-900 hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors"
              >
                Sign in
              </button>
            )
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center bg-ink-100 dark:bg-ink-800 p-1 rounded-xl"
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className={
              "px-3 h-8 text-sm rounded-lg transition-colors " +
              (active
                ? "bg-white dark:bg-ink-600 text-ink-900 dark:text-white shadow-sm font-medium"
                : "text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white")
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SizePicker({
  options,
  value,
  onChange,
}: {
  options: number[];
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div role="group" aria-label="Icon size" className="inline-flex items-center bg-ink-100 dark:bg-ink-800 p-1 rounded-xl">
      {options.map((n) => {
        const active = n === value;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={
              "px-2.5 h-8 text-xs rounded-lg transition-colors " +
              (active
                ? "bg-white dark:bg-ink-600 text-ink-900 dark:text-white shadow-sm font-medium"
                : "text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white")
            }
            aria-label={`Preview size ${n}px`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <label title="Preview & export color" className="inline-flex items-center gap-2 h-10 px-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 cursor-pointer hover:border-ink-300">
      <span
        className="w-5 h-5 rounded-md border border-ink-200 dark:border-ink-600"
        style={{ background: value }}
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        aria-label="Pick icon color"
      />
      <span className="text-xs text-ink-600 dark:text-ink-300 font-mono uppercase">
        {value.replace("#", "")}
      </span>
    </label>
  );
}
