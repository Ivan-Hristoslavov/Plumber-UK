"use client";

import { useState } from "react";

/**
 * About section: text content with Show more / Hide at the bottom and animation.
 * Same pattern as specializations – toggle always at bottom of text.
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
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        About Me
      </p>
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "4000px" : "180px" }}
        aria-hidden={!isOpen}
      >
        <div
          className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed text-[14px] sm:text-[15px]"
          dangerouslySetInnerHTML={{ __html: aboutHtml }}
        />
      </div>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="about-accordion-summary flex items-center gap-2 cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:underline text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded px-1 py-1.5 border-0 bg-transparent w-full justify-center sm:justify-start"
        aria-expanded={isOpen}
      >
        <span>{isOpen ? "Hide" : "Show more"}</span>
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
