"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { useAdminProfile } from "@/hooks/useAdminProfile";

import Tooltip from "../../../components/Tooltip";

type Invoice = {
  id: string;
  booking_id: string | null;
  customer_id: string | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  status: "pending" | "sent" | "paid" | "overdue" | "cancelled";
  sent_date: string | null;
  paid_date: string | null;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_vat_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
    email: string;
    address: string;
  };
  booking?: {
    service: string;
    date: string;
    time: string;
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
  service: string;
  date: string;
  time: string;
  amount: number;
  status: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const { profile: dbProfile } = useAdminProfile();

  const [newInvoice, setNewInvoice] = useState({
    customer_id: "",
    booking_id: "",
    invoice_date: format(new Date(), "yyyy-MM-dd"),
    due_date: format(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ), // 30 days from now
    notes: "",
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, customersRes, bookingsRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/customers"),
        fetch("/api/bookings"),
      ]);

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();

        setInvoices(invoicesData);
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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newInvoice.customer_id || !newInvoice.booking_id) {
      setFormError("Please select both customer and booking.");

      return;
    }

    try {
      const selectedBooking = bookings.find(
        (b) => b.id === newInvoice.booking_id
      );
      const selectedCustomer = customers.find(
        (c) => c.id === newInvoice.customer_id
      );

      if (!selectedBooking || !selectedCustomer) {
        setFormError("Selected booking or customer not found.");

        return;
      }

      // Calculate amounts
      const subtotal = Number((selectedBooking.amount / 1.2).toFixed(2));
      const vatAmount = Number((selectedBooking.amount - subtotal).toFixed(2));

      const invoiceData = {
        booking_id: selectedBooking.id,
        customer_id: newInvoice.customer_id,
        invoice_number: `INV-${Date.now()}`,
        invoice_date: newInvoice.invoice_date,
        due_date: newInvoice.due_date,
        subtotal: subtotal,
        vat_rate: 20.0,
        vat_amount: vatAmount,
        total_amount: selectedBooking.amount,
        status: "pending",
        company_name: dbProfile?.company_name || "FixMyLeak Ltd",
        company_address: dbProfile?.company_address || "London, UK",
        company_phone: dbProfile?.phone || "+44 7700 123456",
        company_email: dbProfile?.email || "admin@fixmyleak.com",
        company_vat_number: "GB987654321",
        notes: newInvoice.notes || null,
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        await loadData(); // Reload invoices
        setShowCreateModal(false);
        setNewInvoice({
          customer_id: "",
          booking_id: "",
          invoice_date: format(new Date(), "yyyy-MM-dd"),
          due_date: format(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            "yyyy-MM-dd"
          ),
          notes: "",
        });
      } else {
        const error = await response.json();

        setFormError(error.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setFormError("Failed to create invoice");
    }
  };

  const handleGenerateInvoice = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      generateInvoicePDF(invoice);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    setEmailingId(invoice.id);
    try {
      // Simulate sending email
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setEmailingId(null);
    }
  };

  // Filter bookings for selected customer
  const filteredBookings = newInvoice.customer_id
    ? bookings.filter(
        (b) =>
          b.customer_id === newInvoice.customer_id && b.status === "completed"
      )
    : [];

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300";
      case "sent":
        return "bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300";
      case "paid":
        return "bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  // PDF generation for a single invoice
  function generateInvoicePDF(invoice: Invoice) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;

    // Header
    doc.setFillColor(34, 197, 94); // Tailwind's green-500
    doc.rect(0, 0, pageWidth, 60, "F");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("Fix my leak", 40, 40, { baseline: "middle" });

    // Invoice Title & Number
    y = 80;
    doc.setFontSize(18);
    doc.setTextColor(34, 34, 34);
    doc.text("INVOICE", 40, y);
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 40, y + 20);
    doc.text(
      `Date: ${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}`,
      40,
      y + 36
    );

    // Company Details
    y += 60;
    doc.setFontSize(11);
    doc.setTextColor(34, 34, 34);
    doc.text("From:", 40, y);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.company_name, 40, y + 16);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.company_address, 40, y + 32);
    doc.text(`VAT: ${invoice.company_vat_number || "N/A"}`, 40, y + 48);
    doc.text(`Phone: ${invoice.company_phone}`, 40, y + 64);
    doc.text(`Email: ${invoice.company_email}`, 40, y + 80);

    // Customer Details
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 320, y);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.customer?.name || "Unknown Customer", 320, y + 16);
    doc.text(invoice.customer?.email || "", 320, y + 32);
    doc.text(invoice.customer?.address || "", 320, y + 48);

    // Service Table
    y += 120;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, pageWidth - 40, y);
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Description", 40, y);
    doc.text("Amount", pageWidth - 120, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 18;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, pageWidth - 40, y);
    y += 20;
    doc.text(invoice.booking?.service || "Service", 40, y);
    doc.text(`£${invoice.total_amount.toFixed(2)}`, pageWidth - 120, y, {
      align: "right",
    });

    // VAT Calculation
    y += 30;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, pageWidth - 40, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 40, y);
    doc.text(`£${invoice.subtotal.toFixed(2)}`, pageWidth - 120, y, {
      align: "right",
    });
    y += 18;
    doc.text(`VAT (${invoice.vat_rate}%)`, 40, y);
    doc.text(`£${invoice.vat_amount.toFixed(2)}`, pageWidth - 120, y, {
      align: "right",
    });
    y += 18;
    doc.setFont("helvetica", "bold");
    doc.text("Total", 40, y);
    doc.text(`£${invoice.total_amount.toFixed(2)}`, pageWidth - 120, y, {
      align: "right",
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for your business!", 40, 800);

    doc.save(`${invoice.invoice_number}.pdf`);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Manage and generate UK-compliant invoices for your services
          </p>
        </div>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          onClick={() => setShowCreateModal(true)}
        >
          Create Invoice
        </button>
      </div>

      {/* Invoices Table - Improved responsive design */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                  Invoice #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell transition-colors duration-300">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              {loading ? (
                <tr>
                  <td
                    className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300"
                    colSpan={7}
                  >
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300"
                    colSpan={7}
                  >
                    No invoices found. Create your first invoice using the
                    button above.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        {invoice.customer?.name || "Unknown Customer"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden transition-colors duration-300">
                        {invoice.booking?.service || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell transition-colors duration-300">
                      {invoice.booking?.service || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      £{invoice.total_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(invoice.status)}`}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-6 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center space-x-1">
                        {/* View Button */}
                        <Tooltip content="View Invoice" position="top">
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors duration-300"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsModalOpen(true);
                            }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                              <path
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                          </button>
                        </Tooltip>

                        {/* Download Button */}
                        <Tooltip
                          content={
                            downloadingId === invoice.id
                              ? "Generating PDF..."
                              : "Download PDF"
                          }
                          position="top"
                        >
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors duration-300"
                            disabled={downloadingId === invoice.id}
                            onClick={() => handleGenerateInvoice(invoice)}
                          >
                            {downloadingId === invoice.id ? (
                              <svg
                                className="w-4 h-4 animate-spin"
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
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                            )}
                          </button>
                        </Tooltip>

                        {/* Email Button */}
                        <Tooltip
                          content={
                            emailingId === invoice.id
                              ? "Sending Email..."
                              : "Send Invoice by Email"
                          }
                          position="top"
                        >
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-colors duration-300"
                            disabled={emailingId === invoice.id}
                            onClick={() => handleSendEmail(invoice)}
                          >
                            {emailingId === invoice.id ? (
                              <svg
                                className="w-4 h-4 animate-spin"
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
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                            )}
                          </button>
                        </Tooltip>

                        {/* Dropdown Menu for Mobile */}
                        <div className="relative md:hidden">
                          <Tooltip content="More Options" position="top">
                            <button
                              className="inline-flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle dropdown logic would go here
                              }}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Invoice {selectedInvoice.invoice_number}
              </h2>
              <Tooltip content="Close" position="left">
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
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
              </Tooltip>
            </div>

            <div className="space-y-4">
              {/* Company Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">Company Details</h3>
                <p className="text-sm text-gray-600">
                  {selectedInvoice.company_name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedInvoice.company_address}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {selectedInvoice.company_email}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {selectedInvoice.company_phone}
                </p>
                <p className="text-sm text-gray-600">
                  VAT: {selectedInvoice.company_vat_number || "N/A"}
                </p>
              </div>

              {/* Customer Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">
                  Customer Details
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedInvoice.customer?.name || "Unknown Customer"}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedInvoice.customer?.email || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedInvoice.customer?.address || "N/A"}
                </p>
              </div>

              {/* Invoice Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">Invoice Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Service</p>
                    <p className="font-medium">
                      {selectedInvoice.booking?.service || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedInvoice.invoice_date),
                        "dd/MM/yyyy"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-medium">
                      {selectedInvoice.due_date
                        ? format(
                            new Date(selectedInvoice.due_date),
                            "dd/MM/yyyy"
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium capitalize">
                      {selectedInvoice.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* VAT Calculation */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">VAT Calculation</h3>
                <div className="text-sm">
                  <div className="flex justify-between py-1">
                    <span>Subtotal</span>
                    <span>£{selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>VAT ({selectedInvoice.vat_rate}%)</span>
                    <span>£{selectedInvoice.vat_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold">
                    <span>Total</span>
                    <span>£{selectedInvoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Tooltip
                  content={
                    downloadingId === selectedInvoice.id
                      ? "Generating PDF..."
                      : "Download PDF"
                  }
                  position="top"
                >
                  <button
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={downloadingId === selectedInvoice.id}
                    onClick={() => handleGenerateInvoice(selectedInvoice)}
                  >
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    {downloadingId === selectedInvoice.id
                      ? "Generating..."
                      : "Download PDF"}
                  </button>
                </Tooltip>
                <Tooltip
                  content={
                    emailingId === selectedInvoice.id
                      ? "Sending Email..."
                      : "Send Invoice by Email"
                  }
                  position="top"
                >
                  <button
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={emailingId === selectedInvoice.id}
                    onClick={() => handleSendEmail(selectedInvoice)}
                  >
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    {emailingId === selectedInvoice.id
                      ? "Sending..."
                      : "Send Email"}
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] relative">
            {/* Close button */}
            <button
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              type="button"
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

            <form
              className="p-8 space-y-6 overflow-y-auto max-h-[70vh]"
              onSubmit={handleCreateInvoice}
            >
              <h2 className="text-2xl font-bold mb-4 text-blue-600">
                Create New Invoice
              </h2>

              {formError && (
                <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer<span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={newInvoice.customer_id}
                    onChange={(e) =>
                      setNewInvoice((prev) => ({
                        ...prev,
                        customer_id: e.target.value,
                        booking_id: "",
                      }))
                    }
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Booking Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking<span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    disabled={!newInvoice.customer_id}
                    value={newInvoice.booking_id}
                    onChange={(e) =>
                      setNewInvoice((prev) => ({
                        ...prev,
                        booking_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select a booking</option>
                    {filteredBookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.service} -{" "}
                        {format(new Date(booking.date), "dd/MM/yyyy")} - £
                        {booking.amount}
                      </option>
                    ))}
                  </select>
                  {newInvoice.customer_id && filteredBookings.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No completed bookings found for this customer.
                    </p>
                  )}
                </div>

                {/* Invoice Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Date<span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    type="date"
                    value={newInvoice.invoice_date}
                    onChange={(e) =>
                      setNewInvoice((prev) => ({
                        ...prev,
                        invoice_date: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date<span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) =>
                      setNewInvoice((prev) => ({
                        ...prev,
                        due_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Additional notes for this invoice..."
                  rows={3}
                  value={newInvoice.notes}
                  onChange={(e) =>
                    setNewInvoice((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Amount Preview */}
              {newInvoice.booking_id && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Invoice Preview
                  </h3>
                  {(() => {
                    const selectedBooking = bookings.find(
                      (b) => b.id === newInvoice.booking_id
                    );

                    if (!selectedBooking) return null;

                    const subtotal = Number(
                      (selectedBooking.amount / 1.2).toFixed(2)
                    );
                    const vatAmount = Number(
                      (selectedBooking.amount - subtotal).toFixed(2)
                    );

                    return (
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>£{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT (20%):</span>
                          <span>£{vatAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Total:</span>
                          <span>£{selectedBooking.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  type="submit"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
