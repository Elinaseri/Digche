"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SvgVariantSlot from "../../new/SvgVariantSlot";
import {
  updateIconAction,
  addVariantAction,
  removeVariantAction,
} from "./actions";
import { slugify } from "@/lib/svg-utils";
import type { AdminIcon, IconVariant, IconStyle } from "@/lib/domain/types";

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

  const existingVariants: Record<IconStyle, IconVariant | undefined> =
    Object.fromEntries(
      STYLES.map((s) => [s, icon.variants.find((v) => v.style === s)])
    ) as Record<IconStyle, IconVariant | undefined>;

  const [newVariants, setNewVariants] = useState<
    Record<IconStyle, string | null>
  >({ Bold: null, Bulk: null, Linear: null, Outline: null });
  const [variantError, setVariantError] = useState<string | null>(null);

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

  function handleUploadVariants(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setVariantError(null);
    const hasNew = STYLES.some((s) => newVariants[s]);
    if (!hasNew) {
      setVariantError("Select at least one SVG to upload.");
      return;
    }
    const fd = new FormData();
    for (const s of STYLES) {
      if (newVariants[s]) fd.set(`variant_${s}`, newVariants[s]!);
    }
    startTransition(async () => {
      const res = await addVariantAction(icon.id, icon.slug, fd);
      if (res.error) {
        setVariantError(res.error);
      } else {
        setNewVariants({ Bold: null, Bulk: null, Linear: null, Outline: null });
        router.refresh();
      }
    });
  }

  function handleRemoveVariant(variantId: string) {
    if (!confirm("Remove this variant?")) return;
    startTransition(async () => {
      await removeVariantAction(variantId, icon.id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8 max-w-2xl">
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
              <span className="text-ink-400 dark:text-ink-500 font-normal ml-1">
                read-only
              </span>
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
              <span className="text-ink-400 dark:text-ink-500 font-normal ml-1">
                comma-separated
              </span>
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
            <div
              className={
                "w-9 h-5 rounded-full transition-colors " +
                (isPremium
                  ? "bg-ink-900 dark:bg-white"
                  : "bg-ink-200 dark:bg-ink-700")
              }
            />
            <div
              className={
                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-ink-900 transition-transform shadow-sm " +
                (isPremium ? "translate-x-4" : "translate-x-0")
              }
            />
          </div>
          <span className="text-sm text-ink-700 dark:text-ink-300">
            Premium icon
          </span>
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

      {/* Variants */}
      <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
          SVG Variants
        </h2>

        {/* Existing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STYLES.map((style) => {
            const existing = existingVariants[style];
            return (
              <div key={style} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-700 dark:text-ink-300">
                    {style}
                  </span>
                  {existing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(existing.id)}
                      disabled={pending}
                      className="text-[11px] text-red-500 dark:text-red-400 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {existing ? (
                  <div
                    className="h-24 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900/50 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: existing.svgBody }}
                  />
                ) : (
                  <div className="h-24 rounded-xl border-2 border-dashed border-ink-200 dark:border-ink-700 flex items-center justify-center">
                    <span className="text-[11px] text-ink-400 dark:text-ink-500">
                      Missing
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload missing */}
        {STYLES.some((s) => !existingVariants[s]) && (
          <form onSubmit={handleUploadVariants} className="space-y-4 pt-2 border-t border-ink-100 dark:border-ink-700">
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Upload missing styles:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STYLES.filter((s) => !existingVariants[s]).map((style) => (
                <SvgVariantSlot
                  key={style}
                  style={style}
                  svgContent={newVariants[style]}
                  onChange={(c) =>
                    setNewVariants((prev) => ({ ...prev, [style]: c }))
                  }
                />
              ))}
            </div>
            {variantError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {variantError}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="h-9 px-5 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 disabled:opacity-50 transition-colors"
            >
              {pending ? "Uploading…" : "Upload variants"}
            </button>
          </form>
        )}
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
  );
}
