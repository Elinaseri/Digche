import type { IconMeta } from "./types";
import type { Plan } from "./auth";

export function isPremiumIcon(icon: IconMeta): boolean {
  return icon.isPremium === true;
}

/** Whether the given plan may download this icon. */
export function canDownloadIcon(icon: IconMeta, plan: Plan = "free"): boolean {
  return !isPremiumIcon(icon) || plan === "premium";
}

/** Whether the given plan may copy this icon's code. */
export function canCopyIcon(icon: IconMeta, plan: Plan = "free"): boolean {
  return !isPremiumIcon(icon) || plan === "premium";
}
