"use client";

import { forwardRef, type ReactNode } from "react";

export interface DownloadItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Set apart from the items above with a divider. */
  separated?: boolean;
  onSelect: () => void | Promise<void>;
}

interface DownloadMenuItemProps {
  item: DownloadItem;
  active: boolean;
  onActivate: () => void;
  onHover: () => void;
}

const DownloadMenuItem = forwardRef<HTMLButtonElement, DownloadMenuItemProps>(
  function DownloadMenuItem({ item, active, onActivate, onHover }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        tabIndex={active ? 0 : -1}
        aria-disabled={item.disabled || undefined}
        disabled={item.disabled}
        onClick={onActivate}
        onMouseEnter={onHover}
        className={
          "w-full flex items-start gap-2.5 px-3 py-2 text-sm text-start rounded-lg transition-colors " +
          (item.disabled
            ? "text-ink-300 dark:text-ink-600 cursor-not-allowed"
            : active
            ? "bg-ink-100 text-ink-900 dark:bg-ink-700 dark:text-white"
            : "text-ink-700 dark:text-ink-200")
        }
      >
        {item.icon && (
          <span className="mt-0.5 shrink-0" aria-hidden>
            {item.icon}
          </span>
        )}
        <span className="min-w-0">
          <span className="block leading-tight">{item.label}</span>
          {item.description && (
            <span className="block text-xs text-ink-400 dark:text-ink-500 leading-tight mt-0.5">
              {item.description}
            </span>
          )}
        </span>
      </button>
    );
  }
);

export default DownloadMenuItem;
