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
  });

  const [formError, setFormError] = useState("");

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
      setFormError("Please fill in all required fields.");

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
        const data = await response.json();

        if (data.checkout_url) {
          // Show success message with payment link
          const message = `Payment link created successfully!\n\nCheckout URL: ${data.checkout_url}\n\nExpires: ${new Date(data.expires_at * 1000).toLocaleString()}\n\nYou can copy this link and send it to the customer.`;

          if (
            confirm(
              `${message}\n\nWould you like to open the payment link in a new tab?`
            )
          ) {
            window.open(data.checkout_url, "_blank");
          }

          // Copy to clipboard
          navigator.clipboard
            .writeText(data.checkout_url)
            .then(() => {
              alert("Payment link copied to clipboard!");
            })
            .catch(() => {
              console.log("Could not copy to clipboard");
            });

          await loadData();
          setShowPaymentLinkModal(false);
          setPaymentLink({
            customer_id: "",
            booking_id: "",
            amount: "",
            description: "",
          });
        }
      } else {
        const error = await response.json();

        setFormError(error.error || "Failed to create payment link");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      setFormError("Failed to create payment link");
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status: Payment["payment_status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <div className="flex space-x-3">
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            onClick={() => setShowPaymentLinkModal(true)}
          >
            Send Payment Link
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
            onClick={() => setShowCreateModal(true)}
          >
            Record Payment
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                £{financialSummary.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                £{financialSummary.pendingPayments.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {financialSummary.totalPayments}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Average Transaction
              </p>
              <p className="text-2xl font-bold text-gray-900">
                £{financialSummary.averageTransaction.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.paymentMethod}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
            >
              <option value="all">All Methods</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Search by customer name or reference..."
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
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
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.customers?.name || "Unknown Customer"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.customers?.email || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.bookings?.service || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.bookings?.date
                        ? format(
                            new Date(payment.bookings.date),
                            "MMM dd, yyyy"
                          )
                        : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    £{payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(payment.payment_method)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {payment.payment_method.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.payment_status)}`}
                    >
                      {payment.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(payment.payment_date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.reference || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-primary hover:text-primary-dark"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Record Payment
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowCreateModal(false)}
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

            {formError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {formError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleCreatePayment}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newPayment.customer_id}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      customer_id: e.target.value,
                      booking_id: "",
                    }))
                  }
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking (Optional)
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newPayment.booking_id}
                  onChange={(e) => {
                    const booking = filteredBookings.find(
                      (b) => b.id === e.target.value
                    );

                    setNewPayment((prev) => ({
                      ...prev,
                      booking_id: e.target.value,
                      amount: booking ? booking.amount.toString() : prev.amount,
                    }));
                  }}
                >
                  <option value="">Select Booking</option>
                  {filteredBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.service} -{" "}
                      {format(new Date(booking.date), "MMM dd, yyyy")} - £
                      {booking.amount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  step="0.01"
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={newPayment.payment_method}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      payment_method: e.target.value as any,
                    }))
                  }
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      payment_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Transaction reference..."
                  type="text"
                  value={newPayment.reference}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      reference: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Additional notes..."
                  rows={3}
                  value={newPayment.notes}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                  type="submit"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Payment Link Modal */}
      {showPaymentLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Send Payment Link
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowPaymentLinkModal(false)}
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

            {formError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {formError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleCreatePaymentLink}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={paymentLink.customer_id}
                  onChange={(e) =>
                    setPaymentLink((prev) => ({
                      ...prev,
                      customer_id: e.target.value,
                      booking_id: "",
                    }))
                  }
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking (Optional)
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={paymentLink.booking_id}
                  onChange={(e) => {
                    const booking = filteredBookingsForLink.find(
                      (b) => b.id === e.target.value
                    );

                    setPaymentLink((prev) => ({
                      ...prev,
                      booking_id: e.target.value,
                      amount: booking ? booking.amount.toString() : prev.amount,
                      description: booking
                        ? `Payment for ${booking.service}`
                        : prev.description,
                    }));
                  }}
                >
                  <option value="">Select Booking</option>
                  {filteredBookingsForLink.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.service} -{" "}
                      {format(new Date(booking.date), "MMM dd, yyyy")} - £
                      {booking.amount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  step="0.01"
                  type="number"
                  value={paymentLink.amount}
                  onChange={(e) =>
                    setPaymentLink((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Payment description..."
                  type="text"
                  value={paymentLink.description}
                  onChange={(e) =>
                    setPaymentLink((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={processingPayment === "creating"}
                  type="button"
                  onClick={() => setShowPaymentLinkModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={processingPayment === "creating"}
                  type="submit"
                >
                  {processingPayment === "creating"
                    ? "Creating..."
                    : "Create Payment Link"}
                </button>
              </div>
            </form>
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
