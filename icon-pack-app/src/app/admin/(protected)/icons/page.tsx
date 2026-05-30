import Link from "next/link";
import { getAdminIcons } from "@/lib/services/icons";
import type { AdminIcon } from "@/lib/domain/types";
import AdminIconsClient from "./AdminIconsClient";

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
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/icons/bulk-upload"
            className="h-9 px-4 rounded-xl border border-ink-200 dark:border-ink-700 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" className="shrink-0">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <path d="M12 11v6M9 14l3-3 3 3" />
            </svg>
            Bulk Upload
          </Link>
          <Link
            href="/admin/icons/new"
            className="h-9 px-4 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-100 active:bg-ink-800 dark:active:bg-ink-200 transition-colors flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className="shrink-0">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Icon
          </Link>
        </div>
      </div>

      {fetchError && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <strong className="font-medium">Database error:</strong> {fetchError}
          <p className="mt-1 text-xs opacity-80">
            Run the SQL migrations in Supabase Dashboard → SQL Editor to set up the database.
          </p>
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
      ) : icons.length > 0 ? (
        <AdminIconsClient icons={icons} />
      ) : null}
    </div>
  );
}
