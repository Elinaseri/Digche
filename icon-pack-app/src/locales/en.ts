// English UI strings — the canonical source of truth for translation keys.
// Icon names, style names, code snippets and technical formats
// (SVG / PNG / JPEG / JSX / CSS / ZIP) are intentionally NOT included here.
export const en = {
  // Toolbar
  "search.placeholder": "Search icons...",
  "nav.toggleCategories": "Toggle categories",
  download: "Download",
  "bulk.aria": "Bulk download options",
  "bulk.selectedZip.label": "Download selected icons as ZIP",
  "bulk.selectedZip.count": "{n} selected",
  "bulk.selectedZip.empty": "No icons selected",
  "bulk.entirePack.label": "Download entire pack",
  "bulk.entirePack.desc": "All icons · current style · SVG",
  "selection.selected": "selected",
  "selection.clear": "Clear selection",
  "selection.bar.count": "{n} icons selected",
  "selection.bar.download": "Download ZIP",
  "selection.bar.clear": "Deselect all",
  "skipToContent": "Skip to icons",

  // Sidebar
  "sidebar.categories": "Categories",
  "sidebar.allIcons": "All icons",
  "sidebar.tips": "Tips",
  "sidebar.tip.open": "Click an icon for code & downloads",
  "sidebar.tip.select": "Hover an icon to select it for ZIP",
  "sidebar.tip.esc": "to close",

  // Empty state
  "empty.title": "No icons match your search",
  "empty.query": 'Nothing found for "{query}" in {style}.',
  "empty.category": "No {style} icons in this category.",

  // Detail panel
  "detail.close": "Close",
  "detail.locked": "Locked",
  "control.style": "Style",
  "control.size": "Size",
  "control.color": "Color",
  "detail.downloadAria": "Download {name}",
  "detail.copy": "Copy {tab}",
  "detail.copied": "Copied!",

  // Download menu items
  "item.svg.label": "Download as SVG",
  "item.svg.desc": "For design tools & web (Figma, code)",
  "item.png.label": "Download as PNG",
  "item.png.desc": "For apps & presentations (transparent bg)",
  "item.jpeg.label": "Download as JPEG",
  "item.jpeg.desc": "For docs & photos (white background)",
  "item.all.label": "Download all formats",
  "item.all.desc": "Downloads a .zip with SVG, PNG & JPEG",

  // Premium
  "premium.locked": "Premium icon. Upgrade access required.",
  "premium.badge": "Premium",

  // Theme toggle
  "theme.toLight": "Switch to light mode",
  "theme.toDark": "Switch to dark mode",
  "theme.light": "Light mode",
  "theme.dark": "Dark mode",

  // Direction toggle
  "dir.toLtr": "Switch to left-to-right",
  "dir.toRtl": "Switch to right-to-left",
  "dir.ltr": "LTR layout",
  "dir.rtl": "RTL layout",

  // Tile
  "tile.select": "Select {name}",
  "tile.copySvg": "Copy SVG",

  // Toasts
  "toast.downloaded": "Downloaded {name} as {fmt}",
  "toast.downloadedAll": "Downloaded {name} (SVG + PNG + JPEG)",
  "toast.downloadedZip": "Downloaded {n} icons as ZIP",
  "toast.noSelection": "No icons selected",
  "toast.exportFailed": "Download failed",
  "toast.copied": "Copied {tab} code",
  "toast.clipboardError": "Clipboard unavailable",
} as const;

export type TranslationKey = keyof typeof en;
export type Translations = Record<TranslationKey, string>;
