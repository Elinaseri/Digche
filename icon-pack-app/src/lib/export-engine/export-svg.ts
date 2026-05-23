import { buildStandaloneSvg } from "@/lib/svg";
import type { ExportOptions, ExportResult, IconExportInput } from "./types";
import { FORMAT_EXT } from "./types";

/** Build the standalone SVG markup string for an icon (size + color baked in). */
export function buildSvgMarkup(
  input: IconExportInput,
  opts: ExportOptions
): string {
  return buildStandaloneSvg(input.svg, { size: opts.size, color: opts.color });
}

/** Export an icon as an SVG Blob. Synchronous — no rasterization needed. */
export function exportIconAsSvg(
  input: IconExportInput,
  opts: ExportOptions
): ExportResult {
  const markup = buildSvgMarkup(input, opts);
  return {
    filename: `${input.slug}-${input.style.toLowerCase()}.${FORMAT_EXT.svg}`,
    blob: new Blob([markup], { type: "image/svg+xml;charset=utf-8" }),
    format: "svg",
  };
}
