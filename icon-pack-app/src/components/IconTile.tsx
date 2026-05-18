"use client";

import type { IconMeta } from "@/lib/types";

interface Props {
  icon: IconMeta;
  body: string;
  size: number;
  color: string;
  onClick: () => void;
}

export default function IconTile({ icon, body, size, color, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${icon.name} — ${icon.category}`}
      className="group aspect-square flex flex-col items-center justify-center gap-2 rounded-xl bg-white border border-ink-200/70 hover:border-ink-900 hover:shadow-soft transition-all p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
    >
      <span
        className="icon-svg grid place-items-center text-ink-900"
        style={{
          width: size,
          height: size,
          color,
        }}
        dangerouslySetInnerHTML={{ __html: body }}
      />
      <span className="text-[10px] text-ink-500 max-w-full truncate group-hover:text-ink-900">
        {icon.name}
      </span>
    </button>
  );
}
