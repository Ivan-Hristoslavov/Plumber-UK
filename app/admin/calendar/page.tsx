"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, isSameDay, isSameMonth, parseISO, eachDayOfInterval } from "date-fns";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "pending";
  payment_status: "pending" | "paid" | "refunded";
  amount: number;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [multiSlotBookings, setMultiSlotBookings] = useState<Booking[] | null>(
    null
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service: "",
    date: "",
    time: "",
    amount: "",
    address: "",
    notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const currentDate = parseISO(selectedDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthStart = startOfMonth(currentDate);
  const firstDisplayDay = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthCalendarDays = Array.from({ length: 42 }, (_, i) => addDays(firstDisplayDay, i));

  // Load bookings from Supabase
  useEffect(() => {
    loadBookings();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadBookings, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/bookings");

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDate = (date: Date) => {
    let filteredBookings = bookings.filter((booking) =>
      isSameDay(parseISO(booking.date), date)
    );

    if (statusFilter !== "all") {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === statusFilter
      );
    }

    return filteredBookings;
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300";
      case "completed":
        return "bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: Booking["payment_status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300";
      case "refunded":
        return "bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const data = await response.json();
        await loadBookings();
        if (selectedBooking?.id === bookingId && data?.booking) {
          setSelectedBooking(data.booking);
        }
      } else throw new Error("Failed to update booking status");
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError("Failed to update booking status");
    }
  };

  const openEditBooking = (booking: Booking) => {
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

  const closeEditBooking = () => {
    setEditingBooking(null);
  };

  const saveEditBooking = async () => {
    if (!editingBooking) return;
    setSavingEdit(true);
    try {
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
      if (response.ok) {
        const data = await response.json();
        await loadBookings();
        setSelectedBooking(data.booking);
        setEditingBooking(null);
      } else throw new Error("Failed to update booking");
    } catch (err) {
      console.error("Error updating booking:", err);
      setError("Failed to update booking");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary-light" />
          <span className="ml-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors duration-300">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 dark:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300 transition-colors duration-300">
                Error loading calendar
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400 transition-colors duration-300">{error}</p>
              <button
                className="mt-2 text-sm text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 underline transition-colors duration-300"
                onClick={loadBookings}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Calendar</h1>
          <div className="flex space-x-1 sm:space-x-2">
            <button
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "month"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "week"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "day"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setView("day")}
            >
              Day
            </button>
          </div>
        </div>
        
        {/* Mobile-friendly controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Bookings ({bookings.length})</option>
            <option value="pending">
              Pending ({bookings.filter((b) => b.status === "pending").length})
            </option>
            <option value="scheduled">
              Scheduled ({bookings.filter((b) => b.status === "scheduled").length})
            </option>
            <option value="completed">
              Completed ({bookings.filter((b) => b.status === "completed").length})
            </option>
            <option value="cancelled">
              Cancelled ({bookings.filter((b) => b.status === "cancelled").length})
            </option>
          </select>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="flex items-center justify-center gap-2 flex-1 sm:flex-initial">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors shrink-0"
              onClick={() => {
                const d = parseISO(selectedDate);
                const next = view === "month" ? addMonths(d, -1) : view === "week" ? addWeeks(d, -1) : addDays(d, -1);
                setSelectedDate(format(next, "yyyy-MM-dd"));
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </button>
            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap tabular-nums">
              {view === "month"
                ? format(monthStart, "MMMM yyyy")
                : view === "day"
                  ? format(currentDate, "EEE, MMM d, yyyy")
                  : `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}`}
            </span>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors shrink-0"
              onClick={() => {
                const d = parseISO(selectedDate);
                const next = view === "month" ? addMonths(d, 1) : view === "week" ? addWeeks(d, 1) : addDays(d, 1);
                setSelectedDate(format(next, "yyyy-MM-dd"));
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-2 text-sm font-medium text-primary dark:text-primary-light border border-primary dark:border-primary-light rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary-light/20 transition-colors duration-300"
              onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
            >
              Today
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              disabled={loading}
              title="Refresh calendar"
              onClick={loadBookings}
            >
              <svg
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-300 overflow-hidden">
        {/* Month View */}
        {view === "month" && (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {d}
                </div>
              ))}
              {monthCalendarDays.map((day) => {
                const dayBookings = getBookingsForDate(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[80px] sm:min-h-[100px] p-2 bg-white dark:bg-gray-800 ${
                      !isCurrentMonth ? "opacity-40" : ""
                    } ${isSameDay(day, new Date()) ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                  >
                    <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5 overflow-y-auto max-h-[70px] sm:max-h-[85px]">
                      {dayBookings.slice(0, 3).map((b) => (
                        <button
                          key={b.id}
                          className="w-full text-left p-1 rounded text-xs truncate bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                          onClick={() => setSelectedBooking(b)}
                        >
                          {b.time} {b.customer_name}
                        </button>
                      ))}
                      {dayBookings.length > 3 && (
                        <button
                          className="w-full text-xs text-center text-gray-500 hover:text-blue-600"
                          onClick={() => setMultiSlotBookings(dayBookings)}
                        >
                          +{dayBookings.length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View & Day View - Time slot grid */}
        {(view === "week" || view === "day") && (
          <div className="w-full overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto">
            <div
              className="grid w-full border-b dark:border-gray-700"
              style={{
                gridTemplateColumns: view === "day"
                  ? "4rem 1fr"
                  : "4rem repeat(7, minmax(0, 1fr))",
              }}
            >
              {/* Header row: time cell + day cells */}
              <div className="p-2 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50" />
              {(view === "day" ? [currentDate] : weekDays).map((day) => (
                <div
                  key={day.toString()}
                  className={`p-2 text-center border-r dark:border-gray-700 min-w-0 ${
                    isSameDay(day, new Date())
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "bg-gray-50 dark:bg-gray-800/50"
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                    {format(day, "EEE")}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(day, "MMM d")}
                  </div>
                </div>
              ))}
            </div>

            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
              <div
                key={hour}
                className="grid w-full border-b dark:border-gray-700 last:border-b-0"
                style={{
                  gridTemplateColumns: view === "day"
                    ? "4rem 1fr"
                    : "4rem repeat(7, minmax(0, 1fr))",
                }}
              >
                <div className="p-2 border-r dark:border-gray-700 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 shrink-0">
                  {format(new Date(2000, 0, 1, hour, 0), "HH:mm")}
                </div>
                {(view === "day" ? [currentDate] : weekDays).map((day) => {
                  const slotBookings = getBookingsForDate(day).filter((b) => {
                    const h = parseInt(b.time?.split(":")[0] || "0", 10);
                    return !isNaN(h) && h === hour;
                  });
                  return (
                    <div
                      key={day.toString()}
                      className="p-1 sm:p-2 border-r dark:border-gray-700 min-h-[50px] sm:min-h-[80px] min-w-0 overflow-hidden"
                    >
                        {slotBookings.length > 0 && (
                          <div className="space-y-1">
                            <button
                              className="w-full p-1 sm:p-2 text-left rounded-lg text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                              onClick={() => setSelectedBooking(slotBookings[0])}
                            >
                              <div className="font-medium truncate">{slotBookings[0].customer_name}</div>
                              <div className="text-gray-600 dark:text-gray-400 truncate">{slotBookings[0].service}</div>
                            </button>
                            {slotBookings.length > 1 && (
                              <button
                                className="w-full p-1 text-xs text-center rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                                onClick={() => setMultiSlotBookings(slotBookings)}
                              >
                                +{slotBookings.length - 1} more
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-colors duration-300 border border-gray-200/50 dark:border-gray-700/50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-white">Booking Details</h2>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {format(parseISO(selectedBooking.date), "EEEE, MMM d, yyyy")} · {selectedBooking.time}
                  </p>
                </div>
                <button
                  className="p-2 rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-colors -m-2"
                  onClick={() => setSelectedBooking(null)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Customer */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    {selectedBooking.customer_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{selectedBooking.customer_name}</p>
                  {selectedBooking.customer_email && (
                    <a
                      href={`mailto:${selectedBooking.customer_email}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {selectedBooking.customer_email}
                    </a>
                  )}
                  {selectedBooking.customer_phone && (
                    <a
                      href={`tel:${selectedBooking.customer_phone}`}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 truncate block"
                    >
                      {selectedBooking.customer_phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Service & Amount */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/50">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Service</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{selectedBooking.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">£{selectedBooking.amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Status & Payment */}
              <div className="flex flex-wrap gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Status</p>
                  <select
                    className="px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={selectedBooking.status}
                    onChange={(e) => updateBookingStatus(selectedBooking.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Payment</p>
                  <span className={`inline-flex px-3 py-2 rounded-lg text-sm font-medium ${getPaymentStatusColor(selectedBooking.payment_status)}`}>
                    {selectedBooking.payment_status}
                  </span>
                </div>
              </div>

              {/* Address */}
              {selectedBooking.address && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Address</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{selectedBooking.address}</p>
                </div>
              )}

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Notes</p>
                  <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex gap-2">
              <button
                className="flex-1 py-2.5 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                onClick={() => openEditBooking(selectedBooking)}
              >
                Edit
              </button>
              <button
                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full my-8 overflow-hidden transition-colors duration-300 border border-gray-200/50 dark:border-gray-700/50">
            <div className="px-6 py-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Booking</h2>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); saveEditBooking(); }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={editForm.customer_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, customer_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={editForm.customer_email}
                  onChange={(e) => setEditForm((p) => ({ ...p, customer_email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={editForm.customer_phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, customer_phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={editForm.service}
                  onChange={(e) => setEditForm((p) => ({ ...p, service: e.target.value }))}
                >
                  <option value="Leak Detection">Leak Detection</option>
                  <option value="Pipe Repair">Pipe Repair</option>
                  <option value="Drain Cleaning">Drain Cleaning</option>
                  <option value="Emergency Plumbing">Emergency Plumbing</option>
                  <option value="Boiler Service">Boiler Service</option>
                  <option value="Bathroom Installation">Bathroom Installation</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={editForm.date}
                    onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={editForm.time}
                    onChange={(e) => setEditForm((p) => ({ ...p, time: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (£)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={editForm.amount}
                  onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={editForm.address}
                  onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={closeEditBooking}
                  className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-booking Modal */}
      {multiSlotBookings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full transition-colors duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Bookings for this slot</h2>
                <button
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
                  onClick={() => setMultiSlotBookings(null)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {multiSlotBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border dark:border-gray-700 rounded p-3 mb-2 bg-gray-50 dark:bg-gray-700 transition-colors duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                          {booking.customer_name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          {booking.service}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          {booking.time}
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${getPaymentStatusColor(booking.payment_status)}`}
                          >
                            {booking.payment_status}
                          </span>
                        </div>
                      </div>
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-300"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setMultiSlotBookings(null);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                  onClick={() => setMultiSlotBookings(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
