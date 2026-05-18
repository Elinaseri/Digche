"use client";

import { useState } from "react";
import { iconBodies, manifest } from "@/lib/icons";
import { downloadDataUrl } from "@/lib/svg";

export default function DownloadAllButton() {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const root = zip.folder("digche-icons")!;

      for (const icon of manifest.icons) {
        const catFolder = root.folder(icon.category)!;
        const iconFolder = catFolder.folder(icon.name)!;
        const bodies = iconBodies[icon.slug] ?? {};
        for (const style of icon.availableStyles) {
          const body = bodies[style];
          if (body) iconFolder.file(`${icon.slug}-${style.toLowerCase()}.svg`, body);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      downloadDataUrl(url, "digche-icons.zip");
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-ink-900 text-white text-sm font-medium hover:bg-ink-700 transition-colors disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v12" />
        <path d="M7 11l5 5 5-5" />
        <path d="M4 20h16" />
      </svg>
      {busy ? "Packing..." : "Download all"}
    </button>
  );
}
