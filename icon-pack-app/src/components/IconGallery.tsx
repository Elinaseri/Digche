"use client";

import { useMemo, useState, useEffect } from "react";
import type { IconBodies, IconMeta, IconStyle, Manifest } from "@/lib/types";
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
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<IconMeta | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // close detail with Esc
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

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
        onColorChange={setColor}
        sizeOptions={SIZE_OPTIONS}
        styles={STYLES}
        totalShown={filtered.length}
        total={manifest.total}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
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
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(96px, 1fr))",
              }}
            >
              {filtered.map((icon) => (
                <IconTile
                  key={`${icon.categorySlug}/${icon.slug}`}
                  icon={icon}
                  body={bodies[icon.slug]?.[style] ?? ""}
                  size={size}
                  color={color}
                  onClick={() => setSelected(icon)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {selected && (
        <IconDetail
          icon={selected}
          bodies={bodies[selected.slug] ?? {}}
          initialStyle={style}
          initialSize={size}
          initialColor={color}
          sizeOptions={SIZE_OPTIONS}
          styles={STYLES}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ query, style }: { query: string; style: IconStyle }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-ink-100 grid place-items-center mb-4 text-ink-400">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </div>
      <p className="text-ink-700 font-medium">No icons match your search</p>
      <p className="text-ink-500 text-sm mt-1">
        {query
          ? `Nothing found for "${query}" in ${style}.`
          : `No ${style} icons in this category.`}
      </p>
    </div>
  );
}
