"use client";

import { useState, useEffect } from "react";
import { useToast, ToastMessages } from "@/components/Toast";
import { usePricingCardsForBooking, type BookingService } from "@/hooks/usePricingCardsForBooking";
import { useWorkingHours } from "@/hooks/useWorkingHours";
import { useAdminProfile } from "@/components/AdminProfileContext";

export default function FormBooking() {
  const { showSuccess, showError } = useToast();
  const { services, isLoading: isLoadingServices } = usePricingCardsForBooking();
  const { timeSlots, isLoading: isLoadingTimeSlots } = useWorkingHours();
  const adminProfile = useAdminProfile();
  const [selectedService, setSelectedService] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey] = useState(() => Math.random().toString(36));
  const [submitResult, setSubmitResult] = useState<null | { success: boolean; message: string }>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Get business phone from admin profile
  const businessPhone = adminProfile?.phone || "+44 7541777225";

  // Get today's date for the minimum date and default value
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const defaultDate = minDate;

  // Check availability when date changes
  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate);
    }
  }, [selectedDate]);

  const checkAvailability = async (date: string) => {
    setIsCheckingAvailability(true);
    try {
      const response = await fetch(`/api/bookings/availability?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        const bookedTimeSlots = data.bookedTimes.map((slot: any) => slot.time);
        setBookedTimes(bookedTimeSlots);
      } else {
        console.error("Failed to check availability");
        setBookedTimes([]);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setBookedTimes([]);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const isTimeSlotBooked = (timeSlot: string) => {
    const timeOnly = timeSlot.split(" - ")[0];
    return bookedTimes.includes(timeOnly);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        service: formData.get("service") as string,
        preferredDate: formData.get("preferred-date") as string,
        timeSlot: formData.get("timeSlot") as string,
        description: formData.get("description") as string,
        isEmergency: formData.get("isEmergency") === "on",
      };

      // Validate required fields
      if (
        !data.name ||
        !data.email ||
        !data.phone ||
        !data.address ||
        !data.service ||
        !data.preferredDate ||
        !data.timeSlot
      ) {
        showError(ToastMessages.general.validationError.title, "Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Check if selected time slot is booked
      if (isTimeSlotBooked(data.timeSlot)) {
        showError("Time Slot Unavailable", "This time slot is no longer available. Please select a different time.");
        setIsSubmitting(false);
        return;
      }

      // Find selected service details
      const selectedServiceData = services.find((s: BookingService) => s.id === data.service);
      const serviceName = selectedServiceData?.name || data.service;

      // First, create or find customer
      let customerId: string;

      // Check if customer already exists by email
      const existingCustomerResponse = await fetch("/api/customers");
      const existingCustomers = await existingCustomerResponse.json();
      const existingCustomer = existingCustomers.find(
        (c: any) => c.email === data.email,
      );

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer
        const customerData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          customer_type: "individual",
        };

        const customerResponse = await fetch("/api/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        });

        if (!customerResponse.ok) {
          const errorData = await customerResponse.json();
          throw new Error(errorData.error || "Failed to create customer");
        }

        const newCustomer = await customerResponse.json();
        customerId = newCustomer.id;
      }

      // Create booking
      const bookingData = {
        customer_id: customerId,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        service: serviceName,
        date: data.preferredDate,
        time: data.timeSlot.split(" - ")[0],
        status: data.isEmergency ? "pending" : "scheduled",
        payment_status: "pending",
        amount: data.isEmergency ? 120.0 : 80.0,
        address: data.address,
        notes: data.description || null,
      };

      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        if (errorData.conflict) {
          showError("Time Slot Conflict", errorData.message);
        } else {
          throw new Error(errorData.error || "Failed to create booking");
        }
        setIsSubmitting(false);
        return;
      }

      showSuccess(ToastMessages.bookings.submitted.title, ToastMessages.bookings.submitted.message);
      setSubmitResult({ success: true, message: "Your booking request was sent successfully! We'll contact you soon." });
      setTimeout(() => {
        setSubmitResult(null);
        setSelectedService("");
        setSelectedDate("");
        setBookedTimes([]);
        (e.target as HTMLFormElement).reset();
      }, 5000);
    } catch (error) {
      console.error("Error submitting booking:", error);
      showError(
        ToastMessages.bookings.error.title,
        error instanceof Error
          ? error.message
          : ToastMessages.bookings.error.message
      );
      setSubmitResult({ success: false, message: "There was an error sending your booking request. Please try again or call us directly." });
      setTimeout(() => setSubmitResult(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitResult) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[500px] w-full rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8 transition-colors duration-300 ${submitResult.success ? 'border-green-400' : 'border-red-400'} border-2`}>
        <svg
          className={`w-16 h-16 mb-6 ${submitResult.success ? 'text-green-500' : 'text-red-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {submitResult.success ? (
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          ) : (
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          )}
        </svg>
        <h2 className={`text-2xl font-bold mb-4 ${submitResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{submitResult.success ? 'Success!' : 'Error'}</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-2">{submitResult.message}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">This message will disappear in 5 seconds.</p>
      </div>
    );
  }

  return (
    <form key={formKey} className="space-y-6" onSubmit={handleSubmit}>
      
      {/* Grid Layout for Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Personal Details */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Your Details</h4>
          </div>
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
              Full Name *
            </label>
            <input
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              id="name"
              name="name"
              placeholder="Your full name"
              type="text"
            />
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                Email *
              </label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                id="email"
                name="email"
                placeholder="your@email.com"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="phone">
                Phone *
              </label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                id="phone"
                name="phone"
                placeholder="+44 7XXX XXXXXX"
                type="tel"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="address">
              Service Address *
            </label>
            <textarea
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              id="address"
              name="address"
              placeholder="Full address where service is needed"
              rows={3}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="description">
              Problem Description
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              id="description"
              name="description"
              placeholder="Describe your plumbing issue..."
              rows={3}
            />
          </div>
        </div>

        {/* Right Column - Service & Schedule */}
        <div className="space-y-6">
          
          {/* Service Selection */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Service & Schedule</h4>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Service *
              </label>
              {isLoadingServices ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-20"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {services.map((service: BookingService) => (
                    <div
                      key={service.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedService === service.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <input
                        checked={selectedService === service.id}
                        className="sr-only"
                        name="service"
                        type="radio"
                        value={service.id}
                        onChange={(e) => setSelectedService(e.target.value)}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-2xl">{service.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {service.name}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full whitespace-nowrap">
                            {service.price}
                          </span>
                          {selectedService === service.id && (
                            <div className="text-blue-500">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="preferred-date">
                Preferred Date *
              </label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                defaultValue={defaultDate}
                id="preferred-date"
                min={minDate}
                name="preferred-date"
                type="date"
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="timeSlot">
                Time Slot *
                {isCheckingAvailability && (
                  <span className="ml-2 text-xs text-blue-500">
                    Checking availability...
                  </span>
                )}
              </label>
              {isLoadingTimeSlots ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-12"></div>
              ) : (
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  id="timeSlot"
                  name="timeSlot"
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((slot: string) => {
                    const isBooked = isTimeSlotBooked(slot);
                    return (
                      <option 
                        key={slot} 
                        value={slot}
                        disabled={isBooked}
                        style={isBooked ? { color: '#9CA3AF', backgroundColor: '#F3F4F6' } : {}}
                      >
                        {slot} {isBooked ? '(Booked)' : ''}
                      </option>
                    );
                  })}
                </select>
              )}
              {selectedDate && bookedTimes.length > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {bookedTimes.length} time slot{bookedTimes.length > 1 ? 's' : ''} already booked for this date
                </p>
              )}
            </div>
          </div>

          {/* Emergency Option */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center">
              <input
                className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                id="isEmergency"
                name="isEmergency"
                type="checkbox"
              />
              <label className="ml-3 flex items-center text-sm font-medium" htmlFor="isEmergency">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                <span className="text-red-700 dark:text-red-300">
                  <strong>Emergency Service</strong> (45min response)
                </span>
              </label>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 ml-8">
              Select this for urgent plumbing emergencies requiring immediate attention
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          className={`w-full px-8 py-4 rounded-xl font-bold text-white text-lg transition-all ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          }`}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              Sending Your Request...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              Send Booking Request
            </div>
          )}
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            * Required fields. Emergency? Call{" "}
            <a href={`tel:${businessPhone}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {businessPhone}
            </a>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            We'll contact you within 45 minutes to confirm your booking
          </p>
        </div>
      </div>
    </form>
  );
}
