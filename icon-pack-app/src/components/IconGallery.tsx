"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IconBodies, IconMeta, IconStyle, Manifest } from "@/lib/types";
import { canDownloadIcon } from "@/lib/access";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useSelection } from "@/hooks/useSelection";
import { useIconDownloads } from "@/hooks/useIconDownloads";
import type { ExportOptions, IconExportInput } from "@/lib/export-engine";
import IconDetail from "./IconDetail";
import IconTile from "./IconTile";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import UserNavBar from "./UserNavBar";

const STYLES: IconStyle[] = ["Bold", "Bulk", "Linear", "Outline"];
const SIZE_OPTIONS = [16, 20, 24, 32, 48];

interface Props {
  manifest: Manifest;
  bodies: IconBodies;
}

export default function IconGallery({ manifest, bodies }: Props) {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<IconStyle>("Linear");
  const [size, setSize] = useState<number>(24);
  const [color, setColor] = useState("#0F0F12");
  const [colorTouched, setColorTouched] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [activeIcon, setActiveIcon] = useState<IconMeta | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { theme } = useTheme();
  const { user, plan } = useAuth();
  const selection = useSelection();
  const downloads = useIconDownloads();
  const lastOpenedSlugRef = useRef<string | null>(null);

  // Until the user picks a color, keep icons legible by following the theme.
  useEffect(() => {
    if (!colorTouched) setColor(theme === "dark" ? "#E5E7EB" : "#0F0F12");
  }, [theme, colorTouched]);

  const handleColorChange = useCallback((c: string) => {
    setColorTouched(true);
    setColor(c);
  }, []);

  const exportOpts: ExportOptions = useMemo(
    () => ({ size, color }),
    [size, color]
  );

  const categories = useMemo(() => {
    const map = new Map<string, { slug: string; label: string; count: number }>();
    for (const slug of Object.keys(manifest.categories)) {
      map.set(slug, { slug, label: manifest.categories[slug], count: 0 });
    }
    for (const icon of manifest.icons) {
      const entry = map.get(icon.categorySlug);
      if (entry) entry.count += 1;
    }
    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [manifest]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return manifest.icons.filter((icon) => {
      if (category && icon.categorySlug !== category) return false;
      if (!icon.availableStyles.includes(style)) return false;
      if (!q) return true;
      return (
        icon.name.toLowerCase().includes(q) ||
        icon.category.toLowerCase().includes(q) ||
        icon.slug.includes(q) ||
        (icon.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [manifest, query, style, category]);

  // Build a downloadable input for a meta in the chosen style (falls back to
  // the first available style if the active one is missing).
  const buildInput = useCallback(
    (meta: IconMeta): IconExportInput | null => {
      const useStyle = meta.availableStyles.includes(style)
        ? style
        : meta.availableStyles[0];
      const svg = bodies[meta.slug]?.[useStyle];
      if (!svg) return null;
      return { slug: meta.slug, name: meta.name, style: useStyle, svg };
    },
    [style, bodies]
  );

  // Selected, downloadable icons as export inputs (respects user plan).
  const selectedInputs = useMemo(() => {
    return manifest.icons
      .filter((i) => selection.isSelected(i.slug) && canDownloadIcon(i, user, plan))
      .map(buildInput)
      .filter((x): x is IconExportInput => x !== null);
  }, [manifest.icons, selection, buildInput]);

  const downloadSelectedZip = useCallback(() => {
    void downloads.zipMany(selectedInputs, exportOpts).then(() => selection.clear());
  }, [downloads, selectedInputs, exportOpts, selection]);

  const handleOpenIcon = useCallback((icon: IconMeta) => {
    lastOpenedSlugRef.current = icon.slug;
    setActiveIcon(icon);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setActiveIcon(null);
    const slug = lastOpenedSlugRef.current;
    if (slug) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-icon-open="${slug}"]`)?.focus();
      });
    }
  }, []);

  const downloadEntirePack = useCallback(() => {
    const inputs = manifest.icons
      .filter((i) => canDownloadIcon(i, user, plan))
      .map(buildInput)
      .filter((x): x is IconExportInput => x !== null);
    void downloads.zipMany(inputs, exportOpts, ["svg"]);
  }, [downloads, manifest.icons, buildInput, exportOpts]);

  // close detail with Esc and return focus to the originating tile
  useEffect(() => {
    if (!activeIcon) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIcon, handleCloseDetail]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <UserNavBar />
      <Toolbar
        query={query}
        onQueryChange={setQuery}
        style={style}
        onStyleChange={setStyle}
        size={size}
        onSizeChange={setSize}
        color={color}
        onColorChange={handleColorChange}
        sizeOptions={SIZE_OPTIONS}
        styles={STYLES}
        totalShown={filtered.length}
        total={manifest.total}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onDownloadEntirePack={downloadEntirePack}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          categories={categories}
          active={category}
          total={manifest.total}
          onSelect={(slug) => {
            setCategory(slug);
            setSidebarOpen(false);
          }}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main
          id="main-content"
          className={
            "flex-1 min-w-0 px-5 py-6 md:px-8 overflow-y-auto " +
            (selection.count > 0 ? "pb-24" : "")
          }
        >
          {filtered.length === 0 ? (
            <EmptyState query={query} style={style} />
          ) : (
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
              }}
            >
              {filtered.map((icon) => (
                <IconTile
                  key={`${icon.categorySlug}/${icon.slug}`}
                  icon={icon}
                  body={bodies[icon.slug]?.[style] ?? ""}
                  size={size}
                  color={color}
                  selected={selection.isSelected(icon.slug)}
                  anySelected={selection.count > 0}
                  onToggleSelect={() => selection.toggle(icon.slug)}
                  onOpen={() => handleOpenIcon(icon)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {activeIcon && (
        <IconDetail
          icon={activeIcon}
          bodies={bodies[activeIcon.slug] ?? {}}
          initialStyle={style}
          initialSize={size}
          initialColor={color}
          sizeOptions={SIZE_OPTIONS}
          styles={STYLES}
          onClose={handleCloseDetail}
        />
      )}

      {selection.count > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-ink-900/95 backdrop-blur border-t border-ink-200 dark:border-ink-700 px-5 md:px-8 py-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink-900 dark:text-white">
            {selection.count} {selection.count === 1 ? "icon" : "icons"} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={selection.clear}
              className="text-sm text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white active:text-ink-900 dark:active:text-white"
            >
              Deselect all
            </button>
            <button
              onClick={downloadSelectedZip}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 active:bg-ink-800 dark:active:bg-ink-200"
            >
              Download ZIP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ query, style }: { query: string; style: IconStyle }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-ink-100 dark:bg-ink-800 grid place-items-center mb-4 text-ink-400">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </div>
      <p className="text-ink-700 dark:text-ink-200 font-medium">
        No icons match your search
      </p>
      <p className="text-ink-500 text-sm mt-1">
        {query
          ? `Nothing found for "${query}" in ${style}.`
          : `No ${style} icons in this category.`}
      </p>
    </div>
  );
}
