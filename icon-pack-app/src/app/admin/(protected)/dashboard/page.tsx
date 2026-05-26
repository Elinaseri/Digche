import { getIconStats } from "@/lib/services/icons";
import type { IconStats } from "@/lib/services/icons";

const STAT_CARDS: {
  key: keyof IconStats;
  label: string;
  description: string;
}[] = [
  { key: "published", label: "Published", description: "Live in the public browser" },
  { key: "draft", label: "Draft", description: "Not yet visible to users" },
  { key: "premium", label: "Premium", description: "Locked icons" },
  { key: "categories", label: "Categories", description: "Active categories" },
];

export default async function DashboardPage() {
  let stats: IconStats = { published: 0, draft: 0, premium: 0, categories: 0 };
  try {
    stats = await getIconStats();
  } catch {
    // DB not yet connected — show dashes
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
          Welcome back.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ key, label, description }) => (
          <div
            key={key}
            className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl px-5 py-4"
          >
            <div className="text-xs text-ink-500 dark:text-ink-400 mb-1">
              {label}
            </div>
            <div className="text-2xl font-semibold text-ink-900 dark:text-white">
              {stats[key]}
            </div>
            <div className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">
              {description}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl px-6 py-10 flex flex-col items-center justify-center text-center gap-2">
        <div className="w-10 h-10 rounded-full bg-ink-100 dark:bg-ink-700 grid place-items-center mb-1">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ink-400"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
          Icon management
        </p>
        <p className="text-xs text-ink-400 dark:text-ink-500">
          Upload, edit, and publish icons from the{" "}
          <a
            href="/admin/icons"
            className="underline hover:no-underline text-ink-600 dark:text-ink-300"
          >
            Icons
          </a>{" "}
          page.
        </p>
      </div>
    </div>
  );
}
