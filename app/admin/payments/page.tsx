"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

type Payment = {
  id: string;
  booking_id: string | null;
  customer_id: string | null;
  amount: number;
  payment_method: "cash" | "card" | "bank_transfer" | "cheque";
  payment_status: "pending" | "paid" | "refunded" | "failed";
  payment_date: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
    email: string;
  };
  bookings?: {
    service: string;
    date: string;
    customer_name: string;
  };
};

type Customer = {
  id: string;
  name: string;
  email: string;
  address: string;
  customer_type: string;
};

type Booking = {
  id: string;
  customer_id: string;
  customer_name: string;
  service: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  payment_status: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );

  const [filters, setFilters] = useState({
    status: "all",
    paymentMethod: "all",
    search: "",
  });

  const [newPayment, setNewPayment] = useState({
    customer_id: "",
    booking_id: "",
    amount: "",
    payment_method: "cash" as const,
    payment_date: format(new Date(), "yyyy-MM-dd"),
    reference: "",
    notes: "",
  });

  const [paymentLink, setPaymentLink] = useState({
    customer_id: "",
    booking_id: "",
    amount: "",
    description: "",
    currency: "gbp",
  });

  const [formError, setFormError] = useState("");
  const [paymentLinkResult, setPaymentLinkResult] = useState<any>(null);
  const [showPaymentLinkResult, setShowPaymentLinkResult] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, customersRes, bookingsRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/customers"),
        fetch("/api/bookings"),
      ]);

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();

        setPayments(paymentsData);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();

        setCustomers(customersData);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();

        setBookings(bookingsData.bookings || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newPayment.customer_id || !newPayment.amount) {
      setFormError("Please fill in all required fields.");

      return;
    }

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPayment,
          amount: parseFloat(newPayment.amount),
        }),
      });

      if (response.ok) {
        await loadData();
        setShowCreateModal(false);
        setNewPayment({
          customer_id: "",
          booking_id: "",
          amount: "",
          payment_method: "cash",
          payment_date: format(new Date(), "yyyy-MM-dd"),
          reference: "",
          notes: "",
        });
      } else {
        const error = await response.json();

        setFormError(error.error || "Failed to create payment");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      setFormError("Failed to create payment");
    }
  };

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!paymentLink.customer_id || !paymentLink.amount) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      setProcessingPayment("creating");

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "create_payment_link",
          ...paymentLink,
          amount: parseFloat(paymentLink.amount),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowPaymentLinkModal(false);
        setPaymentLink({
          customer_id: "",
          booking_id: "",
          amount: "",
          description: "",
          currency: "gbp",
        });

        // Copy link to clipboard
        if (result.checkout_url) {
          await navigator.clipboard.writeText(result.checkout_url);
        }

        // Show success modal
        setPaymentLinkResult(result);
        setShowPaymentLinkResult(true);
        
        // Reload payments
        loadData();
      } else {
        const error = await response.json();
        setFormError(error.error || "Failed to create payment link");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      setFormError("An unexpected error occurred");
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status: Payment["payment_status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300";
      case "refunded":
        return "bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300";
      case "failed":
        return "bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getPaymentMethodIcon = (method: Payment["payment_method"]) => {
    switch (method) {
      case "card":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        );
      case "cash":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        );
      case "bank_transfer":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        );
      case "cheque":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        );
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus =
      filters.status === "all" || payment.payment_status === filters.status;
    const matchesMethod =
      filters.paymentMethod === "all" ||
      payment.payment_method === filters.paymentMethod;
    const matchesSearch =
      (payment.customers?.name || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      (payment.reference || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesStatus && matchesMethod && matchesSearch;
  });

  // Calculate financial summary
  const financialSummary = {
    totalRevenue: payments
      .filter((p) => p.payment_status === "paid")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments
      .filter((p) => p.payment_status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.length,
    averageTransaction:
      payments.length > 0
        ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
        : 0,
  };

  // Filter bookings for selected customer
  const filteredBookings = newPayment.customer_id
    ? bookings.filter((b) => b.customer_id === newPayment.customer_id)
    : [];

  const filteredBookingsForLink = paymentLink.customer_id
    ? bookings.filter((b) => b.customer_id === paymentLink.customer_id)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-light" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Payments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
              Manage and track all payment transactions.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
              onClick={() => setShowPaymentLinkModal(true)}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Create Payment Link
            </button>
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
              onClick={() => setShowCreateModal(true)}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Record Payment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Payment Method
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  value={filters.paymentMethod}
                  onChange={(e) =>
                    setFilters({ ...filters, paymentMethod: e.target.value })
                  }
                >
                  <option value="all">All</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
            <div className="flex-1 md:max-w-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                Search
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  placeholder="Search by reference or customer..."
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                {financialSummary.totalPayments}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full transition-colors duration-300">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Average Transaction
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                £{financialSummary.averageTransaction.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full transition-colors duration-300">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
            <span className="ml-3 text-gray-600 dark:text-gray-400 transition-colors duration-300">Loading payments...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Get started by recording a new payment.
            </p>
            <div className="mt-6">
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                onClick={() => setShowCreateModal(true)}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Record Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              <thead className="bg-gray-50 dark:bg-gray-700/50 transition-colors duration-300">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300"
                    scope="col"
                  >
                    Reference
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300"
                    scope="col"
                  >
                    Customer
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300"
                    scope="col"
                  >
                    Amount
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300"
                    scope="col"
                  >
                    Method
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300"
                    scope="col"
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300"
                    scope="col"
                  >
                    Date
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300"
                    scope="col"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      {payment.reference || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {payment.customers?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white transition-colors duration-300">
                      £{payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      <div className="flex items-center">
                        <span className="mr-2">{getPaymentMethodIcon(payment.payment_method)}</span>
                        <span className="capitalize">{payment.payment_method.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.payment_status
                        )}`}
                      >
                        <span className="capitalize">{payment.payment_status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {format(new Date(payment.payment_date), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors duration-300"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
              onClick={() => setShowCreateModal(false)}
            />
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full transition-colors duration-300">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4 transition-colors duration-300">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white transition-colors duration-300">
                  Record New Payment
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Customer
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={newPayment.customer_id}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          customer_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Booking (Optional)
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={newPayment.booking_id}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          booking_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a booking</option>
                      {bookings
                        .filter(
                          (booking) =>
                            booking.customer_id === newPayment.customer_id
                        )
                        .map((booking) => (
                          <option key={booking.id} value={booking.id}>
                            {booking.service} - {format(new Date(booking.date), "dd MMM yyyy")}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Amount
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm transition-colors duration-300">£</span>
                      </div>
                      <input
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPayment.amount}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Payment Method
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={newPayment.payment_method}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          payment_method: e.target.value as any,
                        })
                      }
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Payment Date
                    </label>
                    <input
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="date"
                      value={newPayment.payment_date}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          payment_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Reference (Optional)
                    </label>
                    <input
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={newPayment.reference}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          reference: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Notes (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      rows={3}
                      value={newPayment.notes}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                  {formError && (
                    <div className="p-4 mt-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors duration-300">
                      {formError}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse transition-colors duration-300">
                <button
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  onClick={handleCreatePayment}
                >
                  Create Payment
                </button>
                <button
                  className="mt-3 inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Payment Link Modal */}
      {showPaymentLinkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
              onClick={() => setShowPaymentLinkModal(false)}
            />
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full transition-colors duration-300">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4 transition-colors duration-300">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white transition-colors duration-300">
                  Create Payment Link
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Customer
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={paymentLink.customer_id}
                      onChange={(e) =>
                        setPaymentLink({
                          ...paymentLink,
                          customer_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Booking (Optional)
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={paymentLink.booking_id}
                      onChange={(e) =>
                        setPaymentLink({
                          ...paymentLink,
                          booking_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a booking</option>
                      {bookings
                        .filter(
                          (booking) =>
                            booking.customer_id === paymentLink.customer_id
                        )
                        .map((booking) => (
                          <option key={booking.id} value={booking.id}>
                            {booking.service} - {format(new Date(booking.date), "dd MMM yyyy")}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Amount
                    </label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div className="col-span-1">
                        <select
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          value={paymentLink.currency}
                          onChange={(e) =>
                            setPaymentLink({
                              ...paymentLink,
                              currency: e.target.value,
                            })
                          }
                        >
                          <option value="gbp">£ GBP</option>
                          <option value="usd">$ USD</option>
                          <option value="eur">€ EUR</option>
                          <option value="cad">C$ CAD</option>
                          <option value="aud">A$ AUD</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={paymentLink.amount}
                          onChange={(e) =>
                            setPaymentLink({
                              ...paymentLink,
                              amount: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      rows={3}
                      value={paymentLink.description}
                      onChange={(e) =>
                        setPaymentLink({
                          ...paymentLink,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  {formError && (
                    <div className="p-4 mt-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors duration-300">
                      {formError}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse transition-colors duration-300">
                <button
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  onClick={handleCreatePaymentLink}
                  disabled={processingPayment === "creating"}
                >
                  {processingPayment === "creating" ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          fill="currentColor"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Link"
                  )}
                </button>
                <button
                  className="mt-3 inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                  onClick={() => setShowPaymentLinkModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Details
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedPayment(null)}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Customer
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.customers?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Amount
                  </label>
                  <p className="text-sm text-gray-900">
                    £{selectedPayment.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.payment_status)}`}
                  >
                    {selectedPayment.payment_status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Method
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedPayment.payment_method.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {format(
                      new Date(selectedPayment.payment_date),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Reference
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.reference || "N/A"}
                  </p>
                </div>
              </div>

              {selectedPayment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Notes
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.notes}
                  </p>
                </div>
              )}

              {selectedPayment.bookings && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Service
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.bookings.service}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(
                      new Date(selectedPayment.bookings.date),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
