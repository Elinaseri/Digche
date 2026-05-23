"use client";

import { useDirection } from "@/lib/direction";
import { useI18n } from "@/lib/i18n";

export default function DirectionToggle() {
  const { dir, toggleDirection } = useDirection();
  const { t } = useI18n();
  const isRtl = dir === "rtl";

  return (
    <button
      type="button"
      onClick={toggleDirection}
      aria-label={isRtl ? t("dir.toLtr") : t("dir.toRtl")}
      title={isRtl ? t("dir.ltr") : t("dir.rtl")}
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-ink-200 bg-white text-ink-700 hover:border-ink-300 dark:bg-ink-800 dark:border-ink-700 dark:text-ink-100 dark:hover:border-ink-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 dark:focus-visible:ring-white text-xs font-semibold"
    >
      {isRtl ? "RTL" : "LTR"}
    </button>
  );
}
