import type { CSSProperties } from "react";

export type DigLogoVariant = "badge" | "mark" | "full";

interface DigLogoProps {
  /** Pixel size of the square mark. */
  size?: number;
  /** "badge" = rounded-square brand mark; "mark" = monochrome glyph;
   *  "full" = badge + DIGCHE wordmark. */
  variant?: DigLogoVariant;
  className?: string;
  style?: CSSProperties;
  /** Accessible label. */
  title?: string;
}

/**
 * DIG / DIGCHE brand logo.
 *
 * The glyph is reproduced inline as SVG so it can be tinted for light/dark
 * mode. To drop in the official artwork later, replace the <DigGlyph> markup
 * below (or swap it for an <img src="/dig-logo.svg" />) — the public API of
 * this component stays the same.
 */
export default function DigLogo({
  size = 32,
  variant = "full",
  className = "",
  style,
  title = "DIGCHE",
}: DigLogoProps) {
  const showWordmark = variant === "full";

  return (
    <span
      className={"inline-flex items-center gap-2.5 " + className}
      style={style}
    >
      <DigGlyph size={size} badge={variant !== "mark"} title={title} />
      {showWordmark && (
        <span className="font-semibold tracking-tight text-ink-900 dark:text-white text-lg leading-none select-none">
          DIGCHE
        </span>
      )}
    </span>
  );
}

function DigGlyph({
  size,
  badge,
  title,
}: {
  size: number;
  badge: boolean;
  title: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={title}
      className="shrink-0"
    >
      <title>{title}</title>
      {badge && (
        <rect
          x="0"
          y="0"
          width="40"
          height="40"
          rx="10"
          className="fill-ink-900 dark:fill-white"
        />
      )}
      <g
        className={
          badge
            ? "fill-white stroke-white dark:fill-ink-900 dark:stroke-ink-900"
            : "fill-ink-900 stroke-ink-900 dark:fill-white dark:stroke-white"
        }
      >
        {/* Outer aperture ring */}
        <circle
          cx="20"
          cy="20"
          r="9"
          fill="none"
          strokeWidth="2.4"
        />
        {/* Inner eye/lens with a slanted edge */}
        <path d="M13.5 21.6 A6.6 6.6 0 0 1 26.2 18.4 Z" stroke="none" />
      </g>
    </svg>
  );
}
