"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  type DayOffPeriod,
  addDays,
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

type DayStripProps = Props & {
  calendarOpen: boolean;
  onToggleCalendar: () => void;
  /** How many open days to offer before "More dates". */
  count?: number;
};

const dayPart = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });

/**
 * The next open days as one swipeable row: most people book within a week or
 * two, so this replaces a full month grid (about 350px on a phone) with a
 * single line. Closed and past days are left out rather than shown greyed.
 * The month grid is still one tap away for anything further ahead.
 */
export function DayStrip({
  value,
  onChange,
  today,
  maxDate,
  periods,
  workingDays,
  calendarOpen,
  onToggleCalendar,
  count = 14,
}: DayStripProps) {
  const days = useMemo(() => {
    const list: string[] = [];
    for (let date = today; date <= maxDate && list.length < count; date = addDays(date, 1)) {
      if (unavailableReason(date, { today, maxDate, periods, workingDays }) === null) list.push(date);
    }
    return list;
  }, [today, maxDate, periods, workingDays, count]);

  // Keep the chosen day visible inside the row. scrollLeft on the row itself,
  // never scrollIntoView, which would also scroll the whole page.
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !chip) return;
    const left = chip.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + chip.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: left - 16, behavior: "smooth" });
    }
  }, [value]);

  const tomorrow = addDays(today, 1);

  return (
    <div className="-mx-4 sm:mx-0">
      <div
        ref={rowRef}
        role="group"
        aria-label="Choose a day"
        className="flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-1 sm:scroll-px-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((date) => {
          const selected = date === value;
          const label = date === today ? "Today" : date === tomorrow ? "Tmrw" : dayPart(date, { weekday: "short" });
          return (
            <button
              key={date}
              type="button"
              onClick={() => onChange(date)}
              aria-pressed={selected}
              aria-label={formatLongDate(date)}
              className={`flex w-[4.25rem] shrink-0 snap-start flex-col items-center rounded-xl border-2 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-800 ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "border-gray-200 bg-white text-gray-900 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase ${selected ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{label}</span>
              <span className="text-lg font-bold leading-tight">{parseDateString(date).day}</span>
              <span className={`text-[11px] ${selected ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{dayPart(date, { month: "short" })}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onToggleCalendar}
          aria-expanded={calendarOpen}
          className="flex w-[4.25rem] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 py-2 text-[11px] font-semibold text-blue-700 hover:border-blue-400 dark:border-gray-600 dark:text-blue-300"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          {calendarOpen ? "Hide" : "More dates"}
        </button>
      </div>
    </div>
  );
}
