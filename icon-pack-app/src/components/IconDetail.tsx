"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IconStyle, IconMeta } from "@/lib/types";
import { buildCss, buildJsx, buildStandaloneSvg } from "@/lib/svg";
import { canCopyIcon, canDownloadIcon, isPremiumIcon } from "@/lib/access";
import { useToast } from "./Toast";
import { useIconDownloads } from "@/hooks/useIconDownloads";
import type { ExportOptions, IconExportInput } from "@/lib/export-engine";
import DownloadDropdown from "./DownloadDropdown";
import type { DownloadItem } from "./DownloadMenuItem";
import PremiumBadge from "./PremiumBadge";

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

  const toast = useToast();
  const downloads = useIconDownloads();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const premium = isPremiumIcon(icon);
  const allowCopy = canCopyIcon(icon);
  const allowDownload = canDownloadIcon(icon);

  // Move focus into the dialog when it opens
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!icon.availableStyles.includes(style)) {
      setStyle(icon.availableStyles[0]);
    }
  }, [icon, style]);

  // Focus trap: keep Tab cycling within the panel
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        "button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex=\"-1\"])"
      )
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  const body = bodies[style] ?? "";

  const className = useMemo(
    () => `icon-${icon.slug}-${style.toLowerCase()}`,
    [icon.slug, style]
  );

  const exportOpts: ExportOptions = useMemo(
    () => ({ size, color }),
    [size, color]
  );

  const exportInput: IconExportInput = useMemo(
    () => ({ slug: icon.slug, name: icon.name, style, svg: body }),
    [icon.slug, icon.name, style, body]
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
    if (!allowCopy) {
      toast.error("Premium icon. Upgrade access required.");
      return;
    }
    try {
      await navigator.clipboard.writeText(codeByTab[which]);
      setCopied(which);
      setTimeout(() => setCopied(null), 1400);
      toast.success(`Copied ${which} code`);
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  const downloadItems: DownloadItem[] = useMemo(
    () => [
      {
        id: "svg",
        label: "Download as SVG",
        description: "For design tools & web (Figma, code)",
        onSelect: () => downloads.single(exportInput, exportOpts, "svg"),
      },
      {
        id: "png",
        label: "Download as PNG",
        description: "For apps & presentations (transparent bg)",
        onSelect: () => downloads.single(exportInput, exportOpts, "png"),
      },
      {
        id: "jpeg",
        label: "Download as JPEG",
        description: "For docs & photos (white background)",
        onSelect: () => downloads.single(exportInput, exportOpts, "jpeg"),
      },
      {
        id: "all",
        label: "Download all formats",
        description: "Downloads a .zip with SVG, PNG & JPEG",
        onSelect: () => downloads.allFormats(exportInput, exportOpts),
      },
    ],
    [downloads, exportInput, exportOpts]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="icon-detail-title"
        className="w-full sm:max-w-xl bg-white dark:bg-ink-900 shadow-2xl h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="sticky top-0 bg-white/95 dark:bg-ink-900/95 backdrop-blur border-b border-ink-200 dark:border-ink-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <div className="text-xs text-ink-500 flex items-center gap-2">
              {icon.category}
              {premium && <PremiumBadge />}
            </div>
            <div
              id="icon-detail-title"
              className="text-lg font-semibold truncate dark:text-white"
            >
              {icon.name}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 grid place-items-center text-ink-600 dark:text-ink-300"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Preview */}
          <div className="rounded-2xl bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 p-6 flex items-center justify-center min-h-[200px]">
            <span
              aria-hidden="true"
              className={"icon-svg " + (premium ? "opacity-40" : "")}
              style={{ width: size * 2.5, height: size * 2.5, color }}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>

          {premium && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
              <span>Premium icon. Upgrade access required.</span>
              <a href="#upgrade" className="shrink-0 font-medium underline hover:no-underline">
                Upgrade →
              </a>
            </div>
          )}

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
              <label className="inline-flex items-center gap-2 h-9 px-2.5 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 cursor-pointer hover:border-ink-300">
                <span
                  className="w-5 h-5 rounded-md border border-ink-200 dark:border-ink-600"
                  style={{ background: color }}
                />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="sr-only"
                  aria-label="Pick color"
                />
                <span className="text-xs text-ink-700 dark:text-ink-200 font-mono uppercase">
                  {color.replace("#", "")}
                </span>
              </label>
            </ControlRow>
          </div>

          {/* Download dropdown */}
          <div className="flex items-center gap-3">
            <DownloadDropdown
              items={downloadItems}
              label="Download"
              disabled={!allowDownload}
              disabledReason={premium ? "Premium icon. Upgrade access required." : undefined}
              align="start"
              ariaLabel={`Download ${icon.name}`}
            />
            {!allowDownload && (
              <span className="text-xs text-ink-500">Locked</span>
            )}
          </div>

          {/* Code tabs */}
          <div className="rounded-2xl border border-ink-200 dark:border-ink-700 overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800">
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
                          ? "border-ink-900 dark:border-white text-ink-900 dark:text-white"
                          : "border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-white")
                      }
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handleCopy(tab)}
                disabled={!allowCopy}
                title={!allowCopy ? "Premium icon. Upgrade access required." : undefined}
                className="mr-2 my-1.5 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-ink-900 text-white hover:bg-ink-700 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CopyIcon />
                {copied === tab ? "Copied!" : `Copy ${tab}`}
              </button>
            </div>
            <pre className="m-0 px-4 py-3 text-xs leading-relaxed bg-ink-900 dark:bg-black text-ink-100 overflow-x-auto max-h-72">
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
    <div className="inline-flex items-center bg-ink-100 dark:bg-ink-800 p-1 rounded-lg">
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
                ? "bg-white dark:bg-ink-600 text-ink-900 dark:text-white shadow-sm font-medium"
                : opt.disabled
                ? "text-ink-300 dark:text-ink-600 cursor-not-allowed"
                : "text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white")
            }
          >
            {opt.value}
          </button>
        );
      })}
    </div>
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
