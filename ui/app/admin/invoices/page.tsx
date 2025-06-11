'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

type Invoice = {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  service: string;
  date: string;
  amount: number;
  status: 'pending' | 'sent' | 'paid';
  invoiceNumber: string;
  vatNumber: string;
  companyDetails: {
    name: string;
    address: string;
    postcode: string;
    phone: string;
    email: string;
    vatNumber: string;
  };
};

// Helper to generate next invoice number
function getNextInvoiceNumber(invoices: Invoice[]): string {
  const numbers = invoices
    .map(inv => parseInt(inv.invoiceNumber.replace('IVN-', ''), 10))
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  const next = (max + 1).toString().padStart(3, '0');
  return `IVN-${next}`;
}

// Mock data for demonstration
const mockInvoices: Invoice[] = [
  {
    id: '1',
    bookingId: 'B001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    service: 'Emergency Call Out',
    date: '2024-03-15',
    amount: 150.00,
    status: 'pending',
    invoiceNumber: 'IVN-001',
    vatNumber: 'GB123456789',
    companyDetails: {
      name: 'Fix my leak',
      address: '123 Business Street, London',
      postcode: 'SW1A 1AA',
      phone: '0800 123 4567',
      email: 'accounts@fixmyleak.com',
      vatNumber: 'GB123456789'
    }
  },
  {
    id: '2',
    bookingId: 'B002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    service: 'Bathroom Installation',
    date: '2024-03-14',
    amount: 2500.00,
    status: 'sent',
    invoiceNumber: 'IVN-002',
    vatNumber: 'GB123456789',
    companyDetails: {
      name: 'Fix my leak',
      address: '123 Business Street, London',
      postcode: 'SW1A 1AA',
      phone: '0800 123 4567',
      email: 'accounts@fixmyleak.com',
      vatNumber: 'GB123456789'
    }
  }
];

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);

  const handleGenerateInvoice = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      generateInvoicePDF(invoice);
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    setEmailingId(invoice.id);
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setEmailingId(null);
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // PDF generation for a single invoice
  function generateInvoicePDF(invoice: Invoice) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;

    // Header
    doc.setFillColor(34, 197, 94); // Tailwind's green-500
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('Fix my leak', 40, 40, { baseline: 'middle' });

    // Invoice Title & Number
    y = 80;
    doc.setFontSize(18);
    doc.setTextColor(34, 34, 34);
    doc.text('INVOICE', 40, y);
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 40, y + 20);
    doc.text(`Date: ${format(new Date(invoice.date), 'dd/MM/yyyy')}`, 40, y + 36);

    // Company Details
    y += 60;
    doc.setFontSize(11);
    doc.setTextColor(34, 34, 34);
    doc.text('From:', 40, y);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.companyDetails.name, 40, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.companyDetails.address, 40, y + 32);
    doc.text(invoice.companyDetails.postcode, 40, y + 48);
    doc.text(`VAT: ${invoice.companyDetails.vatNumber}`, 40, y + 64);
    doc.text(`Phone: ${invoice.companyDetails.phone}`, 40, y + 80);
    doc.text(`Email: ${invoice.companyDetails.email}`, 40, y + 96);

    // Customer Details
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 320, y);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customerName, 320, y + 16);
    doc.text(invoice.customerEmail, 320, y + 32);

    // Service Table
    y += 120;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, pageWidth - 40, y);
    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 40, y);
    doc.text('Amount', pageWidth - 120, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 18;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, pageWidth - 40, y);
    y += 20;
    doc.text(invoice.service, 40, y);
    doc.text(`£${invoice.amount.toFixed(2)}`, pageWidth - 120, y, { align: 'right' });

    // VAT Calculation
    y += 30;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, pageWidth - 40, y);
    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal', 40, y);
    doc.text(`£${(invoice.amount / 1.2).toFixed(2)}`, pageWidth - 120, y, { align: 'right' });
    y += 18;
    doc.text('VAT (20%)', 40, y);
    doc.text(`£${(invoice.amount - invoice.amount / 1.2).toFixed(2)}`, pageWidth - 120, y, { align: 'right' });
    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('Total', 40, y);
    doc.text(`£${invoice.amount.toFixed(2)}`, pageWidth - 120, y, { align: 'right' });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for your business!', 40, 800);

    doc.save(`${invoice.invoiceNumber}.pdf`);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and generate UK-compliant invoices for your services
        </p>
      </div>

      {/* Invoices Table - Updated container width */}
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <div className="min-w-[1200px]"> {/* Minimum width container */}
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[150px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="w-[100px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-[300px] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(invoice.date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    £{invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => handleGenerateInvoice(invoice)}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        disabled={downloadingId === invoice.id}
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        {downloadingId === invoice.id ? 'Generating...' : 'Download PDF'}
                      </button>
                      <button
                        onClick={() => handleSendEmail(invoice)}
                        className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        disabled={emailingId === invoice.id}
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {emailingId === invoice.id ? 'Sending...' : 'Send Email'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                Invoice {selectedInvoice.invoiceNumber}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Company Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">Company Details</h3>
                <p className="text-sm text-gray-600">{selectedInvoice.companyDetails.name}</p>
                <p className="text-sm text-gray-600">{selectedInvoice.companyDetails.address}</p>
                <p className="text-sm text-gray-600">{selectedInvoice.companyDetails.postcode}</p>
                <p className="text-sm text-gray-600">VAT: {selectedInvoice.companyDetails.vatNumber}</p>
              </div>

              {/* Customer Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">Customer Details</h3>
                <p className="text-sm text-gray-600">{selectedInvoice.customerName}</p>
                <p className="text-sm text-gray-600">{selectedInvoice.customerEmail}</p>
              </div>

              {/* Invoice Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">Invoice Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Service</p>
                    <p className="font-medium">{selectedInvoice.service}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">{format(new Date(selectedInvoice.date), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-medium">£{selectedInvoice.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium capitalize">{selectedInvoice.status}</p>
                  </div>
                </div>
              </div>

              {/* VAT Calculation */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900">VAT Calculation</h3>
                <div className="text-sm">
                  <div className="flex justify-between py-1">
                    <span>Subtotal</span>
                    <span>£{(selectedInvoice.amount / 1.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>VAT (20%)</span>
                    <span>£{(selectedInvoice.amount - selectedInvoice.amount / 1.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold">
                    <span>Total</span>
                    <span>£{selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleGenerateInvoice(selectedInvoice)}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={downloadingId === selectedInvoice.id}
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {downloadingId === selectedInvoice.id ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => handleSendEmail(selectedInvoice)}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={emailingId === selectedInvoice.id}
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {emailingId === selectedInvoice.id ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 