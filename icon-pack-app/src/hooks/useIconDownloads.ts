"use client";

import { useCallback } from "react";
import { useToast } from "@/components/Toast";
import {
  downloadBlob,
  exportIconAs,
  exportIconFormats,
  exportIconsAsZip,
  zipResults,
  type ExportFormat,
  type ExportOptions,
  type IconExportInput,
} from "@/lib/export-engine";

const FORMAT_LABEL: Record<ExportFormat, string> = {
  svg: "SVG",
  png: "PNG",
  jpeg: "JPEG",
};

/**
 * Orchestrates export-engine calls + user feedback. Holds no export logic
 * itself — it only wires results to downloads and toasts so UI components
 * stay free of that concern.
 */
export function useIconDownloads() {
  const toast = useToast();

  const single = useCallback(
    async (input: IconExportInput, opts: ExportOptions, format: ExportFormat) => {
      try {
        const result = await exportIconAs(input, opts, format);
        downloadBlob(result.blob, result.filename);
        toast.success(`Downloaded ${input.name} as ${FORMAT_LABEL[format]}`);
      } catch {
        toast.error("Download failed");
      }
    },
    [toast]
  );

  const allFormats = useCallback(
    async (input: IconExportInput, opts: ExportOptions) => {
      try {
        const results = await exportIconFormats(input, opts);
        const blob = await zipResults(results, `digche-${input.slug}`);
        downloadBlob(blob, `${input.slug}-${input.style.toLowerCase()}-all-formats.zip`);
        toast.success(`Downloaded ${input.name} (SVG + PNG + JPEG)`);
      } catch {
        toast.error("Download failed");
      }
    },
    [toast]
  );

  const zipMany = useCallback(
    async (
      inputs: IconExportInput[],
      opts: ExportOptions,
      formats: ExportFormat[] = ["svg", "png", "jpeg"]
    ) => {
      if (inputs.length === 0) {
        toast.error("No icons selected");
        return;
      }
      try {
        const blob = await exportIconsAsZip(inputs, opts, formats);
        downloadBlob(blob, `digche-icons-${inputs.length}.zip`);
        toast.success(`Downloaded ${inputs.length} icons as ZIP`);
      } catch {
        toast.error("Download failed");
      }
    },
    [toast]
  );

  return { single, allFormats, zipMany };
}
