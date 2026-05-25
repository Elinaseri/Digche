"use client";

import { useCallback, useState } from "react";
import type { IconMeta } from "@/lib/types";
import { isPremiumIcon, canCopyIcon } from "@/lib/access";
import { useAuth } from "@/lib/auth";
import { useToast } from "./Toast";
import { buildStandaloneSvg } from "@/lib/svg";
import PremiumBadge from "./PremiumBadge";

interface Props {
  icon: IconMeta;
  body: string;
  size: number;
  color: string;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}

export default function IconTile({
  icon,
  body,
  size,
  color,
  selected,
  onToggleSelect,
  onOpen,
}: Props) {
  const toast = useToast();
  const { user, plan, openAuthModal } = useAuth();
  const premium = isPremiumIcon(icon);
  const locked = premium && plan !== "premium";
  const allowCopy = canCopyIcon(icon, user, plan);
  const [svgCopied, setSvgCopied] = useState(false);

  const handleCopySvg = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!allowCopy) {
        openAuthModal();
        return;
      }
      try {
        const standalone = buildStandaloneSvg(body, { size, color });
        await navigator.clipboard.writeText(standalone);
        setSvgCopied(true);
        setTimeout(() => setSvgCopied(false), 1400);
        toast.success("Copied SVG code");
      } catch {
        toast.error("Clipboard unavailable");
      }
    },
    [body, size, color, toast, allowCopy, openAuthModal]
  );

  return (
    <div
      className={
        "group relative aspect-square rounded-xl border transition-all bg-white dark:bg-ink-800 " +
        (selected
          ? "border-ink-900 dark:border-white ring-1 ring-ink-900 dark:ring-white"
          : "border-ink-200/70 dark:border-ink-700 hover:border-ink-900 dark:hover:border-ink-400 hover:shadow-soft")
      }
    >
      {/* Selection checkbox — hidden until hover/selected to keep cards clean */}
      {!locked && (
        <label
          className={
            "absolute top-1.5 left-1.5 z-10 transition-opacity " +
            (selected
              ? "opacity-100"
              : "opacity-0 max-md:opacity-100 group-hover:opacity-100 focus-within:opacity-100")
          }
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select ${icon.name}`}
            className="w-4 h-4 rounded border-ink-300 dark:border-ink-600 text-ink-900 focus:ring-ink-900 cursor-pointer accent-ink-900 dark:accent-white"
          />
        </label>
      )}

      {premium && (
        <span className="absolute top-1.5 right-1.5 z-10">
          <PremiumBadge />
        </span>
      )}


      <button
        type="button"
        data-icon-open={icon.slug}
        onClick={onOpen}
        title={
          locked
            ? `${icon.name} — Premium icon. Upgrade access required.`
            : `${icon.name} — ${icon.category}`
        }
        className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 dark:focus-visible:ring-white rounded-xl"
      >
        <span
          aria-hidden="true"
          className={"icon-svg grid place-items-center " + (locked ? "opacity-40" : "")}
          style={{ width: size, height: size, color }}
          dangerouslySetInnerHTML={{ __html: body }}
        />
        <span className="text-[10px] text-ink-500 dark:text-ink-400 max-w-full truncate group-hover:text-ink-900 dark:group-hover:text-ink-100">
          {icon.name}
        </span>
      </button>

      {/* Copy SVG shortcut — visible on hover for unlocked icons */}
      {!locked && (
        <button
          type="button"
          onClick={handleCopySvg}
          aria-label={`Copy SVG — ${icon.name}`}
          className={
            "absolute bottom-1.5 right-1.5 z-10 h-8 px-2 rounded-md text-[10px] font-medium bg-ink-900 dark:bg-white text-white dark:text-ink-900 transition-opacity " +
            (svgCopied
              ? "opacity-100"
              : "opacity-0 max-md:opacity-100 group-hover:opacity-100 focus-within:opacity-100")
          }
        >
          {svgCopied ? "✓" : "Copy SVG"}
        </button>
      )}
    </div>
  );
}
