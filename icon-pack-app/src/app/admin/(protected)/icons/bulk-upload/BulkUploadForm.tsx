"use client";

import { useRef, useState, useTransition } from "react";
import { slugify, toPascalCase } from "@/lib/svg-utils";
import { bulkCreateIconsAction } from "./actions";
import type { IconStyle } from "@/lib/domain/types";

const STYLES: IconStyle[] = ["Bold", "Bulk", "Linear", "Outline"];
const STYLE_SHORT: Record<IconStyle, string> = { Bold: "B", Bulk: "Bk", Linear: "L", Outline: "O" };

interface ParsedVariant { style: IconStyle; svgContent: string; }
interface ParsedIcon { name: string; slug: string; pascalName: string; variants: ParsedVariant[]; }
interface ParseResult {
  categoryName: string;
  categorySlug: string;
  icons: ParsedIcon[];
  skipped: string[];
}

async function parseFiles(files: FileList): Promise<ParseResult> {
  const iconMap = new Map<string, ParsedVariant[]>();
  let categoryName = "";
  const skipped: string[] = [];

  for (const file of Array.from(files)) {
    const parts = file.webkitRelativePath.split("/");
    if (parts.length < 3) continue;
    if (!categoryName) categoryName = parts[0];

    const iconFolder = parts[1];
    const filename = parts[parts.length - 1];
    const match = filename.match(/-(Bold|Bulk|Linear|Outline)\.svg$/i);

    if (!match) {
      if (!filename.startsWith(".") && filename.toLowerCase().endsWith(".svg")) {
        skipped.push(file.webkitRelativePath);
      }
      continue;
    }

    const style = STYLES.find((s) => s.toLowerCase() === match[1].toLowerCase())!;
    const content = await file.text();
    if (!iconMap.has(iconFolder)) iconMap.set(iconFolder, []);
    iconMap.get(iconFolder)!.push({ style, svgContent: content });
  }

  return {
    categoryName,
    categorySlug: slugify(categoryName),
    icons: Array.from(iconMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, variants]) => ({
        name,
        slug: slugify(name),
        pascalName: toPascalCase(name),
        variants,
      })),
    skipped,
  };
}

export default function BulkUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: string[]; errors: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);

  async function process(files: FileList) {
    setIsParsing(true);
    setParseError(null);
    setParsed(null);
    setResult(null);
    try {
      const r = await parseFiles(files);
      if (!r.categoryName) {
        setParseError("No valid folder structure found. Expected: CategoryName/IconName/IconName-Bold.svg");
        return;
      }
      if (r.icons.length === 0) {
        setParseError("No icons found. Make sure SVG files are named with a style suffix, e.g. Arrow-Bold.svg");
        return;
      }
      setParsed(r);
    } catch {
      setParseError("Failed to read folder.");
    } finally {
      setIsParsing(false);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) process(e.target.files);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) process(e.dataTransfer.files);
  }

  function handleImport() {
    if (!parsed) return;
    startTransition(async () => {
      const res = await bulkCreateIconsAction(
        parsed.icons.map((i) => ({
          name: i.name,
          slug: i.slug,
          pascalName: i.pascalName,
          category: parsed.categoryName,
          categorySlug: parsed.categorySlug,
          variants: i.variants,
        }))
      );
      setResult(res);
    });
  }

  function reset() {
    setParsed(null);
    setResult(null);
    setParseError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* Dropzone */}
      {!parsed && !result && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={
            "bg-white dark:bg-ink-800 border-2 border-dashed rounded-2xl px-8 py-16 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-colors " +
            (dragging
              ? "border-ink-400 dark:border-ink-400 bg-ink-50 dark:bg-ink-700/40"
              : "border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600")
          }
        >
          <div className="w-12 h-12 rounded-xl bg-ink-100 dark:bg-ink-700 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400 dark:text-ink-500">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <path d="M12 11v6M9 14l3-3 3 3" />
            </svg>
          </div>
          {isParsing ? (
            <p className="text-sm text-ink-500 dark:text-ink-400">Parsing folder…</p>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
                  Drop a category folder here
                </p>
                <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
                  or click to browse
                </p>
              </div>
              <p className="text-[11px] text-ink-300 dark:text-ink-600 font-mono">
                CategoryName / IconName / IconName-Bold.svg
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            onChange={handleInput}
            {...({ webkitdirectory: "" } as object)}
          />
        </div>
      )}

      {parseError && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          {parseError}
        </p>
      )}

      {/* Preview */}
      {parsed && !result && (
        <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
                {parsed.categoryName}
                <span className="ml-2 font-mono font-normal text-xs text-ink-400 dark:text-ink-500">
                  {parsed.categorySlug}
                </span>
              </h2>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
                {parsed.icons.length} icon{parsed.icons.length !== 1 ? "s" : ""} ready to import
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={reset}
                disabled={isPending}
                className="h-9 px-4 rounded-xl border border-ink-200 dark:border-ink-700 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 disabled:opacity-50 transition-colors"
              >
                Change folder
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={isPending}
                className="h-9 px-5 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Importing…" : `Import ${parsed.icons.length} icons`}
              </button>
            </div>
          </div>

          <div className="border border-ink-100 dark:border-ink-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 dark:border-ink-700 bg-ink-50/60 dark:bg-ink-700/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-ink-500 dark:text-ink-400">Icon</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-ink-500 dark:text-ink-400">Slug</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-ink-500 dark:text-ink-400">Styles</th>
                </tr>
              </thead>
              <tbody>
                {parsed.icons.map((icon) => (
                  <tr key={icon.slug} className="border-t border-ink-50 dark:border-ink-700/40">
                    <td className="px-4 py-2.5 text-xs font-medium text-ink-900 dark:text-white">
                      {icon.name}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] font-mono text-ink-400 dark:text-ink-500">
                      {icon.slug}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-0.5">
                        {STYLES.map((s) => {
                          const has = icon.variants.some((v) => v.style === s);
                          return (
                            <span
                              key={s}
                              title={s}
                              className={
                                "text-[10px] px-1.5 py-0.5 rounded " +
                                (has
                                  ? "bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
                                  : "text-ink-300 dark:text-ink-600")
                              }
                            >
                              {STYLE_SHORT[s]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsed.skipped.length > 0 && (
            <p className="text-xs text-ink-400 dark:text-ink-500">
              <span className="font-medium">{parsed.skipped.length} SVG file{parsed.skipped.length !== 1 ? "s" : ""} skipped</span>
              {" "}(no style suffix in filename):{" "}
              {parsed.skipped.slice(0, 3).join(", ")}
              {parsed.skipped.length > 3 ? ` +${parsed.skipped.length - 3} more` : ""}
            </p>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Import complete</h2>

          <div className="flex gap-6">
            <div>
              <div className="text-3xl font-semibold text-ink-900 dark:text-white tabular-nums">{result.created}</div>
              <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">created</div>
            </div>
            {result.skipped.length > 0 && (
              <div>
                <div className="text-3xl font-semibold text-ink-400 dark:text-ink-500 tabular-nums">{result.skipped.length}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">skipped (slug exists)</div>
              </div>
            )}
            {result.errors.length > 0 && (
              <div>
                <div className="text-3xl font-semibold text-red-600 dark:text-red-400 tabular-nums">{result.errors.length}</div>
                <div className="text-xs text-red-500 dark:text-red-400 mt-0.5">errors</div>
              </div>
            )}
          </div>

          {result.errors.length > 0 && (
            <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}

          {result.skipped.length > 0 && (
            <p className="text-xs text-ink-400 dark:text-ink-500">
              Skipped: {result.skipped.join(", ")}
            </p>
          )}

          <div className="flex items-center gap-3">
            <a
              href="/admin/icons"
              className="h-9 px-5 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors inline-flex items-center"
            >
              View icons
            </a>
            <button
              type="button"
              onClick={reset}
              className="h-9 px-4 rounded-xl border border-ink-200 dark:border-ink-700 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors"
            >
              Upload another folder
            </button>
          </div>
        </div>
      )}

      <div>
        <a
          href="/admin/icons"
          className="text-sm text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white transition-colors"
        >
          ← Back to icons
        </a>
      </div>

    </div>
  );
}
