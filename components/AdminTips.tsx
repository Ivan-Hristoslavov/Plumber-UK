type AdminTipsProps = {
  title: string;
  tips: string[];
};

/** Collapsed-by-default hints, so they never push real content below the fold on a phone. */
export function AdminTips({ title, tips }: AdminTipsProps) {
  return (
    <details className="group rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100 [&::-webkit-details-marker]:hidden">
        <span>💡 {title}</span>
        <svg
          aria-hidden
          className="h-4 w-4 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </summary>
      <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-blue-800 dark:text-blue-200 sm:grid-cols-2">
        {tips.map((tip) => (
          <li key={tip}>• {tip}</li>
        ))}
      </ul>
    </details>
  );
}
