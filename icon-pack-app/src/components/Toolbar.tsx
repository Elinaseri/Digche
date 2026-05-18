"use client";

import type { IconStyle } from "@/lib/types";
import DownloadAllButton from "./DownloadAllButton";

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
}: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-ink-200">
      <div className="px-5 md:px-8 py-3 flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50"
          aria-label="Toggle categories"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-ink-900 text-white grid place-items-center font-semibold">
            D
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-ink-900">Digche Icons</div>
            <div className="text-xs text-ink-500">
              {totalShown.toLocaleString()} / {total.toLocaleString()} shown
            </div>
          </div>
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
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="search"
            placeholder="Search 137 icons..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-ink-100 border border-transparent focus:bg-white focus:border-ink-300 focus:outline-none text-sm placeholder:text-ink-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <SegmentedControl
            options={styles}
            value={style}
            onChange={(v) => onStyleChange(v as IconStyle)}
          />
        </div>

        <div className="flex items-center gap-2">
          <SizePicker
            options={sizeOptions}
            value={size}
            onChange={onSizeChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <ColorPicker value={color} onChange={onColorChange} />
        </div>

        <DownloadAllButton />
      </div>
    </header>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center bg-ink-100 p-1 rounded-xl"
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
                ? "bg-white text-ink-900 shadow-sm font-medium"
                : "text-ink-600 hover:text-ink-900")
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
    <div className="inline-flex items-center bg-ink-100 p-1 rounded-xl">
      {options.map((n) => {
        const active = n === value;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={
              "px-2.5 h-8 text-xs rounded-lg transition-colors " +
              (active
                ? "bg-white text-ink-900 shadow-sm font-medium"
                : "text-ink-600 hover:text-ink-900")
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
    <label className="inline-flex items-center gap-2 h-10 px-2.5 rounded-xl border border-ink-200 bg-white cursor-pointer hover:border-ink-300">
      <span
        className="w-5 h-5 rounded-md border border-ink-200"
        style={{ background: value }}
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        aria-label="Pick icon color"
      />
      <span className="text-xs text-ink-600 font-mono uppercase">
        {value.replace("#", "")}
      </span>
    </label>
  );
}
