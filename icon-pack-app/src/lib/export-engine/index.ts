export * from "./types";
export { buildSvgMarkup, exportIconAsSvg } from "./export-svg";
export { exportIconAsPng } from "./export-png";
export { exportIconAsJpeg } from "./export-jpeg";
export {
  exportIconAs,
  exportIconFormats,
  exportIconsAsZip,
  zipResults,
} from "./export-zip";

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
