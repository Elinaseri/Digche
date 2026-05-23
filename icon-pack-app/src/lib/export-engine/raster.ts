import type { ExportFormat, ExportOptions } from "./types";
import { FORMAT_MIME } from "./types";
import { buildSvgMarkup } from "./export-svg";
import type { IconExportInput } from "./types";

/**
 * Shared SVG -> raster pipeline used by both PNG and JPEG exporters.
 * Browser-only (uses Image + canvas). Returns a Blob in the requested format.
 */
export async function rasterize(
  input: IconExportInput,
  opts: ExportOptions,
  format: Exclude<ExportFormat, "svg">
): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("Raster export is only available in the browser.");
  }

  const markup = buildSvgMarkup(input, opts);
  const svgBlob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () =>
        reject(new Error(`Failed to load SVG for ${format.toUpperCase()} export`));
      img.src = url;
    });

    const scale = Math.max(1, Math.round(opts.scale ?? 2));
    const dim = opts.size * scale;
    const canvas = document.createElement("canvas");
    canvas.width = dim;
    canvas.height = dim;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    // JPEG has no alpha — paint a background first.
    if (format === "jpeg") {
      ctx.fillStyle = opts.background ?? "#ffffff";
      ctx.fillRect(0, 0, dim, dim);
    }

    ctx.drawImage(img, 0, 0, dim, dim);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, FORMAT_MIME[format], format === "jpeg" ? 0.92 : undefined)
    );
    if (!blob) throw new Error(`Canvas failed to encode ${format.toUpperCase()}`);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
