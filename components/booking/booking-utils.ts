/**
 * Pure helpers for the booking form: dates, closed periods and time windows.
 *
 * Dates travel as plain "YYYY-MM-DD" strings everywhere. They compare correctly
 * as strings and never pick up a timezone offset, which is what broke the old
 * form around midnight and at BST changes. "Today" is always London's today,
 * because the business is in London whatever the visitor's device says.
 */

export type DayOffPeriod = {
  start_date: string;
  end_date: string;
  title: string;
  description?: string | null;
  banner_message?: string | null;
};

const pad = (n: number) => String(n).padStart(2, "0");

export const toDateString = (year: number, monthIndex: number, day: number) =>
  `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

export function parseDateString(date: string): { year: number; monthIndex: number; day: number } {
  const [year, month, day] = date.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
}

export type LondonNow = { date: string; minutes: number };

export function getLondonNow(): LondonNow {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function addDays(date: string, days: number): string {
  const { year, monthIndex, day } = parseDateString(date);
  const moved = new Date(Date.UTC(year, monthIndex, day + days));
  return toDateString(moved.getUTCFullYear(), moved.getUTCMonth(), moved.getUTCDate());
}

export function addMonths(date: string, months: number): string {
  const { year, monthIndex, day } = parseDateString(date);
  const target = new Date(Date.UTC(year, monthIndex + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return toDateString(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay));
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function weekdayName(date: string): string {
  const { year, monthIndex, day } = parseDateString(date);
  return WEEKDAYS[new Date(Date.UTC(year, monthIndex, day)).getUTCDay()];
}

export function formatLongDate(date: string): string {
  const { year, monthIndex, day } = parseDateString(date);
  return new Date(Date.UTC(year, monthIndex, day)).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatShortDate(date: string): string {
  const { year, monthIndex, day } = parseDateString(date);
  return new Date(Date.UTC(year, monthIndex, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function findDayOff(date: string, periods: DayOffPeriod[]): DayOffPeriod | undefined {
  return periods.find((period) => date >= period.start_date && date <= period.end_date);
}

export function isWorkingDay(date: string, workingDays: string[]): boolean {
  return workingDays.includes(weekdayName(date));
}

export type UnavailableReason = "past" | "too-far" | "closed" | "non-working";

export function unavailableReason(
  date: string,
  options: { today: string; maxDate: string; periods: DayOffPeriod[]; workingDays: string[] },
): UnavailableReason | null {
  if (date < options.today) return "past";
  if (date > options.maxDate) return "too-far";
  if (findDayOff(date, options.periods)) return "closed";
  if (!isWorkingDay(date, options.workingDays)) return "non-working";
  return null;
}

/** First bookable date on or after `from`, or null if none within range. */
export function findNextAvailableDate(
  from: string,
  options: { today: string; maxDate: string; periods: DayOffPeriod[]; workingDays: string[] },
): string | null {
  let cursor = from < options.today ? options.today : from;
  for (let i = 0; i < 120 && cursor <= options.maxDate; i++) {
    if (!unavailableReason(cursor, options)) return cursor;
    cursor = addDays(cursor, 1);
  }
  return null;
}

export type TimeOfDay = "Morning" | "Afternoon" | "Evening";

export type Slot = {
  /** The original window string, e.g. "10:00 - 12:00". The booking sends its start. */
  value: string;
  label: string;
  start: number;
  end: number;
  part: TimeOfDay;
};

/** "10:00", "10:00:00" -> minutes after midnight. */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.trim().slice(0, 5).split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

export function parseSlot(value: string): Slot | null {
  const [from, to] = value.split(" - ").map((part) => part.trim());
  if (!from || !to) return null;
  const start = timeToMinutes(from);
  const end = timeToMinutes(to);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;

  return {
    value,
    label: `${from.slice(0, 5)} – ${to.slice(0, 5)}`,
    start,
    end,
    part: start < 12 * 60 ? "Morning" : start < 17 * 60 ? "Afternoon" : "Evening",
  };
}

export type SlotStatus = "available" | "booked" | "past";

/**
 * The windows overlap (10:00–12:00 and 11:00–13:00), so a booking anywhere
 * inside another window blocks it too. The old form only compared start times
 * and could hand out two overlapping appointments.
 */
export function slotStatus(
  slot: Slot,
  bookedStarts: number[],
  options: { isToday: boolean; nowMinutes: number },
): SlotStatus {
  if (options.isToday && slot.start <= options.nowMinutes) return "past";
  const length = slot.end - slot.start;
  return bookedStarts.some((booked) => Math.abs(booked - slot.start) < length) ? "booked" : "available";
}
