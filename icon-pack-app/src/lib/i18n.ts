"use client";

import { useCallback, useMemo } from "react";
import { useDirection } from "@/lib/direction";
import { en, type TranslationKey } from "@/locales/en";
import { fa, categoriesFa } from "@/locales/fa";

export type Locale = "en" | "fa";
type Params = Record<string, string | number>;

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? String(params[key]) : `{${key}}`
  );
}

/**
 * Lightweight, dependency-free localization. The active locale is derived from
 * the layout direction (RTL => Persian, LTR => English), so switching the
 * direction toggle re-renders every consumer with translated copy immediately.
 */
export function useI18n() {
  const { dir } = useDirection();
  const locale: Locale = dir === "rtl" ? "fa" : "en";
  const dict = locale === "fa" ? fa : en;

  const t = useCallback(
    (key: TranslationKey, params?: Params) => interpolate(dict[key], params),
    [dict]
  );

  const tCategory = useCallback(
    (slug: string, fallback: string) =>
      locale === "fa" ? categoriesFa[slug] ?? fallback : fallback,
    [locale]
  );

  return useMemo(() => ({ locale, t, tCategory }), [locale, t, tCategory]);
}
