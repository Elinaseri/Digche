"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Lightweight multi-select state keyed by a stable id (e.g. icon slug).
 * Kept generic and UI-agnostic so it can back future bulk actions
 * (downloads, favorites, collections, team libraries).
 */
export interface SelectionApi {
  selected: ReadonlySet<string>;
  count: number;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  select: (id: string) => void;
  deselect: (id: string) => void;
  clear: () => void;
  selectMany: (ids: string[]) => void;
}

export function useSelection(initial: string[] = []): SelectionApi {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initial)
  );

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const select = useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const deselect = useCallback((id: string) => {
    setSelected((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const selectMany = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      selected,
      count: selected.size,
      isSelected,
      toggle,
      select,
      deselect,
      clear,
      selectMany,
    }),
    [selected, isSelected, toggle, select, deselect, clear, selectMany]
  );
}
