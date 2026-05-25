import type {
  ExportFormat,
  ExportOptions,
  ExportResult,
  IconExportInput,
} from "./types";
import { exportIconAsSvg } from "./export-svg";
import { exportIconAsPng } from "./export-png";
import { exportIconAsJpeg } from "./export-jpeg";

/** Produce one ExportResult for a given icon + format. */
export async function exportIconAs(
  input: IconExportInput,
  opts: ExportOptions,
  format: ExportFormat
): Promise<ExportResult> {
  switch (format) {
    case "svg":
      return exportIconAsSvg(input, opts);
    case "png":
      return exportIconAsPng(input, opts);
    case "jpeg":
      return exportIconAsJpeg(input, opts);
  }
}

/** Export a single icon in several formats (default: SVG + PNG + JPEG). */
export async function exportIconFormats(
  input: IconExportInput,
  opts: ExportOptions,
  formats: ExportFormat[] = ["svg", "png", "jpeg"]
): Promise<ExportResult[]> {
  return Promise.all(formats.map((f) => exportIconAs(input, opts, f)));
}

/** Bundle already-rendered results into a ZIP, grouped into /svg /png /jpeg. */
export async function zipResults(
  results: ExportResult[],
  rootDir = "digche-icons"
): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const root = zip.folder(rootDir)!;
  for (const r of results) {
    const folder = root.folder(r.format)!;
    folder.file(r.filename, r.blob);
  }
  return zip.generateAsync({ type: "blob" });
}

/**
 * Export multiple selected icons in the chosen formats as a single ZIP.
 * Structure: /digche-icons/{svg,png,jpeg}/<file>
 */
export async function exportIconsAsZip(
  inputs: IconExportInput[],
  opts: ExportOptions,
  formats: ExportFormat[] = ["svg", "png", "jpeg"],
  rootDir = "digche-icons"
): Promise<Blob> {
  if (inputs.length === 0) throw new Error("No icons selected to export.");
  if (formats.length === 0) throw new Error("No formats selected to export.");

  const nested = await Promise.all(
    inputs.map((input) => exportIconFormats(input, opts, formats))
  );
  return zipResults(nested.flat(), rootDir);
}
