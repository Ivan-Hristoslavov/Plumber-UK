import type { ChangeEvent, ReactNode } from "react";

/** One tidy row for list filters: search first, then compact selects. */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
    </div>
  );
}

const control =
  "h-10 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

export function FilterSearch({
  value,
  onChange,
  placeholder,
  label = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:min-w-[14rem]">
      <svg
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className={`${control} w-full pl-9 pr-3 placeholder:text-gray-400`}
      />
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      className={`${control} w-full px-3 sm:w-auto sm:min-w-[9.5rem]`}
    >
      {children}
    </select>
  );
}
