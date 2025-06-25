"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";

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
  const [view, setView] = useState<"week" | "day">("week");
  const [multiSlotBookings, setMultiSlotBookings] = useState<Booking[] | null>(
    null
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: Booking["payment_status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await loadBookings(); // Reload bookings
        setSelectedBooking(null);
      } else {
        throw new Error("Failed to update booking status");
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError("Failed to update booking status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-2 text-gray-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
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
              <h3 className="text-sm font-medium text-red-800">
                Error loading calendar
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
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
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                view === "week"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600"
              }`}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                view === "day"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600"
              }`}
              onClick={() => setView("day")}
            >
              Day
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Bookings ({bookings.length})</option>
              <option value="pending">
                Pending ({bookings.filter((b) => b.status === "pending").length}
                )
              </option>
              <option value="scheduled">
                Scheduled (
                {bookings.filter((b) => b.status === "scheduled").length})
              </option>
              <option value="completed">
                Completed (
                {bookings.filter((b) => b.status === "completed").length})
              </option>
              <option value="cancelled">
                Cancelled (
                {bookings.filter((b) => b.status === "cancelled").length})
              </option>
            </select>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 rounded border border-yellow-200" />
                <span className="text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 rounded border border-blue-200" />
                <span className="text-gray-600">Scheduled</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 rounded border border-green-200" />
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 rounded border border-red-200" />
                <span className="text-gray-600">Cancelled</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() =>
              setSelectedDate(
                format(addDays(parseISO(selectedDate), -7), "yyyy-MM-dd")
              )
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
          <span className="text-lg font-medium">
            {format(weekStart, "MMM d")} -{" "}
            {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
          <button
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() =>
              setSelectedDate(
                format(addDays(parseISO(selectedDate), 7), "yyyy-MM-dd")
              )
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
          <button
            className="px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
          >
            Today
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
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

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow">
        {/* Time slots header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 border-r" />
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              className={`p-4 text-center border-r ${
                isSameDay(day, new Date()) ? "bg-primary/5" : ""
              }`}
            >
              <div className="font-medium">{format(day, "EEE")}</div>
              <div className="text-sm text-gray-500">
                {format(day, "MMM d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots - Show only working hours (8 AM to 6 PM) */}
        {Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
            <div className="p-4 border-r text-sm text-gray-500">
              {format(new Date().setHours(hour, 0), "HH:00")}
            </div>
            {weekDays.map((day) => {
              const bookings = getBookingsForDate(day).filter(
                (booking) => parseInt(booking.time.split(":")[0]) === hour
              );

              return (
                <div
                  key={day.toString()}
                  className="p-2 border-r min-h-[100px] relative"
                >
                  {bookings.length > 0 && (
                    <>
                      <button
                        key={bookings[0].id}
                        className={`w-full p-2 mb-2 text-left rounded-lg transition-colors ${
                          bookings[0].status === "completed"
                            ? "bg-green-50 hover:bg-green-100 border border-green-200"
                            : bookings[0].status === "cancelled"
                              ? "bg-red-50 hover:bg-red-100 border border-red-200"
                              : bookings[0].status === "pending"
                                ? "bg-yellow-50 hover:bg-yellow-100 border border-yellow-200"
                                : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                        }`}
                        onClick={() => setSelectedBooking(bookings[0])}
                      >
                        <div className="text-sm font-medium">
                          {bookings[0].customer_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {bookings[0].service}
                        </div>
                        <div className="text-xs text-gray-600">
                          {bookings[0].time}
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(bookings[0].status)}`}
                          >
                            {bookings[0].status}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${getPaymentStatusColor(bookings[0].payment_status)}`}
                          >
                            {bookings[0].payment_status}
                          </span>
                        </div>
                      </button>
                      {bookings.length > 1 && (
                        <button
                          className="w-full p-1 text-xs text-center rounded bg-gray-100 hover:bg-gray-200 border border-gray-200"
                          onClick={() => setMultiSlotBookings(bookings)}
                        >
                          +{bookings.length - 1} more
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Booking Details</h2>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setSelectedBooking(null)}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer
                  </label>
                  <div className="mt-1 text-gray-900">
                    {selectedBooking.customer_name}
                  </div>
                  {selectedBooking.customer_email && (
                    <div className="text-sm text-gray-600">
                      {selectedBooking.customer_email}
                    </div>
                  )}
                  {selectedBooking.customer_phone && (
                    <div className="text-sm text-gray-600">
                      {selectedBooking.customer_phone}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Service
                  </label>
                  <div className="mt-1 text-gray-900">
                    {selectedBooking.service}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <div className="mt-1 text-gray-900">
                      {format(parseISO(selectedBooking.date), "MMM dd, yyyy")}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Time
                    </label>
                    <div className="mt-1 text-gray-900">
                      {selectedBooking.time}
                    </div>
                  </div>
                </div>
                {selectedBooking.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <div className="mt-1 text-gray-900">
                      {selectedBooking.address}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={selectedBooking.status}
                        onChange={(e) =>
                          updateBookingStatus(
                            selectedBooking.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment
                    </label>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-1 rounded text-sm ${getPaymentStatusColor(selectedBooking.payment_status)}`}
                      >
                        {selectedBooking.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <div className="mt-1 text-gray-900">
                    £{selectedBooking.amount.toFixed(2)}
                  </div>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <div className="mt-1 text-gray-900 bg-gray-50 p-2 rounded text-sm">
                      {selectedBooking.notes}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-booking Modal */}
      {multiSlotBookings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Bookings for this slot</h2>
                <button
                  className="text-gray-400 hover:text-gray-500"
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
                    className="border rounded p-3 mb-2 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {booking.customer_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {booking.service}
                        </div>
                        <div className="text-xs text-gray-600">
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
                        className="ml-2 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
