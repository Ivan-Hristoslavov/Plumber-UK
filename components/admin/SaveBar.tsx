"use client";

import type { ReactNode } from "react";

/**
 * The save row at the end of a settings page. Always in view, and above the
 * phone tab bar rather than behind it.
 */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  disabled = false,
  label = "Save settings",
  children,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard?: () => void;
  disabled?: boolean;
  label?: string;
  children?: ReactNode;
}) {
  return (
    <div className="sticky mt-5 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 lg:bottom-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving || disabled}
          className="h-11 flex-1 whitespace-nowrap rounded-xl bg-blue-600 px-4 sm:px-6 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {saving ? "Saving…" : label}
        </button>
        {dirty && onDiscard && (
          <button type="button" onClick={onDiscard} disabled={saving} className="h-11 rounded-xl px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800">
            Discard
          </button>
        )}
        <span role="status" className={`text-xs font-medium ${dirty ? "basis-full text-center sm:basis-auto sm:text-left text-amber-700 dark:text-amber-300" : "text-gray-500 dark:text-gray-400"}`}>
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        {children && <span className="hidden gap-4 text-sm sm:ml-auto sm:flex">{children}</span>}
      </div>
    </div>
  );
}
