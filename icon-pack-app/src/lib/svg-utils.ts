const MAX_SVG_BYTES = 100 * 1024; // 100 KB

export function validateSvg(content: string): { ok: true } | { ok: false; error: string } {
  if (content.length > MAX_SVG_BYTES) {
    return { ok: false, error: "SVG file exceeds 100 KB." };
  }
  const trimmed = content.trimStart();
  if (!/<svg[\s>]/i.test(trimmed)) {
    return { ok: false, error: "File does not appear to be an SVG." };
  }
  if (/<script[\s>]/i.test(content)) {
    return { ok: false, error: "SVG contains a <script> element." };
  }
  if (/\s(href|src)\s*=\s*["']https?:\/\//i.test(content)) {
    return { ok: false, error: "SVG contains an external URL reference." };
  }
  return { ok: true };
}

export function normalizeSvg(raw: string): string {
  let svg = raw;
  svg = svg.replace(/<\?xml[^>]*\?>/g, "");
  svg = svg.replace(/<title[\s\S]*?<\/title>/g, "");
  svg = svg.replace(/<defs[\s\S]*?<\/defs>/g, "");
  svg = svg.replace(/\sxlink:href="[^"]*"/g, "");
  // Replace any hardcoded fill/stroke color with currentColor so the icon
  // inherits the CSS color property. Keeps fill="none", transparent, url().
  svg = svg.replace(/\s(fill|stroke)="([^"]*)"/gi, (_m, attr, val) => {
    if (/^(none|transparent|currentColor)$/i.test(val)) return ` ${attr}="${val}"`;
    if (val.startsWith("url(")) return ` ${attr}="${val}"`;
    return ` ${attr}="currentColor"`;
  });
  svg = svg.replace(/>\s+</g, "><").trim();
  svg = svg.replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
    let cleaned = attrs
      .replace(/\swidth="[^"]*"/g, "")
      .replace(/\sheight="[^"]*"/g, "")
      .replace(/\sxmlns:xlink="[^"]*"/g, "")
      .replace(/\sversion="[^"]*"/g, "");
    if (!/viewBox=/.test(cleaned)) cleaned += ' viewBox="0 0 24 24"';
    if (!/xmlns=/.test(cleaned)) cleaned += ' xmlns="http://www.w3.org/2000/svg"';
    return `<svg width="24" height="24"${cleaned}>`;
  });
  return svg;
}

export function slugify(s: string): string {
  return s
    .trim()
    .replace(/[\s_.]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export function toPascalCase(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

export function normalizeIconName(raw: string): { name: string; slug: string; changed: boolean } {
  // Split camelCase / PascalCase: ArrowRight → Arrow Right
  let s = raw.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Replace common separators with spaces
  s = s.replace(/[_\-.]+/g, " ");
  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  // Title case each word
  const name = s
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
  return { name, slug, changed: name !== raw };
}
