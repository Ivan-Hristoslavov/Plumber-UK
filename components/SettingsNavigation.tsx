"use client";

import React from "react";

export type SettingsTab = {
  id: string;
  name: string;
  icon: React.ReactElement | string;
  description: string;
  category: "business" | "content" | "integrations";
};

const GROUPS: { id: SettingsTab["category"]; label: string; hint: string }[] = [
  { id: "business", label: "Business", hint: "Who you are and when you work" },
  { id: "content", label: "Website content", hint: "What visitors see on the site" },
  { id: "integrations", label: "Integrations", hint: "Connected services" },
];

interface SettingsHubProps {
  tabs: SettingsTab[];
  onSelect: (tabId: string) => void;
}

/**
 * Landing page for Settings: every section as a card, grouped by purpose.
 * Pick one to open it; the page then shows only that section.
 */
export function SettingsHub({ tabs, onSelect }: SettingsHubProps) {
  return (
    <div className="space-y-8">
      {GROUPS.map((group) => {
        const items = tabs.filter((tab) => tab.category === group.id);
        if (items.length === 0) return null;

        return (
          <section key={group.id} aria-labelledby={`settings-group-${group.id}`}>
            <div className="mb-3 flex items-baseline gap-3">
              <h2
                id={`settings-group-${group.id}`}
                className="text-sm font-semibold text-gray-900 dark:text-white"
              >
                {group.label}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">{group.hint}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelect(tab.id)}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500/50"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    {tab.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-gray-900 dark:text-white">
                      {tab.name}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-gray-500 dark:text-gray-400">
                      {tab.description}
                    </span>
                  </span>
                  <svg
                    aria-hidden
                    className="h-5 w-5 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
