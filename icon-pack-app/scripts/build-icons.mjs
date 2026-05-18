import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "source-icons");
const OUT_ICONS = path.join(ROOT, "public", "icons");
const OUT_DATA = path.join(ROOT, "src", "data");

const STYLES = ["Bold", "Bulk", "Linear", "Outline"];

function slug(s) {
  return s
    .trim()
    .replace(/[\s_\.]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function pascal(s) {
  return s
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function normalizeSvg(raw) {
  let svg = raw;
  // strip XML prolog
  svg = svg.replace(/<\?xml[^>]*\?>/g, "");
  // strip <title>
  svg = svg.replace(/<title[\s\S]*?<\/title>/g, "");
  // strip Sketch's <defs> block (just clipping rectangles, not used for rendering)
  svg = svg.replace(/<defs[\s\S]*?<\/defs>/g, "");
  // strip xlink:href references that pointed to defs
  svg = svg.replace(/\sxlink:href="[^"]*"/g, "");
  // currentColor casing
  svg = svg.replace(/CURRENTCOLOR/g, "currentColor");
  // collapse whitespace between tags
  svg = svg.replace(/>\s+</g, "><").trim();
  // ensure root has width/height set to 1em-able by using viewBox only; force width/height to be "currentSize"
  svg = svg.replace(
    /<svg\b([^>]*)>/,
    (m, attrs) => {
      // remove existing width/height/xmlns/xmlns:xlink/version
      let cleaned = attrs
        .replace(/\swidth="[^"]*"/g, "")
        .replace(/\sheight="[^"]*"/g, "")
        .replace(/\sxmlns:xlink="[^"]*"/g, "")
        .replace(/\sversion="[^"]*"/g, "");
      if (!/viewBox=/.test(cleaned)) cleaned += ' viewBox="0 0 24 24"';
      if (!/xmlns=/.test(cleaned)) cleaned += ' xmlns="http://www.w3.org/2000/svg"';
      return `<svg width="24" height="24"${cleaned}>`;
    }
  );
  return svg;
}

async function walkCategories() {
  const out = [];
  const cats = (await fs.readdir(SRC, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const cat of cats) {
    const catDir = path.join(SRC, cat);
    const iconDirs = (await fs.readdir(catDir, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const iconName of iconDirs) {
      const iconDir = path.join(catDir, iconName);
      const files = (await fs.readdir(iconDir)).filter((f) =>
        f.toLowerCase().endsWith(".svg")
      );
      const styles = {};
      for (const f of files) {
        const m = f.match(/-(Bold|Bulk|Linear|Outline)\.svg$/i);
        if (!m) continue;
        const style = STYLES.find(
          (s) => s.toLowerCase() === m[1].toLowerCase()
        );
        const raw = await fs.readFile(path.join(iconDir, f), "utf8");
        const normalized = normalizeSvg(raw);
        styles[style] = normalized;
      }
      out.push({
        name: iconName,
        slug: slug(iconName),
        pascalName: pascal(iconName),
        category: cat,
        categorySlug: slug(cat),
        styles,
      });
    }
  }
  return out;
}

async function main() {
  await fs.rm(OUT_ICONS, { recursive: true, force: true });
  await fs.mkdir(OUT_ICONS, { recursive: true });
  await fs.mkdir(OUT_DATA, { recursive: true });

  const icons = await walkCategories();

  // Write per-icon SVG files & build manifest (without inlined SVG content for size)
  const manifest = {
    icons: [],
    categories: {},
    styles: STYLES,
    total: 0,
  };

  for (const icon of icons) {
    const dir = path.join(OUT_ICONS, icon.categorySlug, icon.slug);
    await fs.mkdir(dir, { recursive: true });
    const styleList = [];
    for (const style of STYLES) {
      if (icon.styles[style]) {
        await fs.writeFile(
          path.join(dir, `${style}.svg`),
          icon.styles[style],
          "utf8"
        );
        styleList.push(style);
      }
    }
    manifest.icons.push({
      name: icon.name,
      slug: icon.slug,
      pascalName: icon.pascalName,
      category: icon.category,
      categorySlug: icon.categorySlug,
      availableStyles: styleList,
    });
    manifest.categories[icon.categorySlug] = icon.category;
  }
  manifest.total = manifest.icons.length;

  // Also embed the SVG bodies inline so the client can render & copy them
  // without a fetch per icon.
  const inlined = {};
  for (const icon of icons) {
    inlined[icon.slug] = {};
    for (const style of STYLES) {
      if (icon.styles[style]) inlined[icon.slug][style] = icon.styles[style];
    }
  }

  await fs.writeFile(
    path.join(OUT_DATA, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  await fs.writeFile(
    path.join(OUT_DATA, "icons.json"),
    JSON.stringify(inlined)
  );

  console.log(
    `Built ${manifest.icons.length} icons across ${
      Object.keys(manifest.categories).length
    } categories.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
