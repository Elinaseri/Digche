import type { ExportOptions, ExportResult, IconExportInput } from "./types";
import { FORMAT_EXT } from "./types";
import { rasterize } from "./raster";

/** Export an icon as a PNG Blob (transparent background). Browser-only. */
export async function exportIconAsPng(
  input: IconExportInput,
  opts: ExportOptions
): Promise<ExportResult> {
  const blob = await rasterize(input, opts, "png");
  return {
    filename: `${input.slug}-${input.style.toLowerCase()}-${opts.size}.${FORMAT_EXT.png}`,
    blob,
    format: "png",
  };
}
