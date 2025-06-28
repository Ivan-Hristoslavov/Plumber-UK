"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface Booking {
  id: string;
  customer_id: string;
  service: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  description?: string;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoiceData: any) => Promise<void>;
  customers: Customer[];
  bookings: Booking[];
  isLoading?: boolean;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  customers,
  bookings,
  isLoading = false
}: CreateInvoiceModalProps) {
  const { profile: dbProfile } = useAdminProfile();
  const [formData, setFormData] = useState({
    customer_id: "",
    booking_id: "",
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
    // Manual entry fields (if no booking selected)
    manual_service: "",
    manual_amount: "",
    manual_description: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useManualEntry, setUseManualEntry] = useState(false);

  // Filter bookings for selected customer
  const filteredBookings = formData.customer_id
    ? bookings.filter(b => b.customer_id === formData.customer_id && b.status === "completed")
    : [];

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);
  const selectedBooking = bookings.find(b => b.id === formData.booking_id);

  // Calculate amounts
  const getAmount = () => {
    if (useManualEntry) {
      return parseFloat(formData.manual_amount) || 0;
    }
    return selectedBooking?.amount || 0;
  };

  const calculateTotals = () => {
    const totalAmount = getAmount();
    const subtotal = Number((totalAmount / 1.2).toFixed(2));
    const vatAmount = Number((totalAmount - subtotal).toFixed(2));
    
    return {
      subtotal,
      vatAmount,
      totalAmount
    };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = "Please select a customer";
    }

    if (!useManualEntry && !formData.booking_id) {
      newErrors.booking_id = "Please select a booking or use manual entry";
    }

    if (useManualEntry) {
      if (!formData.manual_service.trim()) {
        newErrors.manual_service = "Service description is required";
      }
      if (!formData.manual_amount || parseFloat(formData.manual_amount) <= 0) {
        newErrors.manual_amount = "Valid amount is required";
      }
    }

    if (!formData.invoice_date) {
      newErrors.invoice_date = "Invoice date is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { subtotal, vatAmount, totalAmount } = calculateTotals();

    const invoiceData = {
      customer_id: formData.customer_id,
      booking_id: useManualEntry ? null : formData.booking_id,
      invoice_date: formData.invoice_date,
      due_date: formData.due_date,
      subtotal,
      vat_rate: 20.0,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      status: "pending",
      company_name: dbProfile?.company_name || "FixMyLeak Ltd",
      company_address: dbProfile?.company_address || "London, UK",
      company_phone: dbProfile?.phone || "+44 7700 123456",
      company_email: dbProfile?.email || "admin@fixmyleak.com",
      company_vat_number: "GB123456789",
      notes: formData.notes || null,
      // Manual entry data
      ...(useManualEntry && {
        manual_service: formData.manual_service,
        manual_description: formData.manual_description
      })
    };

    await onSubmit(invoiceData);
  };

  const resetForm = () => {
    setFormData({
      customer_id: "",
      booking_id: "",
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: "",
      manual_service: "",
      manual_amount: "",
      manual_description: ""
    });
    setErrors({});
    setUseManualEntry(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const { subtotal, vatAmount, totalAmount } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Invoice
            </h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Business Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              FixMyLeak Business Info
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-800 dark:text-blue-200">
              <div>
                <strong>Company:</strong> {dbProfile?.company_name || "FixMyLeak Ltd"}
              </div>
              <div>
                <strong>Phone:</strong> {dbProfile?.phone || "+44 7700 123456"}
              </div>
              <div>
                <strong>Email:</strong> {dbProfile?.email || "admin@fixmyleak.com"}
              </div>
              <div>
                <strong>VAT:</strong> GB123456789
              </div>
            </div>
          </div>

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer *
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value, booking_id: "" })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customer_id 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              disabled={isLoading}
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
            {errors.customer_id && (
              <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>
            )}
          </div>

          {/* Service Selection Toggle */}
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useManualEntry}
                  onChange={() => setUseManualEntry(false)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select from existing bookings
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useManualEntry}
                  onChange={() => setUseManualEntry(true)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Manual entry
                </span>
              </label>
            </div>

            {!useManualEntry ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Booking *
                </label>
                <select
                  value={formData.booking_id}
                  onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.booking_id 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  disabled={isLoading || !formData.customer_id}
                >
                  <option value="">
                    {!formData.customer_id ? "Select a customer first" : "Select a booking"}
                  </option>
                  {filteredBookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.service} - {new Date(booking.date).toLocaleDateString()} - £{booking.amount}
                    </option>
                  ))}
                </select>
                {errors.booking_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.booking_id}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Description *
                  </label>
                  <input
                    type="text"
                    value={formData.manual_service}
                    onChange={(e) => setFormData({ ...formData, manual_service: e.target.value })}
                    placeholder="e.g., Emergency leak repair"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.manual_service 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    disabled={isLoading}
                  />
                  {errors.manual_service && (
                    <p className="text-red-500 text-xs mt-1">{errors.manual_service}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (including VAT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.manual_amount}
                    onChange={(e) => setFormData({ ...formData, manual_amount: e.target.value })}
                    placeholder="0.00"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.manual_amount 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    disabled={isLoading}
                  />
                  {errors.manual_amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.manual_amount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={formData.manual_description}
                    onChange={(e) => setFormData({ ...formData, manual_description: e.target.value })}
                    placeholder="Optional additional details about the service"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.invoice_date 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                disabled={isLoading}
              />
              {errors.invoice_date && (
                <p className="text-red-500 text-xs mt-1">{errors.invoice_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.due_date 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                disabled={isLoading}
              />
              {errors.due_date && (
                <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>
              )}
            </div>
          </div>

          {/* Amount Preview */}
          {(selectedBooking || (useManualEntry && formData.manual_amount)) && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Invoice Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal (excl. VAT):</span>
                  <span className="text-gray-900 dark:text-white">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">VAT (20%):</span>
                  <span className="text-gray-900 dark:text-white">£{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-300 dark:border-gray-600 pt-2">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">£{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes for the invoice"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 