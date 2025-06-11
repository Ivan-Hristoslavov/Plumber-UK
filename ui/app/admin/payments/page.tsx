'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';

type Payment = {
  id: string;
  bookingId: string;
  customerName: string;
  service: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod: 'card' | 'cash' | 'bank_transfer';
  reference: string;
};

// Mock data - replace with actual API calls
const mockPayments: Payment[] = [
  {
    id: '1',
    bookingId: '1',
    customerName: 'John Smith',
    service: 'Emergency Call Out',
    date: '2024-03-20',
    amount: 85,
    status: 'paid',
    paymentMethod: 'card',
    reference: 'PAY-123456',
  },
  {
    id: '2',
    bookingId: '2',
    customerName: 'Sarah Johnson',
    service: 'Bathroom Installation',
    date: '2024-03-20',
    amount: 2500,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    reference: 'PAY-123457',
  },
  // Add more mock payments as needed
];

type FinancialSummary = {
  totalRevenue: number;
  pendingPayments: number;
  averageTransaction: number;
  monthlyGrowth: number;
};

// Mock financial summary - replace with actual calculations
const mockFinancialSummary: FinancialSummary = {
  totalRevenue: 12500,
  pendingPayments: 3500,
  averageTransaction: 450,
  monthlyGrowth: 15.5,
};

// Dummy customers and bookings for selection
const mockCustomers = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
];
const mockBookings = [
  { id: '1', customerId: '1', service: 'Emergency Call Out', amount: 85 },
  { id: '2', customerId: '2', service: 'Bathroom Installation', amount: 2500 },
];

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    search: '',
  });
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    customerId: '',
    bookingId: '',
    amount: '',
    paymentMethod: 'cash',
    date: format(new Date(), 'yyyy-MM-dd'),
    reference: '',
    status: 'paid',
  });
  const [formError, setFormError] = useState('');
  const [payments, setPayments] = useState(mockPayments);

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: Payment['paymentMethod']) => {
    switch (method) {
      case 'card':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'cash':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'bank_transfer':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filters.status === 'all' || payment.status === filters.status;
    const matchesMethod = filters.paymentMethod === 'all' || payment.paymentMethod === filters.paymentMethod;
    const matchesSearch = payment.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         payment.reference.toLowerCase().includes(filters.search.toLowerCase());
    
    // Add date range filtering logic here if needed
    
    return matchesStatus && matchesMethod && matchesSearch;
  });

  // Filter bookings by selected customer
  const filteredBookings = newPayment.customerId
    ? mockBookings.filter(b => b.customerId === newPayment.customerId)
    : [];

  // Autofill amount when booking is selected
  useEffect(() => {
    const booking = mockBookings.find(b => b.id === newPayment.bookingId);
    if (booking) setNewPayment(np => ({ ...np, amount: booking.amount.toString() }));
  }, [newPayment.bookingId]);

  // Handle form submit
  function handleRecordPayment(e) {
    e.preventDefault();
    setFormError('');
    if (!newPayment.customerId || !newPayment.bookingId || !newPayment.amount || !newPayment.paymentMethod || !newPayment.date) {
      setFormError('Please fill in all required fields.');
      return;
    }
    const customer = mockCustomers.find(c => c.id === newPayment.customerId);
    const booking = mockBookings.find(b => b.id === newPayment.bookingId);
    setPayments([
      ...payments,
      {
        id: (payments.length + 1).toString(),
        bookingId: newPayment.bookingId,
        customerName: customer?.name || '',
        service: booking?.service || '',
        date: newPayment.date,
        amount: parseFloat(newPayment.amount),
        status: newPayment.status,
        paymentMethod: newPayment.paymentMethod,
        reference: newPayment.reference,
      },
    ]);
    setShowRecordModal(false);
    setNewPayment({
      customerId: '',
      bookingId: '',
      amount: '',
      paymentMethod: 'cash',
      date: format(new Date(), 'yyyy-MM-dd'),
      reference: '',
      status: 'paid',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <button
          onClick={() => setShowRecordModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
        >
          Record Payment
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">£{mockFinancialSummary.totalRevenue}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+{mockFinancialSummary.monthlyGrowth}% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">£{mockFinancialSummary.pendingPayments}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">Awaiting confirmation</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Transaction</p>
              <p className="text-2xl font-bold text-gray-900">£{mockFinancialSummary.averageTransaction}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">Per booking</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">98.5%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+0.5% from last month</span>
          </div>
        </div>
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
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="all">All Methods</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
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
              placeholder="Search payments..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.reference}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.service}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(parseISO(payment.date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    £{payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-900">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span className="ml-2 text-sm">
                        {payment.paymentMethod.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
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
                        // Handle refund
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Payment Details</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference</label>
                  <div className="mt-1 text-gray-900">{selectedPayment.reference}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <div className="mt-1 text-gray-900">{selectedPayment.customerName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service</label>
                  <div className="mt-1 text-gray-900">{selectedPayment.service}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <div className="mt-1 text-gray-900">
                    {format(parseISO(selectedPayment.date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 text-gray-900">£{selectedPayment.amount}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <div className="mt-1 flex items-center text-gray-900">
                    {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                    <span className="ml-2">
                      {selectedPayment.paymentMethod.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedPayment.status === 'paid' && (
                  <button
                    onClick={() => {
                      // Handle refund
                      setSelectedPayment(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Process Refund
                  </button>
                )}
                {selectedPayment.status === 'pending' && (
                  <button
                    onClick={() => {
                      // Handle mark as paid
                      setSelectedPayment(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form className="p-6 space-y-4" onSubmit={handleRecordPayment}>
              <h2 className="text-xl font-bold mb-2">Record Payment</h2>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer<span className="text-red-500">*</span></label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={newPayment.customerId}
                  onChange={e => setNewPayment(np => ({ ...np, customerId: e.target.value, bookingId: '' }))}
                  required
                >
                  <option value="">Select customer</option>
                  {mockCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Booking<span className="text-red-500">*</span></label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={newPayment.bookingId}
                  onChange={e => setNewPayment(np => ({ ...np, bookingId: e.target.value }))}
                  required
                  disabled={!newPayment.customerId}
                >
                  <option value="">Select booking</option>
                  {filteredBookings.map(b => (
                    <option key={b.id} value={b.id}>{b.service} (£{b.amount})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount<span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={newPayment.amount}
                  onChange={e => setNewPayment(np => ({ ...np, amount: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method<span className="text-red-500">*</span></label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={newPayment.paymentMethod}
                  onChange={e => setNewPayment(np => ({ ...np, paymentMethod: e.target.value }))}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Date<span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={newPayment.date}
                  onChange={e => setNewPayment(np => ({ ...np, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference/Notes</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={newPayment.reference}
                  onChange={e => setNewPayment(np => ({ ...np, reference: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status<span className="text-red-500">*</span></label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={newPayment.status}
                  onChange={e => setNewPayment(np => ({ ...np, status: e.target.value }))}
                  required
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 