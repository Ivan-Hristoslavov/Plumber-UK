"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { CreateInvoiceModal } from "@/components/CreateInvoiceModal";
import { SendInvoiceModal } from "@/components/SendInvoiceModal";
import { useToast, ToastMessages } from "@/components/Toast";

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
    phone: string;
  };
  booking?: {
    service: string;
    date: string;
    time: string;
    description?: string;
  };
};

type Customer = {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
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
  description?: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const { profile: dbProfile } = useAdminProfile();
  const { showSuccess, showError } = useToast();

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
      showError(ToastMessages.general.error.title, ToastMessages.general.error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      setCreatingInvoice(true);
      
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
        showSuccess(ToastMessages.invoices.created.title, ToastMessages.invoices.created.message);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      showError(ToastMessages.invoices.error.title, error instanceof Error ? error.message : ToastMessages.invoices.error.message);
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleSendInvoice = async (includePaymentLink: boolean) => {
    if (!selectedInvoice) return;

    try {
      setSendingId(selectedInvoice.id);
      
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ includePaymentLink }),
      });

      if (response.ok) {
        const result = await response.json();
        await loadData(); // Reload invoices to update status
        setShowSendModal(false);
        setSelectedInvoice(null);
        
        const message = includePaymentLink 
          ? `Invoice sent with payment link to ${result.recipient}`
          : `Invoice sent to ${result.recipient}`;
        
        showSuccess(ToastMessages.invoices.emailSent.title, message);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invoice");
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      showError(ToastMessages.invoices.error.title, error instanceof Error ? error.message : ToastMessages.invoices.error.message);
    } finally {
      setSendingId(null);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      generateInvoicePDF(invoice);
      showSuccess(ToastMessages.invoices.downloaded.title, ToastMessages.invoices.downloaded.message);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showError(ToastMessages.invoices.error.title, ToastMessages.invoices.error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300";
      case "sent":
        return "bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300";
      case "paid":
        return "bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300";
      case "overdue":
        return "bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-300";
      case "cancelled":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "sent":
        return "📧";
      case "paid":
        return "✅";
      case "overdue":
        return "⚠️";
      case "cancelled":
        return "❌";
      default:
        return "❓";
    }
  };

  // PDF generation function (keeping the existing one but improved)
  function generateInvoicePDF(invoice: Invoice) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 60;

    // UK Invoice Header - Company Branding
    doc.setFillColor(59, 130, 246); // Blue header
    doc.rect(0, 0, pageWidth, 80, "F");
    
    // Company Logo/Name
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.company_name || "FixMyLeak Ltd", 40, 45);
    
    // UK Address format
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.company_address || "London, UK", 40, 65);

    // Invoice Title & Details - Right aligned
    y = 100;
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 150, y);
    
    // Invoice metadata
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    y += 25;
    doc.text(`Invoice No: ${invoice.invoice_number}`, pageWidth - 150, y);
    y += 15;
    doc.text(`Date: ${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}`, pageWidth - 150, y);
    y += 15;
    if (invoice.due_date) {
      doc.text(`Due Date: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, pageWidth - 150, y);
    }

    // Company Details Section (UK Format)
    y = 160;
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);
    doc.setFont("helvetica", "bold");
    doc.text("From:", 40, y);
    
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(invoice.company_name || "FixMyLeak Ltd", 40, y);
    
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Multi-line address handling
    const addressLines = (invoice.company_address || "London, UK").split('\n');
    addressLines.forEach(line => {
      doc.text(line, 40, y);
      y += 12;
    });
    
    // UK Business details
    doc.text(`Tel: ${invoice.company_phone || "+44 7700 123456"}`, 40, y);
    y += 12;
    doc.text(`Email: ${invoice.company_email || "admin@fixmyleak.com"}`, 40, y);
    y += 12;
    
    // VAT Number (UK requirement)
    if (invoice.company_vat_number) {
      doc.text(`VAT Reg No: ${invoice.company_vat_number}`, 40, y);
      y += 12;
    }
    
    // Gas Safe Registration (UK plumbing requirement)
    if (dbProfile?.gas_safe_number) {
      doc.text(`Gas Safe Reg: ${dbProfile.gas_safe_number}`, 40, y);
    }

    // Customer Details Section (Bill To)
    y = 160;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", pageWidth - 250, y);
    
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(invoice.customer?.name || "Customer", pageWidth - 250, y);
    
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    if (invoice.customer?.email) {
      doc.text(invoice.customer.email, pageWidth - 250, y);
      y += 12;
    }
    
    if (invoice.customer?.address) {
      const customerAddressLines = invoice.customer.address.split('\n');
      customerAddressLines.forEach(line => {
        doc.text(line, pageWidth - 250, y);
        y += 12;
      });
    }

    // Service Details Table (UK Style)
    y = 300;
    
    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(40, y, pageWidth - 80, 25, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(40, y, pageWidth - 80, 25);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("Description", 50, y + 16);
    doc.text("Date", pageWidth - 280, y + 16);
    doc.text("Amount", pageWidth - 120, y + 16, { align: "right" });
    
    // Service row
    y += 25;
    doc.setDrawColor(226, 232, 240);
    doc.rect(40, y, pageWidth - 80, 30);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(invoice.booking?.service || "Plumbing Service", 50, y + 12);
    if (invoice.booking?.date) {
      doc.text(format(new Date(invoice.booking.date), "dd/MM/yyyy"), pageWidth - 280, y + 12);
    }
    
    // Service location
    if (invoice.customer?.address) {
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Location: ${invoice.customer.address.split('\n')[0]}`, 50, y + 25);
    }
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`£${invoice.subtotal.toFixed(2)}`, pageWidth - 120, y + 16, { align: "right" });

    // UK VAT Calculation Section
    y += 60;
    doc.setDrawColor(226, 232, 240);
    doc.line(pageWidth - 250, y, pageWidth - 40, y);
    
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Subtotal (excl. VAT)", pageWidth - 200, y);
    doc.text(`£${invoice.subtotal.toFixed(2)}`, pageWidth - 120, y, { align: "right" });
    
    y += 18;
    doc.text(`VAT @ ${invoice.vat_rate}%`, pageWidth - 200, y);
    doc.text(`£${invoice.vat_amount.toFixed(2)}`, pageWidth - 120, y, { align: "right" });
    
    // Total
    y += 25;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.line(pageWidth - 250, y - 5, pageWidth - 40, y - 5);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("TOTAL", pageWidth - 200, y);
    doc.text(`£${invoice.total_amount.toFixed(2)}`, pageWidth - 120, y, { align: "right" });

    // Payment Terms (UK Standard)
    y += 50;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text("Payment Terms", 40, y);
    
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    
    const paymentTerms = [
      `Payment due within 30 days of invoice date`,
      `Late payment charges may apply after due date`,
      `Bank transfer preferred - details available on request`,
      `Cheques payable to: ${invoice.company_name || "FixMyLeak Ltd"}`
    ];
    
    paymentTerms.forEach(term => {
      doc.text(`• ${term}`, 40, y);
      y += 14;
    });

    // Notes section
    if (invoice.notes) {
      y += 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Notes", 40, y);
      
      y += 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      const noteLines = invoice.notes.split('\n');
      noteLines.forEach(line => {
        doc.text(line, 40, y);
        y += 14;
      });
    }

    // Footer (UK Legal Requirements)
    const footerY = pageHeight - 80;
    doc.setDrawColor(226, 232, 240);
    doc.line(40, footerY, pageWidth - 40, footerY);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    
    let footerText = `${invoice.company_name || "FixMyLeak Ltd"} • ${invoice.company_address || "London, UK"}`;
    if (invoice.company_vat_number) {
      footerText += ` • VAT Reg: ${invoice.company_vat_number}`;
    }
    if (dbProfile?.gas_safe_number) {
      footerText += ` • Gas Safe: ${dbProfile.gas_safe_number}`;
    }
    
    doc.text(footerText, pageWidth / 2, footerY + 15, { align: "center" });
    doc.text("Thank you for choosing our services", pageWidth / 2, footerY + 30, { align: "center" });

    // Save the PDF
    doc.save(`Invoice-${invoice.invoice_number}.pdf`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Manage and generate UK-compliant invoices for your services
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No invoices yet</p>
                      <p className="text-sm">Create your first invoice to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.invoice_number}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.customer?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {invoice.customer?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {invoice.booking?.service || "Manual Entry"}
                      </div>
                      {invoice.booking?.date && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(invoice.booking.date), "dd/MM/yyyy")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        £{invoice.total_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        VAT: £{invoice.vat_amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {invoice.due_date ? format(new Date(invoice.due_date), "dd/MM/yyyy") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Download PDF Button */}
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={downloadingId === invoice.id}
                          className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                          title="Download PDF"
                        >
                          {downloadingId === invoice.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                        </button>

                        {/* Send Email Button */}
                        {invoice.status === "pending" && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowSendModal(true);
                            }}
                            disabled={sendingId === invoice.id}
                            className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-50"
                            title="Send Invoice"
                          >
                            {sendingId === invoice.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateInvoice}
        customers={customers}
        bookings={bookings}
        isLoading={creatingInvoice}
      />

      {/* Send Invoice Modal */}
      {selectedInvoice && (
        <SendInvoiceModal
          isOpen={showSendModal}
          onClose={() => {
            setShowSendModal(false);
            setSelectedInvoice(null);
          }}
          onConfirm={handleSendInvoice}
          invoice={selectedInvoice}
          isLoading={sendingId === selectedInvoice.id}
        />
      )}
    </div>
  );
}
