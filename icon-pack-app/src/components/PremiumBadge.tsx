export default function PremiumBadge({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      title="Premium icon. Upgrade access required."
      className={
        "inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 text-[10px] font-semibold px-1.5 py-0.5 leading-none " +
        className
      }
    >
      <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden>
        <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z" />
      </svg>
      Premium
    </span>
  );
}
