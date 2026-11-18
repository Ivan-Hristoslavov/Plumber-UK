"use client";

import { useState } from "react";

function parseList(value: string | null | undefined, fallback: string): string[] {
  const raw = (value || fallback || "").trim();
  if (!raw) return [];
  return raw
    .split(/[.,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export interface ProfileListWithShowMoreProps {
  value: string | null | undefined;
  fallback: string;
  className?: string;
  /** How many tags show before "+N more". */
  maxVisible?: number;
}

/**
 * A profile list (certifications, specialisations) as compact tags: a short
 * scan instead of a tall bulleted column, with the rest one tap away.
 */
export function ProfileListWithShowMore({ value, fallback, className = "", maxVisible = 4 }: ProfileListWithShowMoreProps) {
  const items = parseList(value, fallback);
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) {
    return <span className={className}>{fallback || "—"}</span>;
  }

  const shown = isOpen ? items : items.slice(0, maxVisible);
  const hidden = items.length - shown.length;

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {shown.map((item, index) => (
        <li
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs sm:text-[13px] leading-snug text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
        >
          {item}
        </li>
      ))}
      {(hidden > 0 || isOpen) && items.length > maxVisible && (
        <li>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            className="rounded-lg px-2.5 py-1 text-xs sm:text-[13px] font-semibold text-blue-600 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            {isOpen ? "Show less" : `+${hidden} more`}
          </button>
        </li>
      )}
    </ul>
  );
}
