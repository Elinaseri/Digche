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
  const [categorySelect, setCategorySelect] = useState(
    categories.length > 0 ? categories[0].slug : NEW_CATEGORY_VALUE
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [tags, setTags] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const isNewCategory = categorySelect === NEW_CATEGORY_VALUE;
  const resolvedCategory = isNewCategory
    ? newCategoryName.trim()
    : (categories.find((c) => c.slug === categorySelect)?.name ?? "");
  const resolvedCategorySlug = isNewCategory
    ? slugify(newCategoryName)
    : categorySelect;
  const [variants, setVariants] = useState<Variants>({
    Bold: null,
    Bulk: null,
    Linear: null,
    Outline: null,
  });
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

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }
    if (!resolvedCategory) {
      setError("Category is required.");
      return;
    }
    if (!hasAtLeastOneVariant) {
      setError("Upload at least one SVG variant.");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("slug", slug.trim());
    formData.set("pascalName", toPascalCase(name));
    formData.set("category", resolvedCategory);
    formData.set("categorySlug", resolvedCategorySlug);
    formData.set("tags", tags.trim());
    formData.set("isPremium", String(isPremium));

    for (const style of STYLES) {
      if (variants[style]) {
        formData.set(`variant_${style}`, variants[style]!);
      }
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
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
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
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
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
              <option value={NEW_CATEGORY_VALUE}>+ New category…</option>
            </select>
            {isNewCategory && (
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                autoFocus
                className="h-9 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
              />
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
      </div>

      {/* SVG Variants */}
      <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
            SVG Variants
          </h2>
          <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
            Upload at least one style. Files are normalized automatically.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STYLES.map((style) => (
            <SvgVariantSlot
              key={style}
              style={style}
              svgContent={variants[style]}
              onChange={(content) => handleVariantChange(style, content)}
            />
          ))}
        </div>
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
    </form>
  );
}
