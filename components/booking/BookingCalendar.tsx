"use client";

import { useEffect, useMemo, useState } from "react";

import {
  type DayOffPeriod,
  findDayOff,
  formatLongDate,
  parseDateString,
  toDateString,
  unavailableReason,
} from "./booking-utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  value: string;
  onChange: (date: string) => void;
  today: string;
  maxDate: string;
  periods: DayOffPeriod[];
  workingDays: string[];
};

/**
 * A month grid that is always on screen, instead of a date field that opens a
 * popup: one glance shows which days are open, closed or already past, and a
 * single tap picks one. Weeks start on Monday, as in the UK.
 */
export default function BookingCalendar({ value, onChange, today, maxDate, periods, workingDays }: Props) {
  const initial = parseDateString(value || today);
  const [view, setView] = useState({ year: initial.year, monthIndex: initial.monthIndex });

  // Follow the selection when it moves to another month (e.g. "next available").
  useEffect(() => {
    if (!value) return;
    const { year, monthIndex } = parseDateString(value);
    setView((current) => (current.year === year && current.monthIndex === monthIndex ? current : { year, monthIndex }));
  }, [value]);

  const todayParts = parseDateString(today);
  const maxParts = parseDateString(maxDate);
  const canGoBack = view.year * 12 + view.monthIndex > todayParts.year * 12 + todayParts.monthIndex;
  const canGoForward = view.year * 12 + view.monthIndex < maxParts.year * 12 + maxParts.monthIndex;

  const cells = useMemo(() => {
    const firstWeekday = (new Date(Date.UTC(view.year, view.monthIndex, 1)).getUTCDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(Date.UTC(view.year, view.monthIndex + 1, 0)).getUTCDate();
    const list: Array<string | null> = Array.from({ length: firstWeekday }, () => null);
    for (let day = 1; day <= daysInMonth; day++) list.push(toDateString(view.year, view.monthIndex, day));
    return list;
  }, [view]);

  const monthLabel = new Date(Date.UTC(view.year, view.monthIndex, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const move = (delta: number) => {
    const target = new Date(Date.UTC(view.year, view.monthIndex + delta, 1));
    setView({ year: target.getUTCFullYear(), monthIndex: target.getUTCMonth() });
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
        <h4 className="text-base font-semibold text-gray-900 dark:text-white" aria-live="polite">
          {monthLabel}
        </h4>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!canGoForward}
          aria-label="Next month"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <div key={`blank-${index}`} aria-hidden="true" />;

          const reason = unavailableReason(date, { today, maxDate, periods, workingDays });
          const closed = reason === "closed" ? findDayOff(date, periods) : undefined;
          const selected = date === value;
          const isToday = date === today;
          const day = parseDateString(date).day;

          return (
            <button
              key={date}
              type="button"
              disabled={reason !== null}
              onClick={() => onChange(date)}
              aria-pressed={selected}
              aria-label={`${formatLongDate(date)}${reason ? ", unavailable" : ""}${isToday ? ", today" : ""}`}
              title={closed ? `Closed: ${closed.title}` : undefined}
              className={[
                "relative flex h-10 sm:h-11 items-center justify-center rounded-xl text-sm font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-800",
                selected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : reason === "closed"
                    ? "cursor-not-allowed bg-amber-50 dark:bg-amber-900/20 text-amber-700/60 dark:text-amber-300/50 line-through"
                    : reason
                      ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                      : "text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30",
                isToday && !selected ? "ring-1 ring-inset ring-blue-400" : "",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" /> Selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-blue-400" aria-hidden="true" /> Today
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-200 dark:bg-amber-800" aria-hidden="true" /> Closed
        </span>
      </div>
    </div>
  );
}
