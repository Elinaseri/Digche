import type { ExportOptions, ExportResult, IconExportInput } from "./types";
import { FORMAT_EXT } from "./types";
import { rasterize } from "./raster";

/** Export an icon as a JPEG Blob (opaque background). Browser-only. */
export async function exportIconAsJpeg(
  input: IconExportInput,
  opts: ExportOptions
): Promise<ExportResult> {
  const blob = await rasterize(input, opts, "jpeg");
  return {
    filename: `${input.slug}-${input.style.toLowerCase()}-${opts.size}.${FORMAT_EXT.jpeg}`,
    blob,
    format: "jpeg",
  };
}
