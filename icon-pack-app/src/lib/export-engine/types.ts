import type { IconStyle } from "@/lib/types";

/** Raster/vector formats the export engine can produce. */
export type ExportFormat = "svg" | "png" | "jpeg";

/** Visual options applied when exporting an icon. */
export interface ExportOptions {
  /** Output square size in px (raster) / viewport size baked into the SVG. */
  size: number;
  /** Foreground color, replaces `currentColor`. */
  color: string;
  /**
   * Background fill for formats without alpha (JPEG). Ignored by SVG/PNG.
   * Defaults to white inside the rasterizer.
   */
  background?: string;
  /**
   * Device-pixel multiplier for raster output. Defaults to 2 for crisp PNGs.
   */
  scale?: number;
}

/** A single icon to export. `svg` is the normalized 24x24 currentColor markup. */
export interface IconExportInput {
  slug: string;
  name: string;
  style: IconStyle;
  svg: string;
}

/** Result of one export: a named, downloadable Blob. */
export interface ExportResult {
  filename: string;
  blob: Blob;
  format: ExportFormat;
}

export const FORMAT_MIME: Record<ExportFormat, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  jpeg: "image/jpeg",
};

export const FORMAT_EXT: Record<ExportFormat, string> = {
  svg: "svg",
  png: "png",
  jpeg: "jpeg",
};

export const ALL_FORMATS: ExportFormat[] = ["svg", "png", "jpeg"];
