export default function AdminIconsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">
          Icons
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
          Upload and manage icon assets.
        </p>
      </div>

      <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 border-dashed rounded-2xl px-6 py-16 flex flex-col items-center justify-center text-center gap-2">
        <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
          Coming in Phase 2
        </p>
        <p className="text-xs text-ink-400 dark:text-ink-500">
          Upload, preview, and publish icons will be available here.
        </p>
      </div>
    </div>
  );
}
