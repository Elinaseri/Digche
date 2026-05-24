import type { User } from "@supabase/supabase-js";
import type { IconMeta } from "./types";
import type { Plan } from "./auth";

export function isPremiumIcon(icon: IconMeta): boolean {
  return icon.isPremium === true;
}

/**
 * Whether this user/plan may download the icon.
 * - Guest (no user): blocked — must sign in first
 * - Logged-in free: free icons only
 * - Logged-in premium: all icons
 */
export function canDownloadIcon(
  icon: IconMeta,
  user: User | null = null,
  plan: Plan = "free"
): boolean {
  if (!user) return false;
  if (!isPremiumIcon(icon)) return true;
  return plan === "premium";
}

/**
 * Whether this user/plan may copy the icon's code.
 * Same rules as download.
 */
export function canCopyIcon(
  icon: IconMeta,
  user: User | null = null,
  plan: Plan = "free"
): boolean {
  if (!user) return false;
  if (!isPremiumIcon(icon)) return true;
  return plan === "premium";
}
