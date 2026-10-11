"use client";

import { useEffect, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";

import {
  STATUS_META,
  formatTime,
  hourOf,
  type CalendarBooking,
} from "./calendar-shared";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const ROW_MIN_HEIGHT = 64; // px, keeps the "now" line maths simple

type Props = {
  days: Date[];
  getBookingsForDate: (date: Date) => CalendarBooking[];
  onSelectDay: (date: Date) => void;
  onOpenBooking: (booking: CalendarBooking) => void;
};

export function CalendarTimeGrid({
  days,
  getBookingsForDate,
  onSelectDay,
  onOpenBooking,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());
  const single = days.length === 1;

  const columns = single ? "3.5rem 1fr" : "3.5rem repeat(7, minmax(0, 1fr))";
  const today = new Date();

  // Land on the working day instead of midnight: first booking, else 07:00.
  const firstHour = (() => {
    const hours = days
      .flatMap((d) => getBookingsForDate(d))
      .map((b) => hourOf(b.time))
      .filter((h) => h >= 0);
    return hours.length ? Math.max(Math.min(...hours) - 1, 0) : 7;
  })();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: firstHour * ROW_MIN_HEIGHT });
    // Only when the visible range changes, not on every 30s data refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days[0]?.getTime(), days.length]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const nowOffset = (now.getMinutes() / 60) * 100;

  return (
    <div ref={scrollRef} className="max-h-[68vh] overflow-auto">
      <div className={single ? "min-w-[18rem]" : "min-w-[44rem]"}>
        {/* Day headers */}
        <div
          className="sticky top-0 z-20 grid border-b border-gray-200/80 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95"
          style={{ gridTemplateColumns: columns }}
        >
          <div />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelectDay(day)}
                className="flex flex-col items-center gap-0.5 border-l border-gray-100 py-2 text-center transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {format(day, "EEE")}
                </span>
                <span
                  className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-1 text-base font-semibold tabular-nums ${
                    isToday
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </button>
            );
          })}
        </div>

        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid border-b border-gray-100 last:border-b-0 dark:border-gray-800/80"
            style={{ gridTemplateColumns: columns, minHeight: ROW_MIN_HEIGHT }}
          >
            <div className="pr-2 pt-1 text-right text-[11px] font-medium tabular-nums text-gray-400 dark:text-gray-500">
              {String(hour).padStart(2, "0")}:00
            </div>
            {days.map((day) => {
              const slot = getBookingsForDate(day).filter(
                (b) => hourOf(b.time) === hour,
              );
              const showNow = isSameDay(day, now) && now.getHours() === hour;

              return (
                <div
                  key={day.toISOString()}
                  className={`relative min-w-0 space-y-1 border-l border-gray-100 p-1 dark:border-gray-800 ${
                    isSameDay(day, today) ? "bg-blue-50/40 dark:bg-blue-500/5" : ""
                  }`}
                >
                  {showNow && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                      style={{ top: `${nowOffset}%` }}
                    >
                      <span className="-ml-1 h-2 w-2 rounded-full bg-red-500" />
                      <span className="h-px flex-1 bg-red-500" />
                    </div>
                  )}
                  {slot.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onOpenBooking(b)}
                      className={`relative block w-full overflow-hidden rounded-lg py-1.5 pl-3 pr-2 text-left transition-colors ${STATUS_META[b.status].pill}`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-y-0 left-0 w-1 ${STATUS_META[b.status].dot}`}
                      />
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-[11px] font-semibold tabular-nums">
                          {formatTime(b.time)}
                        </span>
                        <span className="truncate text-xs font-semibold">
                          {b.customer_name}
                        </span>
                      </span>
                      <span className="block truncate text-[11px] opacity-75">
                        {b.service}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
