"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import DownloadMenuItem, { type DownloadItem } from "./DownloadMenuItem";

interface DownloadDropdownProps {
  items: DownloadItem[];
  label?: string;
  /** Disables the whole trigger (e.g. premium-locked icon). */
  disabled?: boolean;
  /** Tooltip shown when disabled. */
  disabledReason?: string;
  align?: "start" | "end";
  variant?: "solid" | "outline";
  ariaLabel?: string;
}

export default function DownloadDropdown({
  items,
  label = "Download",
  disabled = false,
  disabledReason,
  align = "end",
  variant = "solid",
  ariaLabel = "Download options",
}: DownloadDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const enabledIndexes = items
    .map((it, i) => (it.disabled ? -1 : i))
    .filter((i) => i >= 0);

  const firstEnabled = enabledIndexes[0] ?? 0;

  const close = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) buttonRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    setActiveIndex(firstEnabled);
    setOpen(true);
  }, [firstEnabled]);

  // Focus the active item when the menu opens / active changes.
  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Close on scroll so the menu doesn't float over unrelated content.
  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const moveActive = useCallback(
    (dir: 1 | -1) => {
      setActiveIndex((curr) => {
        const pos = enabledIndexes.indexOf(curr);
        const nextPos =
          pos === -1
            ? 0
            : (pos + dir + enabledIndexes.length) % enabledIndexes.length;
        return enabledIndexes[nextPos] ?? curr;
      });
    },
    [enabledIndexes]
  );

  const activate = useCallback(
    (item: DownloadItem) => {
      if (item.disabled) return;
      close();
      void item.onSelect();
    },
    [close]
  );

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? 0);
      setOpen(true);
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(enabledIndexes[0] ?? 0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? 0);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const item = items[activeIndex];
        if (item) activate(item);
        break;
      }
    }
  };

  const triggerClasses =
    variant === "solid"
      ? "bg-ink-900 text-white hover:bg-ink-700 dark:bg-ink-700 dark:text-white dark:hover:bg-ink-600"
      : "bg-white text-ink-800 border border-ink-200 hover:border-ink-900 dark:bg-ink-800 dark:text-ink-100 dark:border-ink-700 dark:hover:border-ink-500";

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={
          "inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 dark:focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed " +
          triggerClasses
        }
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 4v12" />
          <path d="M7 11l5 5 5-5" />
          <path d="M4 20h16" />
        </svg>
        {label}
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={"transition-transform " + (open ? "rotate-180" : "")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && !disabled && (
        <div
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className={
            "absolute z-50 mt-2 w-64 p-1.5 rounded-2xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 shadow-soft max-h-[70vh] overflow-y-auto " +
            (align === "end" ? "right-0" : "left-0")
          }
        >
          {items.map((item, i) => (
            <div key={item.id}>
              {item.separated && (
                <div
                  role="separator"
                  className="my-1.5 border-t border-ink-100 dark:border-ink-700"
                />
              )}
              <DownloadMenuItem
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                item={item}
                active={i === activeIndex}
                onActivate={() => activate(item)}
                onHover={() => !item.disabled && setActiveIndex(i)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
