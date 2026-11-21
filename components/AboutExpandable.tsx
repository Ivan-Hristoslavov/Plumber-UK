"use client";

import { useState } from "react";

/**
 * The about text, cut to a few lines with a soft fade and "Read more". The
 * full text stays in the page (for search engines); only its height changes.
 */
export function AboutExpandable({ aboutHtml }: { aboutHtml: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!aboutHtml || !aboutHtml.trim()) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        About content will appear here once set in your profile.
      </p>
    );
  }

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "4000px" : "7.5rem" }}
      >
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed text-[14px] sm:text-[15px] prose-p:my-2 first:prose-p:mt-0"
          dangerouslySetInnerHTML={{ __html: aboutHtml }}
        />
        {!isOpen && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-100 dark:from-gray-900 to-transparent"
            aria-hidden="true"
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="mt-1 inline-flex items-center gap-1 rounded text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:text-blue-400"
        aria-expanded={isOpen}
      >
        {isOpen ? "Show less" : "Read more"}
        <svg
          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
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
