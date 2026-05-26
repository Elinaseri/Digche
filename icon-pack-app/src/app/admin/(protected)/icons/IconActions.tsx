"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  publishIconAction,
  unpublishIconAction,
  deleteIconAction,
} from "./actions";
import type { AdminIcon } from "@/lib/domain/types";

interface Props {
  icon: Pick<AdminIcon, "id" | "slug" | "status">;
}

export default function IconActions({ icon }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handlePublishToggle() {
    startTransition(async () => {
      if (icon.status === "published") {
        await unpublishIconAction(icon.id);
      } else {
        await publishIconAction(icon.id);
      }
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${icon.slug}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteIconAction(icon.id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 justify-start">
      <a
        href={`/admin/icons/${icon.id}/edit`}
        className="h-7 px-2.5 rounded-lg text-xs font-medium text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors inline-flex items-center"
      >
        Edit
      </a>
      <button
        onClick={handlePublishToggle}
        disabled={pending}
        className={
          "h-7 px-2.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 " +
          (icon.status === "published"
            ? "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            : "text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20")
        }
      >
        {icon.status === "published" ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="h-7 px-2.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
