"use client";

import { useState, useMemo, useEffect } from "react";
import type { AdminIcon } from "@/lib/domain/types";
import IconActions from "./IconActions";

type StatusFilter = "all" | "published" | "draft";

function StatusBadge({ status }: { status: AdminIcon["status"] }) {
  return (
    <span
      className={
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium " +
        (status === "published"
          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-400")
      }
    >
      {status}
    </span>
  );
}

function IconPreview({ icon }: { icon: AdminIcon }) {
  const variant =
    icon.variants.find((v) => v.style === "Linear") ??
    icon.variants.find((v) => v.style === "Outline") ??
    icon.variants[0];

  if (!variant) {
    return (
      <div className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-700 flex items-center justify-center shrink-0">
        <span className="text-[9px] text-ink-400">–</span>
      </div>
    );
  }

  return (
    <div
      className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-700 flex items-center justify-center shrink-0 text-ink-600 dark:text-ink-300"
      dangerouslySetInnerHTML={{ __html: variant.svgBody }}
      style={{ fontSize: 0 }}
    />
  );
}

interface Props {
  icons: AdminIcon[];
}

export default function AdminIconsClient({ icons }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(icons.map((i) => i.categorySlug))
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return icons.filter((icon) => {
      if (statusFilter !== "all" && icon.status !== statusFilter) return false;
      if (!q) return true;
      return (
        icon.name.toLowerCase().includes(q) ||
        icon.slug.includes(q) ||
        icon.category.toLowerCase().includes(q) ||
        icon.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [icons, query, statusFilter]);

  // Auto-expand all categories that have results when searching
  useEffect(() => {
    if (query.trim()) {
      const matchingSlugs = new Set(filtered.map((i) => i.categorySlug));
      setOpenCategories(matchingSlugs);
    }
  }, [query, filtered]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; icons: AdminIcon[] }>();
    for (const icon of filtered) {
      if (!map.has(icon.categorySlug)) {
        map.set(icon.categorySlug, { label: icon.category, icons: [] });
      }
      map.get(icon.categorySlug)!.icons.push(icon);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[1].label.localeCompare(b[1].label)
    );
  }, [filtered]);

  function toggleCategory(slug: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleAll(open: boolean) {
    setOpenCategories(
      open ? new Set(grouped.map(([slug]) => slug)) : new Set()
    );
  }

  const allOpen = grouped.length > 0 && grouped.every(([slug]) => openCategories.has(slug));

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-500 pointer-events-none"
            viewBox="0 0 24 24" width="14" height="14" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons…"
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-sm text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-700 rounded-xl p-1">
          {(["all", "published", "draft"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                "h-7 px-3 rounded-lg text-xs font-medium transition-colors capitalize " +
                (statusFilter === s
                  ? "bg-white dark:bg-ink-600 text-ink-900 dark:text-white shadow-sm"
                  : "text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200")
              }
            >
              {s}
            </button>
          ))}
        </div>

        <span className="text-xs text-ink-400 dark:text-ink-500 tabular-nums shrink-0">
          {filtered.length} / {icons.length}
        </span>

        <button
          onClick={() => toggleAll(!allOpen)}
          className="ml-auto text-xs text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {/* Grouped table */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl px-6 py-12 text-center">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            No icons match your search.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  Icon
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-500 dark:text-ink-400 hidden md:table-cell">
                  Variants
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-medium text-ink-500 dark:text-ink-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(([slug, group]) => {
                const isOpen = openCategories.has(slug);
                return (
                  <>
                    {/* Category group header row */}
                    <tr
                      key={`cat-${slug}`}
                      onClick={() => toggleCategory(slug)}
                      className="border-t border-ink-100 dark:border-ink-700 first:border-t-0 bg-ink-50/60 dark:bg-ink-700/30 hover:bg-ink-100/60 dark:hover:bg-ink-700/50 cursor-pointer select-none transition-colors"
                    >
                      <td colSpan={4} className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <svg
                            viewBox="0 0 24 24" width="13" height="13" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                            strokeLinejoin="round"
                            className={
                              "shrink-0 text-ink-400 transition-transform duration-150 " +
                              (isOpen ? "rotate-90" : "")
                            }
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                          <span className="font-semibold text-xs text-ink-700 dark:text-ink-200 uppercase tracking-wide">
                            {group.label}
                          </span>
                          <span className="text-[11px] text-ink-400 dark:text-ink-500 tabular-nums">
                            {group.icons.length}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Icon rows */}
                    {isOpen && group.icons.map((icon) => (
                      <tr
                        key={icon.id}
                        className="border-t border-ink-50 dark:border-ink-700/40 hover:bg-ink-50/50 dark:hover:bg-ink-700/20 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <IconPreview icon={icon} />
                            <div>
                              <div className="font-medium text-ink-900 dark:text-white leading-tight">
                                {icon.name}
                              </div>
                              <div className="text-[11px] text-ink-400 dark:text-ink-500 font-mono leading-tight mt-0.5">
                                {icon.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-0.5">
                            {(["Bold", "Bulk", "Linear", "Outline"] as const).map((s) => {
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
                                  {s[0]}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={icon.status} />
                          {icon.isPremium && (
                            <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              premium
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <IconActions
                            icon={{ id: icon.id, slug: icon.slug, status: icon.status }}
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
