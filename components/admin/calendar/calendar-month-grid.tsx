"use client";

import { format, isSameDay, isSameMonth } from "date-fns";

import {
  STATUS_META,
  formatTime,
  type CalendarBooking,
} from "./calendar-shared";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_PER_CELL = 3;

type Props = {
  days: Date[];
  monthStart: Date;
  selectedDate: Date;
  getBookingsForDate: (date: Date) => CalendarBooking[];
  onSelectDay: (date: Date) => void;
  onOpenBooking: (booking: CalendarBooking) => void;
  onExpandDay: (bookings: CalendarBooking[]) => void;
};

export function CalendarMonthGrid({
  days,
  monthStart,
  selectedDate,
  getBookingsForDate,
  onSelectDay,
  onOpenBooking,
  onExpandDay,
}: Props) {
  const today = new Date();

  return (
    <div className="overflow-x-auto">
      <div
        role="grid"
        aria-label="Month calendar"
        className="grid min-w-[320px] grid-cols-7 gap-px bg-gray-200/80 dark:bg-gray-800"
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            role="columnheader"
            className="bg-gray-50 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-900 dark:text-gray-400"
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const dayBookings = getBookingsForDate(day);
          const inMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const visible = dayBookings.slice(0, MAX_PER_CELL);
          const extra = dayBookings.length - visible.length;

          return (
            <div
              key={day.toISOString()}
              role="gridcell"
              tabIndex={0}
              aria-selected={isSelected}
              aria-label={`${format(day, "EEEE d MMMM")}, ${dayBookings.length} bookings`}
              onClick={() => onSelectDay(day)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDay(day);
                }
              }}
              className={`group relative flex min-h-[4.75rem] cursor-pointer flex-col gap-1 p-1.5 outline-none transition-colors sm:min-h-[7.5rem] sm:p-2 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
                inMonth
                  ? "bg-white hover:bg-blue-50/50 dark:bg-gray-900 dark:hover:bg-gray-800/70"
                  : "bg-gray-50/70 dark:bg-gray-900/50"
              } ${isSelected ? "!bg-blue-50 dark:!bg-blue-500/10 shadow-[inset_0_0_0_2px] shadow-blue-500" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold tabular-nums sm:h-7 sm:min-w-7 sm:text-sm ${
                    isToday
                      ? "bg-blue-600 text-white shadow-sm"
                      : inMonth
                        ? "text-gray-800 dark:text-gray-100"
                        : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayBookings.length > 0 && (
                  <span className="hidden rounded-full bg-gray-100 px-1.5 text-[10px] font-semibold tabular-nums text-gray-500 dark:bg-gray-800 dark:text-gray-400 sm:inline">
                    {dayBookings.length}
                  </span>
                )}
              </div>

              {/* Phones: compact status dots, details live in the day panel below */}
              <div className="flex flex-wrap gap-1 sm:hidden">
                {dayBookings.slice(0, 6).map((b) => (
                  <span
                    key={b.id}
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_META[b.status].dot}`}
                  />
                ))}
              </div>

              <div className="hidden min-h-0 flex-1 flex-col gap-1 sm:flex">
                {visible.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    title={`${formatTime(b.time)} · ${b.customer_name} · ${b.service}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBooking(b);
                    }}
                    className={`relative flex w-full items-center gap-1 truncate rounded-md py-0.5 pl-2.5 pr-1.5 text-left text-[11px] font-medium leading-5 transition-colors ${STATUS_META[b.status].pill}`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-y-0 left-0 w-1 rounded-l-md ${STATUS_META[b.status].dot}`}
                    />
                    <span className="tabular-nums font-semibold">
                      {formatTime(b.time)}
                    </span>
                    <span className="truncate">{b.customer_name}</span>
                  </button>
                ))}
                {extra > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExpandDay(dayBookings);
                    }}
                    className="mt-auto rounded-md py-0.5 text-center text-[11px] font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    +{extra} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
