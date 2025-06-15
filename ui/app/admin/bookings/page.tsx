'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';

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

// Mock data - replace with actual API calls
const mockBookings: Booking[] = [
  {
    id: '1',
    customerName: 'John Smith',
    service: 'Call-out & Hourly Labour Rates',
    date: '2024-03-20',
    time: '09:00',
    status: 'scheduled',
    paymentStatus: 'paid',
    amount: 80,
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    service: 'Full-Day Booking Rates',
    date: '2024-03-20',
    time: '14:00',
    status: 'scheduled',
    paymentStatus: 'pending',
    amount: 520,
  },
  // Add more mock bookings as needed
];

export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
    search: '',
  });

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

  const filteredBookings = mockBookings.filter(booking => {
    const matchesStatus = filters.status === 'all' || booking.status === filters.status;
    const matchesPayment = filters.paymentStatus === 'all' || booking.paymentStatus === filters.paymentStatus;
    const matchesSearch = booking.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         booking.service.toLowerCase().includes(filters.search.toLowerCase());
    
    // Add date range filtering logic here if needed
    
    return matchesStatus && matchesPayment && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <button
          onClick={() => {/* Handle new booking */}}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
        >
          New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search bookings..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.service}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(parseISO(booking.date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    £{booking.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit
                      }}
                      className="text-primary hover:text-primary-dark mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                    <div className="mt-1 text-gray-900">
                      {format(parseISO(selectedBooking.date), 'MMM d, yyyy')}
                    </div>
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
    </div>
  );
} 