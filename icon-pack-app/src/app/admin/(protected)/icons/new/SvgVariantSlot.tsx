"use client";

import { useRef, useState } from "react";

interface Props {
  style: string;
  required?: boolean;
  svgContent: string | null;
  onChange: (content: string | null) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function SvgVariantSlot({
  style,
  required,
  svgContent,
  onChange,
  isSelected,
  onSelect,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function processFile(file: File) {
    setError(null);
    if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
      setError("Only .svg files are accepted.");
      return;
    }
    if (file.size > 100 * 1024) {
      setError("File must be under 100 KB.");
      return;
    }
    const text = await file.text();
    if (!/<svg[\s>]/i.test(text)) {
      setError("File does not appear to be an SVG.");
      return;
    }
    onChange(text);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    processFile(files[0]);
  }

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragging(true); },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-ink-700 dark:text-ink-300">
          {style}
        </span>
        {required && (
          <span className="text-[10px] text-ink-400 dark:text-ink-500">
            required
          </span>
        )}
        {/* Code editor toggle — only when there's content */}
        {svgContent && onSelect && (
          <button
            type="button"
            onClick={onSelect}
            title="Edit SVG code"
            className={
              "ml-auto text-[11px] font-mono px-1 rounded transition-colors " +
              (isSelected
                ? "text-ink-900 dark:text-white bg-ink-100 dark:bg-ink-700"
                : "text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-200")
            }
          >
            {"</>"}
          </button>
        )}
        {svgContent && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className={
              "text-[11px] text-ink-400 hover:text-red-500 dark:text-ink-500 dark:hover:text-red-400 transition-colors " +
              (svgContent && onSelect ? "" : "ml-auto")
            }
          >
            Remove
          </button>
        )}
      </div>

      {svgContent ? (
        <div
          className={
            "h-24 rounded-xl border bg-ink-50 dark:bg-ink-900/50 flex items-center justify-center cursor-pointer transition-all p-2 " +
            (dragging
              ? "border-ink-400 bg-ink-100 dark:bg-ink-800"
              : isSelected
              ? "border-ink-900 dark:border-white ring-2 ring-ink-900/10 dark:ring-white/10"
              : "border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600")
          }
          onClick={() => inputRef.current?.click()}
          title="Click to replace"
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{ color: "currentColor" }}
          {...dropHandlers}
        />
      ) : (
        <div
          className={
            "h-24 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer " +
            (dragging
              ? "border-ink-400 bg-ink-50 dark:bg-ink-800"
              : "border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600")
          }
          onClick={() => inputRef.current?.click()}
          {...dropHandlers}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ink-300 dark:text-ink-600"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-[11px] text-ink-400 dark:text-ink-500">
            Drop or click
          </span>
        </div>
      )}

      {/* Paste code entry for empty slots */}
      {!svgContent && onSelect && (
        <button
          type="button"
          onClick={onSelect}
          className="text-[11px] text-center text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
        >
          or paste code
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
