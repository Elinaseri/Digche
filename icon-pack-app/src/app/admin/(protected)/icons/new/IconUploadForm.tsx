"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SvgVariantSlot from "./SvgVariantSlot";
import { createIconAction } from "./actions";
import { slugify, toPascalCase } from "@/lib/svg-utils";

const STYLES = ["Bold", "Bulk", "Linear", "Outline"] as const;
type Style = (typeof STYLES)[number];

type Variants = Record<Style, string | null>;

const NEW_CATEGORY_VALUE = "__new__";

interface Props {
  categories: { name: string; slug: string }[];
}

export default function IconUploadForm({ categories }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);
  const [categorySelect, setCategorySelect] = useState(
    categories.length > 0 ? categories[0].slug : NEW_CATEGORY_VALUE
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [tags, setTags] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const isAddingNew = categorySelect === NEW_CATEGORY_VALUE;
  const resolvedCategory =
    localCategories.find((c) => c.slug === categorySelect)?.name ?? "";
  const resolvedCategorySlug = isAddingNew ? "" : categorySelect;

  function handleAddCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const slug = slugify(trimmed);
    if (!localCategories.find((c) => c.slug === slug)) {
      setLocalCategories((prev) => [...prev, { name: trimmed, slug }]);
    }
    setCategorySelect(slug);
    setNewCategoryName("");
  }

  const [variants, setVariants] = useState<Variants>({
    Bold: null,
    Bulk: null,
    Linear: null,
    Outline: null,
  });
  const [activeStyle, setActiveStyle] = useState<Style | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  function handleVariantChange(style: Style, content: string | null) {
    setVariants((prev) => ({ ...prev, [style]: content }));
  }

  const hasAtLeastOneVariant = Object.values(variants).some(Boolean);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Name is required."); return; }
    if (!slug.trim()) { setError("Slug is required."); return; }
    if (!resolvedCategory || isAddingNew) { setError("Category is required. Add a new one first."); return; }
    if (!hasAtLeastOneVariant) { setError("Upload at least one SVG variant."); return; }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("slug", slug.trim());
    formData.set("pascalName", toPascalCase(name));
    formData.set("category", resolvedCategory);
    formData.set("categorySlug", resolvedCategorySlug);
    formData.set("tags", tags.trim());
    formData.set("isPremium", String(isPremium));

    for (const style of STYLES) {
      if (variants[style]) formData.set(`variant_${style}`, variants[style]!);
    }

    startTransition(async () => {
      const result = await createIconAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin/icons");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-8">

        {/* ── Left column ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 max-w-2xl flex flex-col gap-8">

          {/* Metadata */}
          <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
              Metadata
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-700 dark:text-ink-300">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Arrow Right"
                  className="h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-700 dark:text-ink-300">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                  placeholder="arrow-right"
                  className="h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 font-mono focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-700 dark:text-ink-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categorySelect}
                  onChange={(e) => setCategorySelect(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
                >
                  {localCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                  <option value={NEW_CATEGORY_VALUE}>+ New category…</option>
                </select>
                {isAddingNew && (
                  <div className="flex gap-2">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); } }}
                      placeholder="Category name"
                      autoFocus
                      className="flex-1 h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="h-9 px-3 rounded-lg bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-xs font-medium hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
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
                  placeholder="arrow, direction, next"
                  className="h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
                />
              </div>
            </div>

            {/* Premium toggle */}
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
          </div>

          {/* SVG Variants */}
          <div className="flex-1 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
                SVG Variants
              </h2>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
                Upload at least one style. Click a tile to edit its code.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STYLES.map((style) => (
                <SvgVariantSlot
                  key={style}
                  style={style}
                  svgContent={variants[style]}
                  onChange={(content) => handleVariantChange(style, content)}
                  isSelected={activeStyle === style}
                  onSelect={() =>
                    setActiveStyle((prev) => (prev === style ? null : style))
                  }
                />
              ))}
            </div>
          </div>

        </div>

        {/* ── Right column: code editor ───────────────────────────── */}
        {activeStyle && (
          <div className="lg:w-80 xl:w-96 flex-shrink-0 flex flex-col">
            <div className="flex-1 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 flex flex-col gap-4">
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
                value={variants[activeStyle] ?? ""}
                onChange={(e) =>
                  setVariants((prev) => ({
                    ...prev,
                    [activeStyle]: e.target.value || null,
                  }))
                }
                className="flex-1 min-h-[120px] p-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900 text-xs font-mono text-ink-800 dark:text-ink-200 resize-none focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 leading-relaxed"
                placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  ...\n</svg>'}
                spellCheck={false}
              />
              <p className="text-[11px] text-ink-400 dark:text-ink-500">
                The preview updates as you type.
              </p>
            </div>
          </div>
        )}

      </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-5 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 active:bg-ink-800 dark:active:bg-ink-200 disabled:opacity-50 transition-colors"
          >
            {pending ? "Saving…" : "Save as Draft"}
          </button>
          <a
            href="/admin/icons"
            className="text-sm text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white transition-colors"
          >
            Cancel
          </a>
        </div>
      </div>
    </form>
  );
}
