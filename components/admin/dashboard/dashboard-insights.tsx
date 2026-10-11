"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  addDays,
  differenceInCalendarDays,
  differenceInMinutes,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";

import {
  BADGE_BASE,
  ICONS,
  Icon,
  STATUS_META,
  STATUS_ORDER,
  formatTime,
  isActive,
  type CalendarBooking,
} from "@/components/admin/calendar/calendar-shared";

const PAGE_SIZE = 500;
const MAX_PAGES = 20;

const card =
  "rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900";

const money = (n: number) =>
  `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

/** Bookings store a calendar date and a clock time, with no timezone. */
const startOf = (b: CalendarBooking) =>
  new Date(`${b.date}T${(b.time || "00:00").slice(0, 5)}:00`);

function useAllBookings() {
  const [bookings, setBookings] = useState<CalendarBooking[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const all: CalendarBooking[] = [];
        for (let page = 1; page <= MAX_PAGES; page++) {
          const response = await fetch(
            `/api/bookings?page=${page}&limit=${PAGE_SIZE}`,
            { cache: "no-store" },
          );
          if (!response.ok) throw new Error("Failed to load bookings");
          const data = await response.json();
          all.push(...(data.bookings || []));
          if (!data.pagination?.hasNextPage) break;
        }
        if (!cancelled) {
          setBookings(all);
          setFailed(false);
        }
      } catch (error) {
        console.error("Error loading bookings for insights:", error);
        if (!cancelled) setFailed(true);
      }
    }

    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { bookings, failed };
}

/** Re-renders every minute so "in 2 h" and the Now marker stay true. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Measured width, so SVG text keeps its real size instead of scaling down on phones. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/* -------------------------------------------------------------------------- */
/* Next booking                                                                */
/* -------------------------------------------------------------------------- */

function whenLabel(date: Date, now: Date) {
  const minutes = differenceInMinutes(date, now);
  const days = differenceInCalendarDays(date, now);
  const clock = format(date, "HH:mm");

  if (minutes < 60) return { main: `In ${Math.max(minutes, 1)} min`, sub: `Today at ${clock}` };
  if (days === 0) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return { main: `In ${h} h${m ? ` ${m} min` : ""}`, sub: `Today at ${clock}` };
  }
  if (days === 1) return { main: "Tomorrow", sub: `at ${clock}` };
  if (days < 7) return { main: format(date, "EEEE"), sub: `${format(date, "d MMM")} at ${clock}` };
  return { main: format(date, "EEE d MMM"), sub: `at ${clock}` };
}

function NextBooking({
  upcoming,
  now,
}: {
  upcoming: CalendarBooking[];
  now: Date;
}) {
  const next = upcoming[0];

  if (!next) {
    return (
      <div className={`${card} flex flex-col items-center justify-center p-6 text-center`}>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
          <Icon path={ICONS.calendar} className="h-6 w-6" />
        </div>
        <p className="font-semibold text-gray-900 dark:text-white">No upcoming bookings</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          New bookings from the website will show up here.
        </p>
      </div>
    );
  }

  const when = whenLabel(startOf(next), now);
  const sameDay = upcoming.filter((b) => isSameDay(startOf(b), startOf(next))).length - 1;

  return (
    <div className={`${card} relative overflow-hidden p-5 sm:p-6`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl"
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Next booking
          </p>
          <span className={`${BADGE_BASE} ${STATUS_META[next.status].badge}`}>
            {STATUS_META[next.status].label}
          </span>
        </div>

        <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {when.main}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{when.sub}</p>

        <div className="mt-5 rounded-xl bg-gray-50 p-4 ring-1 ring-inset ring-gray-100 dark:bg-gray-800/60 dark:ring-gray-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900 dark:text-white">{next.customer_name}</p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">{next.service}</p>
            </div>
            {Number(next.amount) > 0 && (
              <p className="shrink-0 text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                {money(Number(next.amount))}
              </p>
            )}
          </div>
          {next.address && (
            <p className="mt-3 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Icon path={ICONS.pin} className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span className="min-w-0 break-words">{next.address}</span>
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {next.customer_phone && (
            <a
              href={`tel:${next.customer_phone}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <Icon path={ICONS.phone} className="h-4 w-4" />
              Call
            </a>
          )}
          {next.address && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(next.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Icon path={ICONS.pin} className="h-4 w-4" />
              Directions
            </a>
          )}
          <Link
            href="/admin/calendar"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Calendar
          </Link>
        </div>

        {sameDay > 0 && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            +{sameDay} more booking{sameDay === 1 ? "" : "s"} that day
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chart                                                                       */
/* -------------------------------------------------------------------------- */

type Range = "14d" | "12w";
type Metric = "bookings" | "revenue";

type Bucket = {
  from: string;
  to: string;
  label: string;
  tick: string;
  count: number;
  value: number;
  current: boolean;
};

const ymd = (d: Date) => format(d, "yyyy-MM-dd");

function buildBuckets(range: Range, now: Date, offset = 0): Bucket[] {
  if (range === "14d") {
    return Array.from({ length: 14 }, (_, i) => {
      const day = startOfDay(subDays(now, 13 - i + offset * 14));
      return {
        from: ymd(day),
        to: ymd(day),
        label: format(day, "EEE d MMM"),
        tick: format(day, "d"),
        count: 0,
        value: 0,
        current: offset === 0 && i === 13,
      };
    });
  }

  return Array.from({ length: 12 }, (_, i) => {
    const start = startOfWeek(subWeeks(now, 11 - i + offset * 12), { weekStartsOn: 1 });
    const end = endOfDay(addDays(start, 6));
    return {
      from: ymd(start),
      to: ymd(end),
      label: `${format(start, "d MMM")} – ${format(end, "d MMM")}`,
      tick: format(start, "d MMM"),
      count: 0,
      value: 0,
      current: offset === 0 && i === 11,
    };
  });
}

function fill(buckets: Bucket[], bookings: CalendarBooking[]) {
  for (const b of bookings) {
    if (!isActive(b)) continue;
    const bucket = buckets.find((x) => b.date >= x.from && b.date <= x.to);
    if (bucket) {
      bucket.count += 1;
      bucket.value += Number(b.amount || 0);
    }
  }
  return buckets;
}

function niceMax(max: number, metric: Metric) {
  if (metric === "bookings") return Math.max(4, Math.ceil(max / 2) * 2);
  const step = max > 1000 ? 500 : max > 300 ? 100 : 50;
  return Math.max(step * 2, Math.ceil(max / step) * step);
}

function BookingsChart({
  bookings,
  now,
}: {
  bookings: CalendarBooking[];
  now: Date;
}) {
  const [range, setRange] = useState<Range>("14d");
  const [metric, setMetric] = useState<Metric>("bookings");
  const [hover, setHover] = useState<number | null>(null);

  const buckets = useMemo(() => fill(buildBuckets(range, now), bookings), [range, now, bookings]);
  const previous = useMemo(() => fill(buildBuckets(range, now, 1), bookings), [range, now, bookings]);

  const pick = (b: Bucket) => (metric === "bookings" ? b.count : b.value);
  const total = buckets.reduce((s, b) => s + pick(b), 0);
  const prevTotal = previous.reduce((s, b) => s + pick(b), 0);
  const delta = prevTotal === 0 ? (total > 0 ? 100 : 0) : Math.round(((total - prevTotal) / prevTotal) * 100);

  const [chartRef, measured] = useWidth<HTMLDivElement>();
  const W = Math.max(280, measured || 600);
  const H = 210;
  const padL = metric === "revenue" ? 44 : 30;
  const padR = 6;
  const padT = 10;
  const padB = 26;
  const max = niceMax(Math.max(0, ...buckets.map(pick)), metric);
  const slot = (W - padL - padR) / buckets.length;
  const barW = Math.min(slot * 0.62, 30);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const fmt = (v: number) => (metric === "bookings" ? String(v) : money(v));
  const shown = hover !== null ? buckets[hover] : null;

  return (
    <div className={`${card} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {metric === "bookings" ? "Bookings" : "Booked value"} ·{" "}
            {range === "14d" ? "last 14 days" : "last 12 weeks"}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-white">
              {fmt(total)}
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                delta >= 0
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
              }`}
            >
              {delta >= 0 ? "+" : ""}
              {delta}%
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">vs previous</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div role="tablist" aria-label="Metric" className="inline-flex rounded-full bg-gray-100 p-0.5 dark:bg-gray-800">
            {(["bookings", "revenue"] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={metric === m}
                onClick={() => setMetric(m)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  metric === m
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {m === "bookings" ? "Bookings" : "Value"}
              </button>
            ))}
          </div>
          <div role="tablist" aria-label="Range" className="inline-flex rounded-full bg-gray-100 p-0.5 dark:bg-gray-800">
            {(["14d", "12w"] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  range === r
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {r === "14d" ? "14 days" : "12 weeks"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-1 h-5 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
        {shown ? (
          <>
            <span className="font-medium text-gray-900 dark:text-white">{shown.label}</span>
            {" · "}
            {shown.count} booking{shown.count === 1 ? "" : "s"} · {money(shown.value)}
          </>
        ) : (
          "Hover or tap a bar for details"
        )}
      </div>

      <div ref={chartRef} className="mt-1 w-full">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${metric === "bookings" ? "Bookings" : "Booked value"} chart`}
        className="block"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(max * t)}
              y2={y(max * t)}
              className="stroke-gray-200 dark:stroke-gray-800"
              strokeDasharray={t === 0 ? undefined : "3 4"}
            />
            <text
              x={padL - 6}
              y={y(max * t) + 3}
              textAnchor="end"
              className="fill-gray-400 text-[10px] dark:fill-gray-500"
            >
              {metric === "bookings" ? Math.round(max * t) : money(max * t)}
            </text>
          </g>
        ))}

        {buckets.map((b, i) => {
          const v = pick(b);
          const x = padL + slot * i + (slot - barW) / 2;
          const h = Math.max(v > 0 ? 3 : 0, (H - padT - padB) * (v / max));
          const every = W < 420 ? (range === "12w" ? 3 : 3) : 2;
          const showTick = b.current || (buckets.length - 1 - i) % every === 0;

          return (
            <g key={b.from} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)}>
              <rect x={padL + slot * i} y={padT} width={slot} height={H - padT - padB} fill="transparent" />
              <rect
                x={x}
                y={H - padB - h}
                width={barW}
                height={h}
                rx={4}
                className={
                  hover === i
                    ? "fill-blue-600 dark:fill-blue-300"
                    : b.current
                      ? "fill-blue-600 dark:fill-blue-400"
                      : "fill-blue-400/70 dark:fill-blue-500/60"
                }
              />
              {showTick && (
                <text
                  x={x + barW / 2}
                  y={H - 8}
                  textAnchor="middle"
                  className={`text-[10px] ${b.current ? "fill-blue-600 font-semibold dark:fill-blue-400" : "fill-gray-400 dark:fill-gray-500"}`}
                >
                  {b.tick}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Timeline                                                                    */
/* -------------------------------------------------------------------------- */

function Timeline({
  bookings,
  upcoming,
  now,
}: {
  bookings: CalendarBooking[];
  upcoming: CalendarBooking[];
  now: Date;
}) {
  const past = bookings
    .filter((b) => startOf(b) < now)
    .sort((a, b) => startOf(b).getTime() - startOf(a).getTime())
    .slice(0, 4)
    .reverse();
  const future = upcoming.slice(0, 5);

  const row = (b: CalendarBooking, isPast: boolean) => (
    <li key={b.id} className="relative pb-5 pl-8 last:pb-0">
      <span
        aria-hidden
        className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-white dark:border-gray-900 ${STATUS_META[b.status].dot} ${isPast ? "opacity-60" : ""}`}
      />
      <div className={`flex items-start justify-between gap-3 ${isPast ? "opacity-80" : ""}`}>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{b.customer_name}</p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {b.service} · {format(startOf(b), "EEE d MMM")} · {formatTime(b.time)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`${BADGE_BASE} ${STATUS_META[b.status].badge}`}>{STATUS_META[b.status].label}</span>
          {Number(b.amount) > 0 && (
            <span className="text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-300">
              {money(Number(b.amount))}
            </span>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <div className={`${card} p-5 sm:p-6`}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Timeline</h2>
        <Link href="/admin/bookings" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          All bookings
        </Link>
      </div>

      {past.length === 0 && future.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No bookings yet.</p>
      ) : (
        <ul className="relative mt-5">
          <span
            aria-hidden
            className="absolute bottom-2 left-[7px] top-2 w-px bg-gray-200 dark:bg-gray-800"
          />
          {past.map((b) => row(b, true))}

          <li className="relative py-3 pl-8">
            <span
              aria-hidden
              className="absolute left-0 top-1/2 h-[15px] w-[15px] -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 ring-4 ring-blue-500/20 dark:border-gray-900"
            />
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Now
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{format(now, "EEE d MMM, HH:mm")}</span>
            </div>
          </li>

          {future.length === 0 ? (
            <li className="pl-8 text-sm text-gray-500 dark:text-gray-400">Nothing scheduled ahead.</li>
          ) : (
            future.map((b) => row(b, false))
          )}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Breakdown                                                                   */
/* -------------------------------------------------------------------------- */

function Breakdown({ bookings }: { bookings: CalendarBooking[] }) {
  const active = bookings.filter(isActive);
  const total = bookings.length;

  const byStatus = STATUS_ORDER.map((s) => ({
    status: s,
    count: bookings.filter((b) => b.status === s).length,
  }));

  const services = Object.values(
    active.reduce<Record<string, { name: string; count: number; value: number }>>((acc, b) => {
      const key = b.service || "Other";
      acc[key] ??= { name: key, count: 0, value: 0 };
      acc[key].count += 1;
      acc[key].value += Number(b.amount || 0);
      return acc;
    }, {}),
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  const topCount = Math.max(1, ...services.map((s) => s.count));

  const sumValue = active.reduce((s, b) => s + Number(b.amount || 0), 0);
  const avg = active.length ? sumValue / active.length : 0;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const completion = completed + cancelled > 0 ? Math.round((completed / (completed + cancelled)) * 100) : null;
  const unpaid = active.filter((b) => b.payment_status === "pending");
  const unpaidValue = unpaid.reduce((s, b) => s + Number(b.amount || 0), 0);

  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  active.forEach((b) => (weekdayCounts[(startOf(b).getDay() + 6) % 7] += 1));
  const busiestIndex = weekdayCounts.indexOf(Math.max(...weekdayCounts));
  const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const metric = (label: string, value: string, hint?: string) => (
    <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-inset ring-gray-100 dark:bg-gray-800/60 dark:ring-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-gray-900 dark:text-white">{value}</p>
      {hint && <p className="text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );

  return (
    <div className={`${card} p-5 sm:p-6`}>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">Overview</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {metric("Avg. booking", active.length ? money(avg) : "—")}
        {metric("Completion", completion === null ? "—" : `${completion}%`, "completed vs cancelled")}
        {metric("Unpaid", unpaid.length ? money(unpaidValue) : "£0", `${unpaid.length} booking${unpaid.length === 1 ? "" : "s"}`)}
        {metric("Busiest day", active.length >= 3 ? weekdayNames[busiestIndex] : "—")}
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        By status
      </p>
      {total === 0 ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No data yet.</p>
      ) : (
        <>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            {byStatus
              .filter((s) => s.count > 0)
              .map((s) => (
                <div
                  key={s.status}
                  title={`${STATUS_META[s.status].label}: ${s.count}`}
                  className={STATUS_META[s.status].dot}
                  style={{ width: `${(s.count / total) * 100}%` }}
                />
              ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-300">
            {byStatus.map((s) => (
              <li key={s.status} className="inline-flex items-center gap-1.5">
                <span aria-hidden className={`h-2 w-2 rounded-full ${STATUS_META[s.status].dot}`} />
                {STATUS_META[s.status].label}
                <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{s.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Top services
      </p>
      {services.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No data yet.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {services.map((s) => (
            <li key={s.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-gray-800 dark:text-gray-200">{s.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-gray-500 dark:text-gray-400">
                  {s.count} · {money(s.value)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                  style={{ width: `${(s.count / topCount) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function DashboardInsights() {
  const { bookings, failed } = useAllBookings();
  const now = useNow();

  const upcoming = useMemo(
    () =>
      (bookings || [])
        .filter((b) => (b.status === "pending" || b.status === "scheduled") && startOf(b) >= now)
        .sort((a, b) => startOf(a).getTime() - startOf(b).getTime()),
    [bookings, now],
  );

  if (failed && !bookings) return null;

  if (!bookings) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6" aria-busy="true">
        <div className="h-72 rounded-2xl bg-gray-200/70 dark:bg-gray-800/70" />
        <div className="h-72 rounded-2xl bg-gray-200/70 dark:bg-gray-800/70 lg:col-span-2" />
        <div className="h-80 rounded-2xl bg-gray-200/70 dark:bg-gray-800/70 lg:col-span-2" />
        <div className="h-80 rounded-2xl bg-gray-200/70 dark:bg-gray-800/70" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      <NextBooking upcoming={upcoming} now={now} />
      <div className="lg:col-span-2">
        <BookingsChart bookings={bookings} now={now} />
      </div>
      <div className="lg:col-span-2">
        <Timeline bookings={bookings} upcoming={upcoming} now={now} />
      </div>
      <Breakdown bookings={bookings} />
    </div>
  );
}
