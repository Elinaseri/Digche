# Digche Icons — Web App

A Next.js + Tailwind web app for browsing and exporting the **Digche** icon pack
(548 SVGs across 10 categories, in Bold / Bulk / Linear / Outline styles).

Inspired by the UX of iconly.pro.

## Features

- Icon gallery with live search by name or category
- Filter by style (Bold / Bulk / Linear / Outline)
- Size selector (16 / 20 / 24 / 32 / 48 px)
- Color picker (applied via `currentColor` swap)
- Per-icon copy as **SVG**, **JSX** React component, or **CSS** (inlined data URI)
- Download single icon as **SVG** or **PNG** (2× DPR)
- Download all 548 icons as a categorized **ZIP**

## Project structure

```
icon-pack-app/
  source-icons/        # raw SVGs, organised as <Category>/<IconName>/<name>-<Style>.svg
  scripts/
    build-icons.mjs    # normalizes SVGs and emits a manifest + per-icon files
  src/
    app/               # Next.js App Router entry
    components/        # IconGallery, IconDetail, Toolbar, Sidebar, ...
    lib/               # SVG transforms, types
    data/              # generated manifest.json + icons.json (gitignored)
  public/icons/        # generated normalized SVGs (gitignored)
```

The build script runs automatically before `next dev` and `next build` via the
`predev` / `prebuild` npm hooks.

## Development

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Production build

```bash
npm run build
npm run start
```

## Adding more icons

Drop new icons into `source-icons/<Category>/<IconName>/<name>-<Style>.svg` and
run `npm run build:icons`. They appear automatically.

## Notes on the source SVGs

The original Sketch export used uppercase `CURRENTCOLOR` and embedded a
`<defs>` block plus `<title>` metadata. The build script strips these and
guarantees every icon ships with a clean `viewBox="0 0 24 24"`, no fixed width
or height, and `currentColor` for fills/strokes — so the size and color
controls in the app work consistently across all four styles.
