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

function ListItem({ item }: { item: string }) {
  return (
    <li className="flex items-start">
      <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
      <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
    </li>
  );
}

export interface ProfileListWithShowMoreProps {
  value: string | null | undefined;
  fallback: string;
  className?: string;
}

export function ProfileListWithShowMore({ value, fallback, className = "" }: ProfileListWithShowMoreProps) {
  const items = parseList(value, fallback);
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) {
    return (
      <span className={className}>
        {fallback || "—"}
      </span>
    );
  }

  const maxVisible = 4;
  const visibleItems = items.slice(0, maxVisible);
  const extraItems = items.slice(maxVisible);
  const hasMore = extraItems.length > 0;

  if (!hasMore) {
    return (
      <ul className={`${className} space-y-1`}>
        {items.map((item, index) => (
          <ListItem key={index} item={item} />
        ))}
      </ul>
    );
  }

  return (
    <div className={className}>
      <ul className="space-y-1">
        {visibleItems.map((item, index) => (
          <ListItem key={index} item={item} />
        ))}
      </ul>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? "max-h-[2000px]" : "max-h-0"}`}
        aria-hidden={!isOpen}
      >
        <ul className="space-y-1 mt-2 pl-0">
          {extraItems.map((item, index) => (
            <ListItem key={maxVisible + index} item={item} />
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="list-expand-summary flex items-center gap-2 cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:underline text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded px-1 py-1.5 mt-2 border-0 bg-transparent"
        aria-expanded={isOpen}
      >
        <span>{isOpen ? "Hide" : `Show ${extraItems.length} more`}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
