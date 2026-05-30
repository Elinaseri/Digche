import Link from "next/link";
import { requireAdmin } from "@/lib/services/auth";
import { signOutAction } from "./actions";
import DigLogo from "@/components/DigLogo";
import AdminNav from "./AdminNav";
import AdminLightMode from "./AdminLightMode";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <AdminLightMode />
      <header className="h-14 shrink-0 bg-white dark:bg-ink-800 border-b border-ink-200 dark:border-ink-700 flex items-center px-6 gap-4">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2.5 shrink-0"
        >
          <DigLogo size={28} variant="full" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 bg-ink-100 dark:bg-ink-700 dark:text-ink-300 px-1.5 py-0.5 rounded">
            Admin
          </span>
        </Link>

        <AdminNav />

        <div className="ml-auto flex items-center gap-4">
          <span className="hidden sm:block text-xs text-ink-400 dark:text-ink-500 truncate max-w-[180px]">
            {user.email}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white active:text-ink-900 dark:active:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-5 md:px-8 py-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
