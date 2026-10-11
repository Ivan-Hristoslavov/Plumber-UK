"use client";

import { format } from "date-fns";

import {
  BADGE_BASE,
  ICONS,
  Icon,
  PAYMENT_BADGE,
  STATUS_META,
  formatTime,
  type CalendarBooking,
} from "./calendar-shared";

type Props = {
  date: Date;
  bookings: CalendarBooking[];
  onOpenBooking: (booking: CalendarBooking) => void;
};

/** Agenda for the selected day, shown under the month grid (the only place phones see details). */
export function CalendarDayPanel({ date, bookings, onOpenBooking }: Props) {
  return (
    <section
      aria-label={`Bookings on ${format(date, "EEEE d MMMM")}`}
      className="border-t border-gray-200/80 dark:border-gray-800"
    >
      <div className="flex items-baseline justify-between gap-3 px-4 pb-1 pt-4 sm:px-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {format(date, "EEEE, d MMMM")}
        </h3>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {bookings.length === 0
            ? "No bookings"
            : `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            <Icon path={ICONS.calendar} className="h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nothing booked for this day.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 p-4 sm:p-5">
          {bookings.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => onOpenBooking(b)}
                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border border-gray-200/80 bg-white py-3 pl-5 pr-4 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500/50"
              >
                <span
                  aria-hidden
                  className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_META[b.status].dot}`}
                />
                <span className="w-12 shrink-0 text-base font-semibold tabular-nums text-gray-900 dark:text-white">
                  {formatTime(b.time)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-gray-900 dark:text-white">
                    {b.customer_name}
                  </span>
                  <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                    {b.service}
                    {b.address ? ` · ${b.address}` : ""}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className={`${BADGE_BASE} ${STATUS_META[b.status].badge}`}>
                    {STATUS_META[b.status].label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={`${BADGE_BASE} hidden sm:inline-flex ${PAYMENT_BADGE[b.payment_status]}`}
                    >
                      {b.payment_status}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                      £{Number(b.amount || 0).toFixed(2)}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
