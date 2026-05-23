"use client";

import { useI18n } from "@/lib/i18n";

interface CategoryEntry {
  slug: string;
  label: string;
  count: number;
}

interface Props {
  categories: CategoryEntry[];
  active: string | null;
  total: number;
  onSelect: (slug: string | null) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  categories,
  active,
  total,
  onSelect,
  open,
  onClose,
}: Props) {
  const { t, tCategory } = useI18n();
  return (
    <>
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={
          "shrink-0 w-60 border-e border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 md:bg-transparent md:dark:bg-transparent md:static fixed inset-y-0 start-0 z-50 transition-transform md:translate-x-0 " +
          (open
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full md:translate-x-0 md:rtl:translate-x-0")
        }
      >
        <div className="px-4 py-5 sticky top-0 max-h-screen overflow-y-auto">
          <div className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-2 px-2">
            {t("sidebar.categories")}
          </div>
          <nav className="flex flex-col gap-0.5">
            <CategoryButton
              label={t("sidebar.allIcons")}
              count={total}
              active={active === null}
              onClick={() => onSelect(null)}
            />
            {categories.map((c) => (
              <CategoryButton
                key={c.slug}
                label={tCategory(c.slug, c.label)}
                count={c.count}
                active={active === c.slug}
                onClick={() => onSelect(c.slug)}
              />
            ))}
          </nav>

          <div className="mt-8 px-2 text-xs text-ink-500 leading-relaxed">
            <p className="mb-2 font-medium text-ink-700 dark:text-ink-200">
              {t("sidebar.tips")}
            </p>
            <ul className="space-y-1">
              <li>· {t("sidebar.tip.open")}</li>
              <li>· {t("sidebar.tip.select")}</li>
              <li>
                · {t("sidebar.tip.esc")}{" "}
                <kbd className="px-1 py-0.5 bg-ink-100 dark:bg-ink-800 rounded text-[10px]">
                  Esc
                </kbd>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}

function CategoryButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center justify-between px-3 h-9 rounded-lg text-sm transition-colors text-start " +
        (active
          ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900"
          : "text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800")
      }
    >
      <span className="truncate">{label}</span>
      <span
        className={
          "ms-2 tabular-nums text-xs " +
          (active ? "text-white/70 dark:text-ink-900/60" : "text-ink-400")
        }
      >
        {count}
      </span>
    </button>
  );
}
