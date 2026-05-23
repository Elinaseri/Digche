"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IconBodies, IconMeta, IconStyle, Manifest } from "@/lib/types";
import { canDownloadIcon } from "@/lib/access";
import { useTheme } from "@/lib/theme";
import { useSelection } from "@/hooks/useSelection";
import { useIconDownloads } from "@/hooks/useIconDownloads";
import type { ExportOptions, IconExportInput } from "@/lib/export-engine";
import IconDetail from "./IconDetail";
import IconTile from "./IconTile";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";

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
  const selection = useSelection();
  const downloads = useIconDownloads();

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
        icon.slug.includes(q)
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

  // Selected, downloadable (non-premium) icons as export inputs.
  const selectedInputs = useMemo(() => {
    return manifest.icons
      .filter((i) => selection.isSelected(i.slug) && canDownloadIcon(i))
      .map(buildInput)
      .filter((x): x is IconExportInput => x !== null);
  }, [manifest.icons, selection, buildInput]);

  const downloadSelectedZip = useCallback(() => {
    void downloads.zipMany(selectedInputs, exportOpts);
  }, [downloads, selectedInputs, exportOpts]);

  const downloadEntirePack = useCallback(() => {
    const inputs = manifest.icons
      .filter(canDownloadIcon)
      .map(buildInput)
      .filter((x): x is IconExportInput => x !== null);
    void downloads.zipMany(inputs, exportOpts, ["svg"]);
  }, [downloads, manifest.icons, buildInput, exportOpts]);

  // close detail with Esc
  useEffect(() => {
    if (!activeIcon) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIcon(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIcon]);

  return (
    <div className="min-h-screen flex flex-col">
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
        selectionCount={selection.count}
        onClearSelection={selection.clear}
        onDownloadSelected={downloadSelectedZip}
        onDownloadEntirePack={downloadEntirePack}
      />

      <div className="flex-1 flex">
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

        <main className="flex-1 min-w-0 px-5 py-6 md:px-8">
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
                  onToggleSelect={() => selection.toggle(icon.slug)}
                  onOpen={() => setActiveIcon(icon)}
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
          selectionCount={selection.count}
          onDownloadSelected={downloadSelectedZip}
          onClose={() => setActiveIcon(null)}
        />
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
