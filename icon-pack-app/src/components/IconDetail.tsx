"use client";

import { useEffect, useMemo, useState } from "react";
import type { IconMeta, IconStyle } from "@/lib/types";
import {
  buildCss,
  buildJsx,
  buildStandaloneSvg,
  downloadDataUrl,
  downloadString,
  svgToPngDataUrl,
} from "@/lib/svg";

interface Props {
  icon: IconMeta;
  bodies: Partial<Record<IconStyle, string>>;
  initialStyle: IconStyle;
  initialSize: number;
  initialColor: string;
  sizeOptions: number[];
  styles: IconStyle[];
  onClose: () => void;
}

type Tab = "SVG" | "JSX" | "CSS";

export default function IconDetail({
  icon,
  bodies,
  initialStyle,
  initialSize,
  initialColor,
  sizeOptions,
  styles,
  onClose,
}: Props) {
  const initial = icon.availableStyles.includes(initialStyle)
    ? initialStyle
    : icon.availableStyles[0];

  const [style, setStyle] = useState<IconStyle>(initial);
  const [size, setSize] = useState<number>(initialSize);
  const [color, setColor] = useState(initialColor);
  const [tab, setTab] = useState<Tab>("SVG");
  const [copied, setCopied] = useState<Tab | null>(null);

  // Keep the selected style valid if the icon changes (also handles availability).
  useEffect(() => {
    if (!icon.availableStyles.includes(style)) {
      setStyle(icon.availableStyles[0]);
    }
  }, [icon, style]);

  const body = bodies[style] ?? "";

  const className = useMemo(
    () => `icon-${icon.slug}-${style.toLowerCase()}`,
    [icon.slug, style]
  );

  const svgCode = useMemo(
    () => (body ? buildStandaloneSvg(body, { size, color }) : ""),
    [body, size, color]
  );

  const jsxCode = useMemo(
    () => (body ? buildJsx(body, { pascalName: icon.pascalName, style }) : ""),
    [body, icon.pascalName, style]
  );

  const cssCode = useMemo(
    () => (body ? buildCss(body, { size, color, className }) : ""),
    [body, size, color, className]
  );

  const codeByTab: Record<Tab, string> = {
    SVG: svgCode,
    JSX: jsxCode,
    CSS: cssCode,
  };

  const handleCopy = async (which: Tab) => {
    try {
      await navigator.clipboard.writeText(codeByTab[which]);
      setCopied(which);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      /* ignore */
    }
  };

  const handleDownloadSvg = () => {
    downloadString(svgCode, `${icon.slug}-${style.toLowerCase()}.svg`);
  };

  const handleDownloadPng = async () => {
    const dataUrl = await svgToPngDataUrl(svgCode, size);
    downloadDataUrl(dataUrl, `${icon.slug}-${style.toLowerCase()}-${size}.png`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-white shadow-2xl h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-ink-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <div className="text-xs text-ink-500">{icon.category}</div>
            <div className="text-lg font-semibold truncate">{icon.name}</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-ink-100 grid place-items-center text-ink-600"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Preview */}
          <div className="rounded-2xl bg-ink-50 border border-ink-200 p-6 flex items-center justify-center min-h-[200px]">
            <span
              className="icon-svg"
              style={{ width: size * 2.5, height: size * 2.5, color }}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 gap-4">
            <ControlRow label="Style">
              <Segmented
                options={styles.map((s) => ({
                  value: s,
                  disabled: !icon.availableStyles.includes(s),
                }))}
                value={style}
                onChange={(v) => setStyle(v as IconStyle)}
              />
            </ControlRow>

            <ControlRow label="Size">
              <Segmented
                options={sizeOptions.map((n) => ({ value: String(n) }))}
                value={String(size)}
                onChange={(v) => setSize(Number(v))}
              />
              <span className="ml-3 text-sm text-ink-500">px</span>
            </ControlRow>

            <ControlRow label="Color">
              <label className="inline-flex items-center gap-2 h-9 px-2.5 rounded-lg border border-ink-200 bg-white cursor-pointer hover:border-ink-300">
                <span
                  className="w-5 h-5 rounded-md border border-ink-200"
                  style={{ background: color }}
                />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="sr-only"
                  aria-label="Pick color"
                />
                <span className="text-xs text-ink-700 font-mono uppercase">
                  {color.replace("#", "")}
                </span>
              </label>
            </ControlRow>
          </div>

          {/* Downloads */}
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={handleDownloadSvg} icon="download">
              Download SVG
            </ActionButton>
            <ActionButton onClick={handleDownloadPng} icon="download">
              Download PNG
            </ActionButton>
          </div>

          {/* Code tabs */}
          <div className="rounded-2xl border border-ink-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-200 bg-ink-50">
              <div className="flex">
                {(["SVG", "JSX", "CSS"] as Tab[]).map((t) => {
                  const active = t === tab;
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={
                        "px-4 h-10 text-sm font-medium border-b-2 transition-colors " +
                        (active
                          ? "border-ink-900 text-ink-900"
                          : "border-transparent text-ink-500 hover:text-ink-900")
                      }
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handleCopy(tab)}
                className="mr-2 my-1.5 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-ink-900 text-white hover:bg-ink-700"
              >
                <CopyIcon />
                {copied === tab ? "Copied!" : `Copy ${tab}`}
              </button>
            </div>
            <pre className="m-0 px-4 py-3 text-xs leading-relaxed bg-ink-900 text-ink-100 overflow-x-auto max-h-72">
              <code>{codeByTab[tab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 text-xs uppercase tracking-wider text-ink-500 font-semibold">
        {label}
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; disabled?: boolean }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center bg-ink-100 p-1 rounded-lg">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={
              "px-3 h-7 text-xs rounded-md transition-colors " +
              (active
                ? "bg-white text-ink-900 shadow-sm font-medium"
                : opt.disabled
                ? "text-ink-300 cursor-not-allowed"
                : "text-ink-600 hover:text-ink-900")
            }
          >
            {opt.value}
          </button>
        );
      })}
    </div>
  );
}

function ActionButton({
  onClick,
  children,
  icon,
}: {
  onClick: () => void;
  children: React.ReactNode;
  icon: "download" | "copy";
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-ink-200 text-sm font-medium text-ink-800 hover:border-ink-900 hover:bg-ink-50 transition-colors"
    >
      {icon === "download" ? <DownloadIcon /> : <CopyIcon />}
      {children}
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}
