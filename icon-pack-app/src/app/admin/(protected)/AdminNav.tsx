"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/icons", label: "Icons" },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5">
      {NAV_ITEMS.map(({ href, label }) => {
        const active =
          href === "/admin/dashboard"
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={
              "px-3 h-8 flex items-center text-sm rounded-lg transition-colors " +
              (active
                ? "bg-ink-100 dark:bg-ink-700 text-ink-900 dark:text-white font-medium"
                : "text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 hover:text-ink-900 dark:hover:text-white")
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
