import type { IconMeta } from "./types";

/**
 * Placeholder entitlement layer for future premium support.
 *
 * Today this only reads the static `isPremium` flag on the icon. Later this can
 * be replaced with real user-entitlement logic (auth, subscriptions, teams)
 * without touching any UI component — keep all gating decisions here.
 */

export function isPremiumIcon(icon: IconMeta): boolean {
  return icon.isPremium === true;
}

/** Whether the current user may download the given icon. */
export function canDownloadIcon(icon: IconMeta): boolean {
  return !isPremiumIcon(icon);
}

/** Whether the current user may copy the given icon's code. */
export function canCopyIcon(icon: IconMeta): boolean {
  return !isPremiumIcon(icon);
}
