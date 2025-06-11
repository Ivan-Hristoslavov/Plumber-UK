'use client';

import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

type Booking = {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  amount: number;
};

// Add more diverse dummy bookings for 24/7 calendar
const mockBookings: Booking[] = [
  // June 10: 4 bookings, 2 at 09:00, 1 at 12:00, 1 at 23:00
  {
    id: '1', customerName: 'John Smith', service: 'Emergency Call Out', date: '2024-06-10', time: '09:00', status: 'confirmed', paymentStatus: 'paid', amount: 85,
  },
  {
    id: '2', customerName: 'Anna Lee', service: 'Leak Detection', date: '2024-06-10', time: '09:00', status: 'pending', paymentStatus: 'pending', amount: 65,
  },
  {
    id: '3', customerName: 'Paul Black', service: 'Boiler Service', date: '2024-06-10', time: '12:00', status: 'confirmed', paymentStatus: 'paid', amount: 120,
  },
  {
    id: '4', customerName: 'Night Owl', service: 'Emergency Call Out', date: '2024-06-10', time: '23:00', status: 'confirmed', paymentStatus: 'paid', amount: 150,
  },
  // June 11: 1 booking
  {
    id: '5', customerName: 'Sarah Johnson', service: 'Bathroom Installation', date: '2024-06-11', time: '14:00', status: 'pending', paymentStatus: 'pending', amount: 2500,
  },
  // June 12: 3 bookings, 2 at 11:00, 1 at 18:00
  {
    id: '6', customerName: 'Michael Brown', service: 'Boiler Service', date: '2024-06-12', time: '11:00', status: 'confirmed', paymentStatus: 'paid', amount: 120,
  },
  {
    id: '7', customerName: 'Lisa Green', service: 'Power Flushing', date: '2024-06-12', time: '11:00', status: 'pending', paymentStatus: 'pending', amount: 400,
  },
  {
    id: '8', customerName: 'Late Worker', service: 'Drainage Services', date: '2024-06-12', time: '18:00', status: 'confirmed', paymentStatus: 'paid', amount: 150,
  },
  // June 13: 1 booking
  {
    id: '9', customerName: 'Emily White', service: 'Leak Detection', date: '2024-06-13', time: '16:00', status: 'cancelled', paymentStatus: 'refunded', amount: 65,
  },
  // June 14: 3 bookings, 2 at 10:00, 1 at 13:00
  {
    id: '10', customerName: 'David Green', service: 'Radiator Installation', date: '2024-06-14', time: '10:00', status: 'confirmed', paymentStatus: 'paid', amount: 300,
  },
  {
    id: '11', customerName: 'Night Shift', service: 'Emergency Call Out', date: '2024-06-14', time: '10:00', status: 'pending', paymentStatus: 'pending', amount: 120,
  },
  {
    id: '12', customerName: 'Olivia Black', service: 'Power Flushing', date: '2024-06-14', time: '13:00', status: 'pending', paymentStatus: 'pending', amount: 400,
  },
  // June 15: 1 booking
  {
    id: '13', customerName: 'James Blue', service: 'Gas Safety Certificate', date: '2024-06-15', time: '15:00', status: 'confirmed', paymentStatus: 'paid', amount: 90,
  },
  // June 16: 2 bookings, 1 at 12:00, 1 at 03:00
  {
    id: '14', customerName: 'Sophia Red', service: 'Drainage Services', date: '2024-06-16', time: '12:00', status: 'pending', paymentStatus: 'pending', amount: 150,
  },
  {
    id: '15', customerName: 'Early Bird', service: 'Boiler Service', date: '2024-06-16', time: '03:00', status: 'confirmed', paymentStatus: 'paid', amount: 120,
  },
];

// Set default selected date to the first booking's date
const defaultSelectedDate = mockBookings.length > 0 ? mockBookings[0].date : format(new Date(), 'yyyy-MM-dd');

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(defaultSelectedDate);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [view, setView] = useState<'week' | 'day'>('week');
  const [multiSlotBookings, setMultiSlotBookings] = useState<Booking[] | null>(null);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getBookingsForDate = (date: Date) => {
    return mockBookings.filter(booking => 
      isSameDay(parseISO(booking.date), date)
    );
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                view === 'week' ? 'bg-primary text-white' : 'bg-white text-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                view === 'day' ? 'bg-primary text-white' : 'bg-white text-gray-600'
              }`}
            >
              Day
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-medium">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow">
        {/* Time slots header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 border-r"></div>
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              className={`p-4 text-center border-r ${
                isSameDay(day, new Date()) ? 'bg-primary/5' : ''
              }`}
            >
              <div className="font-medium">{format(day, 'EEE')}</div>
              <div className="text-sm text-gray-500">{format(day, 'MMM d')}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
            <div className="p-4 border-r text-sm text-gray-500">
              {format(new Date().setHours(hour, 0), 'HH:00')}
            </div>
            {weekDays.map((day) => {
              const bookings = getBookingsForDate(day).filter(
                booking => parseInt(booking.time.split(':')[0]) === hour
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
                        onClick={() => setSelectedBooking(bookings[0])}
                        className="w-full p-2 mb-2 text-left rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <div className="text-sm font-medium">{bookings[0].customerName}</div>
                        <div className="text-xs text-gray-600">{bookings[0].service}</div>
                        <div className="text-xs text-gray-600">{bookings[0].time}</div>
                        <div className="flex space-x-1 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(bookings[0].status)}`}>{bookings[0].status}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${getPaymentStatusColor(bookings[0].paymentStatus)}`}>{bookings[0].paymentStatus}</span>
                        </div>
                      </button>
                      {bookings.length > 1 && (
                        <button
                          onClick={() => setMultiSlotBookings(bookings)}
                          className="w-full p-1 text-xs text-center rounded bg-gray-100 hover:bg-gray-200 border border-gray-200"
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
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <div className="mt-1 text-gray-900">{selectedBooking.customerName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service</label>
                  <div className="mt-1 text-gray-900">{selectedBooking.service}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <div className="mt-1 text-gray-900">{selectedBooking.date}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <div className="mt-1 text-gray-900">{selectedBooking.time}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded text-sm ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                        {selectedBooking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 text-gray-900">£{selectedBooking.amount}</div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Handle status update
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                >
                  Update Status
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
                  onClick={() => setMultiSlotBookings(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {multiSlotBookings.map((booking) => (
                  <div key={booking.id} className="border rounded p-3 mb-2 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-xs text-gray-600">{booking.service}</div>
                        <div className="text-xs text-gray-600">{booking.time}</div>
                        <div className="flex space-x-1 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(booking.status)}`}>{booking.status}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${getPaymentStatusColor(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setMultiSlotBookings(null);
                        }}
                        className="ml-2 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setMultiSlotBookings(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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