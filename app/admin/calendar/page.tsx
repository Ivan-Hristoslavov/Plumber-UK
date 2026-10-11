"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { CalendarDayPanel } from "@/components/admin/calendar/calendar-day-panel";
import { CalendarMonthGrid } from "@/components/admin/calendar/calendar-month-grid";
import { CalendarTimeGrid } from "@/components/admin/calendar/calendar-time-grid";
import {
  BADGE_BASE,
  ICONS,
  Icon,
  ModalShell,
  PAYMENT_BADGE,
  STATUS_META,
  STATUS_ORDER,
  formatTime,
  isActive,
  type BookingStatus,
  type CalendarBooking,
} from "@/components/admin/calendar/calendar-shared";

type View = "month" | "week" | "day";

const VIEWS: { id: View; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
];

const SERVICE_OPTIONS = [
  "Leak Detection",
  "Pipe Repair",
  "Drain Cleaning",
  "Emergency Plumbing",
  "Boiler Service",
  "Bathroom Installation",
];

const PAGE_SIZE = 500;
const MAX_PAGES = 20;

const EMPTY_FORM = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  service: "",
  date: "",
  time: "",
  amount: "",
  address: "",
  notes: "",
};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [view, setView] = useState<View>("month");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");

  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [selectedBooking, setSelectedBooking] =
    useState<CalendarBooking | null>(null);
  const [multiSlotBookings, setMultiSlotBookings] = useState<
    CalendarBooking[] | null
  >(null);
  const [editingBooking, setEditingBooking] = useState<CalendarBooking | null>(
    null,
  );
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);

  const currentDate = parseISO(selectedDate);
  const monthStart = startOfMonth(currentDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart.getTime()],
  );
  const monthDays = useMemo(() => {
    const first = startOfWeek(monthStart, { weekStartsOn: 1 });
    const last = endOfMonth(monthStart);
    // 5 rows when the month fits, 6 only when it has to.
    const rows = Math.ceil(((last.getTime() - first.getTime()) / 86_400_000 + 1) / 7);
    return Array.from({ length: rows * 7 }, (_, i) => addDays(first, i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthStart.getTime()]);

  // The bookings API paginates (10 per page by default), so walk every page.
  const loadBookings = useCallback(async (initial = false) => {
    try {
      if (!initial) setRefreshing(true);
      setError(null);

      const all: CalendarBooking[] = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const response = await fetch(
          `/api/bookings?page=${page}&limit=${PAGE_SIZE}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("Failed to fetch bookings");
        const data = await response.json();
        all.push(...(data.bookings || []));
        if (!data.pagination?.hasNextPage) break;
      }
      setBookings(all);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookings(true);
    const interval = setInterval(() => loadBookings(), 30000);
    return () => clearInterval(interval);
  }, [loadBookings]);

  const getBookingsForDate = useCallback(
    (date: Date) =>
      bookings
        .filter(
          (b) =>
            isSameDay(parseISO(b.date), date) &&
            (statusFilter === "all" || b.status === statusFilter),
        )
        .sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [bookings, statusFilter],
  );

  const counts = useMemo(() => {
    const byStatus = { pending: 0, scheduled: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => {
      byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    });
    return byStatus;
  }, [bookings]);

  // Summary of what is on screen, so the numbers follow the view and filter.
  const rangeStats = useMemo(() => {
    const [from, to] =
      view === "month"
        ? [monthStart, endOfMonth(monthStart)]
        : view === "week"
          ? [weekDays[0], weekDays[6]]
          : [currentDate, currentDate];
    const start = format(from, "yyyy-MM-dd");
    const end = format(to, "yyyy-MM-dd");
    const inRange = bookings.filter(
      (b) =>
        b.date >= start &&
        b.date <= end &&
        (statusFilter === "all" || b.status === statusFilter),
    );
    return {
      total: inRange.length,
      value: inRange
        .filter(isActive)
        .reduce((sum, b) => sum + Number(b.amount || 0), 0),
      unpaid: inRange.filter(
        (b) => isActive(b) && b.payment_status === "pending",
      ).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, statusFilter, view, selectedDate]);

  const shift = (direction: 1 | -1) => {
    const next =
      view === "month"
        ? addMonths(currentDate, direction)
        : view === "week"
          ? addWeeks(currentDate, direction)
          : addDays(currentDate, direction);
    setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  const title =
    view === "month"
      ? format(monthStart, "MMMM yyyy")
      : view === "day"
        ? format(currentDate, "EEEE, d MMMM yyyy")
        : `${format(weekDays[0], "d MMM")} – ${format(weekDays[6], "d MMM yyyy")}`;

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      setActionError(null);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update booking status");
      const data = await response.json();
      await loadBookings();
      if (selectedBooking?.id === bookingId && data?.booking) {
        setSelectedBooking(data.booking);
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
      setActionError("Failed to update booking status");
    }
  };

  const openEditBooking = (booking: CalendarBooking) => {
    setEditingBooking(booking);
    setEditForm({
      customer_name: booking.customer_name,
      customer_email: booking.customer_email || "",
      customer_phone: booking.customer_phone || "",
      service: booking.service,
      date: booking.date,
      time: booking.time,
      amount: booking.amount.toString(),
      address: booking.address || "",
      notes: booking.notes || "",
    });
  };

  const saveEditBooking = async () => {
    if (!editingBooking) return;
    setSavingEdit(true);
    try {
      setActionError(null);
      const response = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: editForm.customer_name,
          customer_email: editForm.customer_email || null,
          customer_phone: editForm.customer_phone || null,
          service: editForm.service,
          date: editForm.date,
          time: editForm.time,
          amount: parseFloat(editForm.amount) || 0,
          address: editForm.address || null,
          notes: editForm.notes || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to update booking");
      const data = await response.json();
      await loadBookings();
      setSelectedBooking(data.booking);
      setEditingBooking(null);
    } catch (err) {
      console.error("Error updating booking:", err);
      setActionError("Failed to update booking");
    } finally {
      setSavingEdit(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="h-9 w-64 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-[34rem] rounded-2xl bg-gray-200/70 dark:bg-gray-800/70" />
      </div>
    );
  }

  const serviceOptions = editingBooking
    ? Array.from(new Set([...SERVICE_OPTIONS, editingBooking.service]))
    : SERVICE_OPTIONS;

  return (
    <div className="space-y-4 overflow-x-hidden">
      {/* Title row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Calendar
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {rangeStats.total === 0
              ? "No bookings in this period"
              : `${rangeStats.total} booking${rangeStats.total === 1 ? "" : "s"} · £${rangeStats.value.toFixed(2)}${
                  rangeStats.unpaid > 0 ? ` · ${rangeStats.unpaid} unpaid` : ""
                }`}
          </p>
        </div>

        {/* Status filter */}
        <div
          role="tablist"
          aria-label="Filter by status"
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {(["all", ...STATUS_ORDER] as const).map((status) => {
            const active = statusFilter === status;
            const count = status === "all" ? bookings.length : counts[status];
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(status)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                {status !== "all" && (
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : STATUS_META[status].dot}`}
                  />
                )}
                {status === "all" ? "All" : STATUS_META[status].label}
                <span
                  className={`tabular-nums ${active ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          <span className="flex items-center gap-2">
            <Icon path={ICONS.alert} className="h-5 w-5 shrink-0" />
            {error}
          </span>
          <button
            type="button"
            className="font-medium underline underline-offset-2"
            onClick={() => loadBookings()}
          >
            Try again
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200"
        >
          {actionError}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setActionError(null)}
          >
            <Icon path={ICONS.close} className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Calendar card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 px-3 py-3 dark:border-gray-800 sm:px-4">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => shift(-1)}
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Icon path={ICONS.prev} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => shift(1)}
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Icon path={ICONS.next} />
            </button>
            <h2 className="ml-1 truncate text-base font-semibold tracking-tight text-gray-900 dark:text-white sm:text-lg">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
              className="rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Today
            </button>
            <div
              role="tablist"
              aria-label="Calendar view"
              className="inline-flex rounded-full bg-gray-100 p-0.5 dark:bg-gray-800"
            >
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={view === v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                    view === v.id
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              title="Refresh"
              aria-label="Refresh"
              disabled={refreshing}
              onClick={() => loadBookings()}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Icon
                path={ICONS.refresh}
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {view === "month" && (
          <>
            <CalendarMonthGrid
              days={monthDays}
              monthStart={monthStart}
              selectedDate={currentDate}
              getBookingsForDate={getBookingsForDate}
              onSelectDay={(d) => setSelectedDate(format(d, "yyyy-MM-dd"))}
              onOpenBooking={setSelectedBooking}
              onExpandDay={setMultiSlotBookings}
            />
            <CalendarDayPanel
              date={currentDate}
              bookings={getBookingsForDate(currentDate)}
              onOpenBooking={setSelectedBooking}
            />
          </>
        )}

        {view !== "month" && (
          <CalendarTimeGrid
            days={view === "day" ? [currentDate] : weekDays}
            getBookingsForDate={getBookingsForDate}
            onSelectDay={(d) => {
              setSelectedDate(format(d, "yyyy-MM-dd"));
              if (view === "week") setView("day");
            }}
            onOpenBooking={setSelectedBooking}
          />
        )}
      </div>

      {/* Booking details */}
      {selectedBooking && (
        <ModalShell onClose={() => setSelectedBooking(null)}>
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-semibold text-white shadow-sm">
                {selectedBooking.customer_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedBooking.customer_name}
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Icon path={ICONS.clock} className="h-4 w-4" />
                  {format(parseISO(selectedBooking.date), "EEE, d MMM yyyy")} ·{" "}
                  {formatTime(selectedBooking.time)}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSelectedBooking(null)}
              className="-mr-2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <Icon path={ICONS.close} />
            </button>
          </div>

          <div className="space-y-5 p-6">
            <div className="flex flex-wrap gap-2">
              {selectedBooking.customer_phone && (
                <a
                  href={`tel:${selectedBooking.customer_phone}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                >
                  <Icon path={ICONS.phone} className="h-4 w-4" />
                  {selectedBooking.customer_phone}
                </a>
              )}
              {selectedBooking.customer_email && (
                <a
                  href={`mailto:${selectedBooking.customer_email}`}
                  className="inline-flex min-w-0 items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                >
                  <Icon path={ICONS.mail} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{selectedBooking.customer_email}</span>
                </a>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4 ring-1 ring-inset ring-gray-100 dark:bg-gray-800/60 dark:ring-gray-800">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Service
                </p>
                <p className="mt-0.5 truncate font-medium text-gray-900 dark:text-white">
                  {selectedBooking.service}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Amount
                </p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-900 dark:text-white">
                  £{Number(selectedBooking.amount || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label
                  htmlFor="booking-status"
                  className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Status
                </label>
                <select
                  id="booking-status"
                  className={inputClass}
                  value={selectedBooking.status}
                  onChange={(e) =>
                    updateBookingStatus(selectedBooking.id, e.target.value)
                  }
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Payment
                </p>
                <span
                  className={`${BADGE_BASE} px-3 py-2 text-sm ${PAYMENT_BADGE[selectedBooking.payment_status]}`}
                >
                  {selectedBooking.payment_status}
                </span>
              </div>
            </div>

            {selectedBooking.address && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Address
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBooking.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm leading-relaxed text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  <Icon path={ICONS.pin} className="mt-0.5 h-4 w-4 shrink-0" />
                  {selectedBooking.address}
                </a>
              </div>
            )}

            {selectedBooking.notes && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Notes
                </p>
                <p className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-sm leading-relaxed text-gray-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-gray-300">
                  {selectedBooking.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-gray-100 bg-gray-50/70 px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => openEditBooking(selectedBooking)}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </ModalShell>
      )}

      {/* Edit booking */}
      {editingBooking && (
        <ModalShell
          maxWidth="max-w-lg"
          zIndex="z-[60]"
          onClose={() => setEditingBooking(null)}
        >
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit booking
            </h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveEditBooking();
            }}
            className="space-y-4 p-6"
          >
            <div>
              <label className={labelClass}>Customer name</label>
              <input
                type="text"
                required
                className={inputClass}
                value={editForm.customer_name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, customer_name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={editForm.customer_email}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, customer_email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={editForm.customer_phone}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, customer_phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Service</label>
              <select
                required
                className={inputClass}
                value={editForm.service}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, service: e.target.value }))
                }
              >
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input
                  type="time"
                  required
                  className={inputClass}
                  value={editForm.time}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, time: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Amount (£)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={inputClass}
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, amount: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                className={inputClass}
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                rows={2}
                className={inputClass}
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={savingEdit}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* All bookings for a crowded day */}
      {multiSlotBookings && (
        <ModalShell onClose={() => setMultiSlotBookings(null)} maxWidth="max-w-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {format(parseISO(multiSlotBookings[0].date), "EEEE, d MMMM")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {multiSlotBookings.length} bookings
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setMultiSlotBookings(null)}
              className="-mr-2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <Icon path={ICONS.close} />
            </button>
          </div>
          <ul className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
            {multiSlotBookings.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBooking(b);
                    setMultiSlotBookings(null);
                  }}
                  className="relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-gray-200/80 py-3 pl-5 pr-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5"
                >
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_META[b.status].dot}`}
                  />
                  <span className="w-12 shrink-0 font-semibold tabular-nums text-gray-900 dark:text-white">
                    {formatTime(b.time)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-gray-900 dark:text-white">
                      {b.customer_name}
                    </span>
                    <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                      {b.service}
                    </span>
                  </span>
                  <span className={`${BADGE_BASE} ${STATUS_META[b.status].badge}`}>
                    {STATUS_META[b.status].label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </ModalShell>
      )}
    </div>
  );
}
