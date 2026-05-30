"use client";

import { useRef, useState, useEffect } from "react";
import { normalizeIconName } from "@/lib/svg-utils";
import { createOneIconAction, finalizeImportAction } from "./actions";
import type { IconStyle } from "@/lib/domain/types";

const STYLES: IconStyle[] = ["Bold", "Bulk", "Linear", "Outline"];
const STYLE_SHORT: Record<IconStyle, string> = { Bold: "B", Bulk: "Bk", Linear: "L", Outline: "O" };

// ── Folder reading ────────────────────────────────────────────────────────────

interface FileWithPath { file: File; path: string; }

function getFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((res, rej) => entry.file(res, rej));
}

async function readDir(dir: FileSystemDirectoryEntry, base: string): Promise<FileWithPath[]> {
  const result: FileWithPath[] = [];
  const reader = dir.createReader();
  let batch: FileSystemEntry[];
  // readEntries() returns at most 100 entries per call; loop until empty
  do {
    batch = await new Promise<FileSystemEntry[]>((res, rej) => reader.readEntries(res, rej));
    for (const entry of batch) {
      const path = `${base}/${entry.name}`;
      if (entry.isFile) {
        result.push({ file: await getFile(entry as FileSystemFileEntry), path });
      } else if (entry.isDirectory) {
        result.push(...await readDir(entry as FileSystemDirectoryEntry, path));
      }
    }
  } while (batch.length > 0);
  return result;
}

async function fromDataTransfer(items: DataTransferItemList): Promise<FileWithPath[]> {
  const result: FileWithPath[] = [];
  for (const item of Array.from(items)) {
    const entry = item.webkitGetAsEntry?.();
    if (!entry) continue;
    if (entry.isDirectory) {
      result.push(...await readDir(entry as FileSystemDirectoryEntry, entry.name));
    } else if (entry.isFile) {
      result.push({ file: await getFile(entry as FileSystemFileEntry), path: entry.name });
    }
  }
  return result;
}

function fromFileList(list: FileList): FileWithPath[] {
  return Array.from(list).map((f) => ({ file: f, path: f.webkitRelativePath || f.name }));
}

// ── Parsing ───────────────────────────────────────────────────────────────────

interface ParsedVariant { style: IconStyle; svgContent: string; }
interface ParsedIcon {
  originalName: string; name: string; slug: string; pascalName: string;
  nameChanged: boolean; variants: ParsedVariant[];
}
interface ParseResult {
  originalCategoryName: string; categoryName: string; categorySlug: string;
  categoryChanged: boolean; icons: ParsedIcon[]; skipped: string[];
  samplePaths: string[];
}

async function parseEntries(entries: FileWithPath[]): Promise<ParseResult> {
  const iconMap = new Map<string, ParsedVariant[]>();
  let rawCategoryName = "";
  const skipped: string[] = [];
  const samplePaths = entries.slice(0, 6).map((e) => e.path);

  for (const { file, path } of entries) {
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 2) continue;

    const isThreeLevel = parts.length >= 3;
    if (!rawCategoryName && isThreeLevel) rawCategoryName = parts[0];

    const iconFolder = isThreeLevel ? parts[parts.length - 2] : parts[0];
    const filename = parts[parts.length - 1];

    // Match: Bold.svg / Arrow-Bold.svg / Arrow_Bold.svg / Arrow Bold.svg
    const match = filename.match(/(?:^|[-_\s])(Bold|Bulk|Linear|Outline)\.svg$/i);

    if (!match) {
      if (!filename.startsWith(".") && filename.toLowerCase().endsWith(".svg")) {
        skipped.push(path);
      }
      continue;
    }

    const style = STYLES.find((s) => s.toLowerCase() === match[1].toLowerCase())!;
    const content = await file.text();
    if (!iconMap.has(iconFolder)) iconMap.set(iconFolder, []);
    iconMap.get(iconFolder)!.push({ style, svgContent: content });
  }

  const cat = normalizeIconName(rawCategoryName || (entries[0]?.path.split("/")[0] ?? ""));

  const icons: ParsedIcon[] = Array.from(iconMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([original, variants]) => {
      const n = normalizeIconName(original);
      return {
        originalName: original, name: n.name, slug: n.slug,
        pascalName: n.name.replace(/\s+/g, ""), nameChanged: n.changed, variants,
      };
    });

  return {
    originalCategoryName: rawCategoryName,
    categoryName: cat.name, categorySlug: cat.slug, categoryChanged: cat.changed,
    icons, skipped, samplePaths,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ImportProgress { total: number; done: number; current: string; }
interface ImportResult { created: number; skipped: string[]; errors: string[]; }

export default function BulkUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [samplePaths, setSamplePaths] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragging, setDragging] = useState(false);

  // webkitdirectory is non-standard; set it imperatively to avoid TS errors
  useEffect(() => {
    inputRef.current?.setAttribute("webkitdirectory", "");
  }, []);

  async function process(entries: FileWithPath[]) {
    setIsParsing(true);
    setParseError(null);
    setSamplePaths([]);
    setParsed(null);
    setResult(null);
    setProgress(null);
    try {
      const r = await parseEntries(entries);
      setSamplePaths(r.samplePaths);
      if (r.icons.length === 0) {
        setParseError(
          r.samplePaths.length === 0
            ? "No files found. Make sure you selected a folder (not individual files)."
            : "No icons found. SVG files must contain a style name in the filename: Bold, Bulk, Linear, or Outline."
        );
        return;
      }
      setParsed(r);
    } catch (e) {
      setParseError("Failed to read folder: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsParsing(false);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) process(fromFileList(e.target.files));
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const entries = await fromDataTransfer(e.dataTransfer.items);
    if (entries.length > 0) process(entries);
  }

  async function handleImport() {
    if (!parsed || isImporting) return;
    setIsImporting(true);
    let created = 0;
    const skipped: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < parsed.icons.length; i++) {
      const icon = parsed.icons[i];
      setProgress({ total: parsed.icons.length, done: i, current: icon.name });
      const res = await createOneIconAction({
        name: icon.name, slug: icon.slug, pascalName: icon.pascalName,
        category: parsed.categoryName, categorySlug: parsed.categorySlug,
        variants: icon.variants,
      });
      if (res.error === "slug_exists") skipped.push(icon.name);
      else if (res.error) errors.push(`${icon.name}: ${res.error}`);
      else created++;
    }

    setProgress({ total: parsed.icons.length, done: parsed.icons.length, current: "" });
    await finalizeImportAction();
    setIsImporting(false);
    setProgress(null);
    setResult({ created, skipped, errors });
  }

  function reset() {
    setParsed(null); setResult(null); setParseError(null);
    setSamplePaths([]); setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const renamedCount = parsed?.icons.filter((i) => i.nameChanged).length ?? 0;
  const progressPct = progress ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="max-w-3xl space-y-6">

      {/* Dropzone */}
      {!parsed && !result && (
        <div
          onClick={() => !isParsing && inputRef.current?.click()}
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
                <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Drop a category folder here</p>
                <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">or click to browse</p>
              </div>
              <p className="text-[11px] text-ink-300 dark:text-ink-600 font-mono">
                CategoryName / IconName / IconName-Bold.svg
              </p>
            </>
          )}
          <input ref={inputRef} type="file" className="sr-only" onChange={handleInput} />
        </div>
      )}

      {parseError && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 space-y-2">
          <p>{parseError}</p>
          {samplePaths.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Paths detected in your folder:</p>
              <ul className="text-[11px] font-mono space-y-0.5">
                {samplePaths.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          <button type="button" onClick={reset} className="text-xs underline">Try again</button>
        </div>
      )}

      {/* Progress */}
      {isImporting && progress && (
        <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-500 dark:text-ink-400">
              {progress.done < progress.total
                ? <>Importing <span className="font-medium text-ink-700 dark:text-ink-200">{progress.current}</span>…</>
                : <span className="text-ink-700 dark:text-ink-200">Finishing up…</span>}
            </span>
            <span className="tabular-nums font-medium text-ink-500 dark:text-ink-400">{progress.done} / {progress.total}</span>
          </div>
          <div className="h-2 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
            <div className="h-full bg-ink-900 dark:bg-white rounded-full transition-all duration-200" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[11px] text-ink-400 dark:text-ink-500">{progressPct}% complete</p>
        </div>
      )}

      {/* Preview */}
      {parsed && !result && !isImporting && (
        <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-white flex items-center gap-2 flex-wrap">
                {parsed.categoryName}
                <span className="font-mono font-normal text-xs text-ink-400 dark:text-ink-500">{parsed.categorySlug}</span>
                {parsed.categoryChanged && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-normal">
                    was: {parsed.originalCategoryName}
                  </span>
                )}
              </h2>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
                {parsed.icons.length} icon{parsed.icons.length !== 1 ? "s" : ""}
                {renamedCount > 0 && <span className="ml-2 text-amber-600 dark:text-amber-400">· {renamedCount} name{renamedCount !== 1 ? "s" : ""} normalized</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={reset}
                className="h-9 px-4 rounded-xl border border-ink-200 dark:border-ink-700 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors">
                Change folder
              </button>
              <button type="button" onClick={handleImport}
                className="h-9 px-5 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors">
                Import {parsed.icons.length} icons
              </button>
            </div>
          </div>

          <div className="border border-ink-100 dark:border-ink-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 dark:border-ink-700 bg-ink-50/60 dark:bg-ink-700/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-ink-500 dark:text-ink-400">Icon name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-ink-500 dark:text-ink-400">Slug</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-ink-500 dark:text-ink-400">Styles</th>
                </tr>
              </thead>
              <tbody>
                {parsed.icons.map((icon) => (
                  <tr key={icon.slug} className="border-t border-ink-50 dark:border-ink-700/40">
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-medium text-ink-900 dark:text-white">{icon.name}</div>
                      {icon.nameChanged && <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">was: {icon.originalName}</div>}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] font-mono text-ink-400 dark:text-ink-500">{icon.slug}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-0.5">
                        {STYLES.map((s) => {
                          const has = icon.variants.some((v) => v.style === s);
                          return (
                            <span key={s} title={s} className={"text-[10px] px-1.5 py-0.5 rounded " + (has ? "bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300" : "text-ink-300 dark:text-ink-600")}>
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
              <span className="font-medium">{parsed.skipped.length} file{parsed.skipped.length !== 1 ? "s" : ""} skipped</span> (no style suffix):{" "}
              {parsed.skipped.slice(0, 3).join(", ")}{parsed.skipped.length > 3 ? ` +${parsed.skipped.length - 3} more` : ""}
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
          {result.skipped.length > 0 && <p className="text-xs text-ink-400 dark:text-ink-500">Skipped: {result.skipped.join(", ")}</p>}
          <div className="flex items-center gap-3">
            <a href="/admin/icons" className="h-9 px-5 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors inline-flex items-center">
              View icons
            </a>
            <button type="button" onClick={reset} className="h-9 px-4 rounded-xl border border-ink-200 dark:border-ink-700 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors">
              Upload another folder
            </button>
          </div>
        </div>
      )}

      <div>
        <a href="/admin/icons" className="text-sm text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white transition-colors">
          ← Back to icons
        </a>
      </div>
    </div>
  );
}
