import Link from "next/link";
import { getAdminIcons } from "@/lib/services/icons";
import type { AdminIcon } from "@/lib/domain/types";
import IconActions from "./IconActions";

function StatusBadge({ status }: { status: AdminIcon["status"] }) {
  return (
    <span
      className={
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium " +
        (status === "published"
          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-400")
      }
    >
      {status}
    </span>
  );
}

export default async function AdminIconsPage() {
  let icons: AdminIcon[] = [];
  let fetchError: string | null = null;

  try {
    icons = await getAdminIcons();
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load icons.";
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">
            Icons
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            {icons.length > 0
              ? `${icons.length} icon${icons.length === 1 ? "" : "s"}`
              : "No icons yet."}
          </p>
        </div>
        <Link
          href="/admin/icons/new"
          className="h-9 px-4 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 active:bg-ink-800 dark:active:bg-ink-200 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="shrink-0"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Icon
        </Link>
      </div>

      {fetchError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {fetchError}
        </div>
      )}

      {icons.length === 0 && !fetchError ? (
        <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 border-dashed rounded-2xl px-6 py-16 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
            No icons yet
          </p>
          <p className="text-xs text-ink-400 dark:text-ink-500">
            Upload your first icon to get started.
          </p>
          <Link
            href="/admin/icons/new"
            className="mt-3 h-9 px-4 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 transition-colors inline-flex items-center"
          >
            Upload icon
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-500 dark:text-ink-400 hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-500 dark:text-ink-400 hidden md:table-cell">
                  Variants
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-ink-500 dark:text-ink-400">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-medium text-ink-500 dark:text-ink-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {icons.map((icon) => (
                <tr
                  key={icon.id}
                  className="border-b border-ink-50 dark:border-ink-700/50 last:border-0 hover:bg-ink-50/50 dark:hover:bg-ink-700/20 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink-900 dark:text-white">
                      {icon.name}
                    </div>
                    <div className="text-[11px] text-ink-400 dark:text-ink-500 font-mono">
                      {icon.slug}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-600 dark:text-ink-300 hidden sm:table-cell">
                    {icon.category}
                  </td>
                  <td className="px-5 py-3 text-ink-500 dark:text-ink-400 hidden md:table-cell">
                    {icon.variants.length} / 4
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={icon.status} />
                    {icon.isPremium && (
                      <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        premium
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <IconActions
                      icon={{ id: icon.id, slug: icon.slug, status: icon.status }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
