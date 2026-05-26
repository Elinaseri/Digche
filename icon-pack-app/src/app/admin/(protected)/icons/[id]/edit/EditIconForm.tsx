"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateIconAction,
  addVariantAction,
  removeVariantAction,
} from "./actions";
import type { AdminIcon, IconStyle } from "@/lib/domain/types";

const STYLES: IconStyle[] = ["Bold", "Bulk", "Linear", "Outline"];

interface Props {
  icon: AdminIcon;
}

export default function EditIconForm({ icon }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(icon.name);
  const [category, setCategory] = useState(icon.category);
  const [tags, setTags] = useState(icon.tags.join(", "));
  const [isPremium, setIsPremium] = useState(icon.isPremium);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaSaved, setMetaSaved] = useState(false);

  const [activeStyle, setActiveStyle] = useState<IconStyle | null>(null);
  const [pendingCode, setPendingCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [draggingStyle, setDraggingStyle] = useState<IconStyle | null>(null);

  const existingVariants: Record<IconStyle, { id: string; svgBody: string } | undefined> =
    Object.fromEntries(
      STYLES.map((s) => [s, icon.variants.find((v) => v.style === s)])
    ) as Record<IconStyle, { id: string; svgBody: string } | undefined>;

  // Local overrides: updated after code edits so the tile preview reflects the change before refresh
  const [localPreviews, setLocalPreviews] = useState<Partial<Record<IconStyle, string | null>>>({});

  function getTileContent(style: IconStyle): string | null {
    if (localPreviews[style] !== undefined) return localPreviews[style] ?? null;
    return existingVariants[style]?.svgBody ?? null;
  }

  function openEditor(style: IconStyle) {
    if (activeStyle === style) {
      setActiveStyle(null);
      return;
    }
    const current =
      localPreviews[style] !== undefined
        ? (localPreviews[style] ?? "")
        : (existingVariants[style]?.svgBody ?? "");
    setActiveStyle(style);
    setPendingCode(current);
    setCodeError(null);
  }

  function handleSaveMeta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMetaError(null);
    setMetaSaved(false);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("category", category);
    fd.set("tags", tags);
    fd.set("isPremium", String(isPremium));
    startTransition(async () => {
      const res = await updateIconAction(icon.id, fd);
      if (res.error) {
        setMetaError(res.error);
      } else {
        setMetaSaved(true);
        router.refresh();
      }
    });
  }

  function handleApplyCode() {
    if (!activeStyle) return;
    const code = pendingCode.trim();
    if (!code) { setCodeError("SVG code cannot be empty."); return; }
    if (!/<svg[\s>]/i.test(code)) { setCodeError("This doesn't look like an SVG."); return; }
    setCodeError(null);
    const fd = new FormData();
    fd.set(`variant_${activeStyle}`, code);
    startTransition(async () => {
      const res = await addVariantAction(icon.id, icon.slug, fd);
      if (res.error) {
        setCodeError(res.error);
      } else {
        setLocalPreviews((prev) => ({ ...prev, [activeStyle!]: code }));
        setActiveStyle(null);
        router.refresh();
      }
    });
  }

  async function handleDropFile(style: IconStyle, file: File) {
    if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") return;
    if (file.size > 100 * 1024) return;
    const text = await file.text();
    if (!/<svg[\s>]/i.test(text)) return;
    const fd = new FormData();
    fd.set(`variant_${style}`, text);
    startTransition(async () => {
      const res = await addVariantAction(icon.id, icon.slug, fd);
      if (!res.error) {
        setLocalPreviews((prev) => ({ ...prev, [style]: text }));
        router.refresh();
      }
    });
  }

  function handleRemoveVariant(variantId: string, style: IconStyle) {
    if (!confirm("Remove this variant?")) return;
    startTransition(async () => {
      await removeVariantAction(variantId, icon.id);
      setLocalPreviews((prev) => ({ ...prev, [style]: null }));
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-8">

      {/* ── Left column ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-8">

        {/* Metadata */}
        <form
          onSubmit={handleSaveMeta}
          className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
            Metadata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-700 dark:text-ink-300">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-700 dark:text-ink-300">
                Slug
                <span className="text-ink-400 dark:text-ink-500 font-normal ml-1">read-only</span>
              </label>
              <input
                value={icon.slug}
                readOnly
                className="h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900/50 text-sm text-ink-500 dark:text-ink-400 font-mono cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-700 dark:text-ink-300">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-700 dark:text-ink-300">
                Tags
                <span className="text-ink-400 dark:text-ink-500 font-normal ml-1">comma-separated</span>
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
              />
              <div className={"w-9 h-5 rounded-full transition-colors " + (isPremium ? "bg-ink-900 dark:bg-white" : "bg-ink-200 dark:bg-ink-700")} />
              <div className={"absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-ink-900 transition-transform shadow-sm " + (isPremium ? "translate-x-4" : "translate-x-0")} />
            </div>
            <span className="text-sm text-ink-700 dark:text-ink-300">Premium icon</span>
          </label>

          {metaError && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {metaError}
            </p>
          )}
          {metaSaved && (
            <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
              Saved.
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-9 px-5 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 disabled:opacity-50 transition-colors"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>

        {/* SVG Variants */}
        <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
              SVG Variants
            </h2>
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
              Click a tile to view or edit its SVG code.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STYLES.map((style) => {
              const existing = existingVariants[style];
              const tileContent = getTileContent(style);
              return (
                <div key={style} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-700 dark:text-ink-300">
                      {style}
                    </span>
                    {existing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(existing.id, style)}
                        disabled={pending}
                        className="text-[11px] text-red-500 dark:text-red-400 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {tileContent ? (
                    <div
                      className={
                        "h-24 rounded-xl border bg-ink-50 dark:bg-ink-900/50 flex items-center justify-center cursor-pointer p-2 transition-all " +
                        (draggingStyle === style
                          ? "border-ink-400 bg-ink-100 dark:bg-ink-800"
                          : activeStyle === style
                          ? "border-ink-900 dark:border-white ring-2 ring-ink-900/10 dark:ring-white/10"
                          : "border-ink-200 dark:border-ink-700 hover:border-ink-400 dark:hover:border-ink-500")
                      }
                      onClick={() => openEditor(style)}
                      onDragOver={(e) => { e.preventDefault(); setDraggingStyle(style); }}
                      onDragLeave={() => setDraggingStyle(null)}
                      onDrop={(e) => { e.preventDefault(); setDraggingStyle(null); const f = e.dataTransfer.files[0]; if (f) handleDropFile(style, f); }}
                      title="Click to edit code"
                      dangerouslySetInnerHTML={{ __html: tileContent }}
                      style={{ color: "currentColor" }}
                    />
                  ) : (
                    <div
                      className={
                        "h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors " +
                        (draggingStyle === style
                          ? "border-ink-400 bg-ink-50 dark:bg-ink-800"
                          : activeStyle === style
                          ? "border-ink-900 dark:border-white bg-ink-50 dark:bg-ink-800/50"
                          : "border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600")
                      }
                      onClick={() => openEditor(style)}
                      onDragOver={(e) => { e.preventDefault(); setDraggingStyle(style); }}
                      onDragLeave={() => setDraggingStyle(null)}
                      onDrop={(e) => { e.preventDefault(); setDraggingStyle(null); const f = e.dataTransfer.files[0]; if (f) handleDropFile(style, f); }}
                    >
                      <span className="text-[11px] text-ink-400 dark:text-ink-500">
                        Missing
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin/icons"
            className="text-sm text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white transition-colors"
          >
            ← Back to icons
          </a>
        </div>
      </div>

      {/* ── Right column: code editor ───────────────────────────── */}
      {activeStyle && (
        <div className="lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-8">
          <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
                {activeStyle} — SVG code
              </h2>
              <button
                type="button"
                onClick={() => setActiveStyle(null)}
                className="text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
              >
                Close
              </button>
            </div>
            <textarea
              value={pendingCode}
              onChange={(e) => setPendingCode(e.target.value)}
              className="w-full min-h-[260px] p-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-xs font-mono text-ink-800 dark:text-ink-200 resize-y focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 leading-relaxed"
              placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  ...\n</svg>'}
              spellCheck={false}
            />
            {codeError && (
              <p className="text-[11px] text-red-600 dark:text-red-400">{codeError}</p>
            )}
            <button
              type="button"
              onClick={handleApplyCode}
              disabled={pending}
              className="self-start h-8 px-4 rounded-lg bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-xs font-medium hover:bg-ink-700 dark:hover:bg-ink-100 disabled:opacity-50 transition-colors"
            >
              {pending ? "Saving…" : "Apply & save"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
