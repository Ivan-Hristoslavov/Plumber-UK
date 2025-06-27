"use client";

import { useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
  icon: string;
};

const services: Service[] = [
  {
    id: "callout-hourly",
    name: "Call-out & Hourly Labour Rates",
    description:
      "Flexible hourly bookings for urgent or short jobs. See pricing section for full details.",
    price: "See table",
    icon: "🔧",
  },
  {
    id: "full-day",
    name: "Full-Day Booking Rates",
    description:
      "Book a full day for larger or planned works. See pricing section for full details.",
    price: "See table",
    icon: "📅",
  },
];

const timeSlots = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
];

export function FormBooking() {
  const [selectedService, setSelectedService] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [formKey] = useState(() => Math.random().toString(36));

  console.log("FormBooking rendered with key:", formKey);

  // Get today's date for the minimum date and default value
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const defaultDate = minDate;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitStatus("idle");

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
        throw new Error("Please fill in all required fields");
      }

      console.log("Submitting booking data:", data);

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
        console.log("Found existing customer:", customerId);
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
        console.log("Created new customer:", customerId);
      }

      // Create booking
      const bookingData = {
        customer_id: customerId,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        service: data.service,
        date: data.preferredDate,
        time: data.timeSlot.split(" - ")[0], // Take start time
        status: data.isEmergency ? "pending" : "scheduled",
        payment_status: "pending",
        amount: data.isEmergency ? 120.0 : 80.0, // Default amounts
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

        throw new Error(errorData.error || "Failed to create booking");
      }

      const newBooking = await bookingResponse.json();

      console.log("Created booking:", newBooking);

      // Success!
      setSubmitStatus("success");
      setSubmitMessage(
        "Your booking request has been sent successfully! We have received your details and will contact you within 45 minutes to confirm your appointment.",
      );

      // Reset form after a delay
      setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitMessage("");
        setSelectedService("");
        (e.target as HTMLFormElement).reset();
      }, 5000);
    } catch (error) {
      console.error("Error submitting booking:", error);
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 0h4m-4 0a1 1 0 01-1-1V3a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1m-4 0H8m4 0V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          Book a Service
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Schedule Your Plumbing Service
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Fill out the form below and we'll contact you within 45 minutes to confirm your appointment
        </p>
      </div>

      <form key={formKey} className="space-y-6" onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="name"
            >
              Full Name *
            </label>
            <div className="relative">
              <input
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium"
                id="name"
                name="name"
                placeholder="Enter your full name"
                type="text"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="email"
            >
              Email Address *
            </label>
            <div className="relative">
              <input
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                type="email"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="phone"
            >
              Phone Number *
            </label>
            <div className="relative">
              <input
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium"
                id="phone"
                name="phone"
                placeholder="+44 7XXX XXXXXX"
                type="tel"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="group md:col-span-2">
            <label
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="address"
            >
              Service Address *
            </label>
            <div className="relative">
              <textarea
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium resize-none"
                id="address"
                name="address"
                placeholder="Enter the full address where service is needed"
                rows={3}
              />
              <div className="absolute top-3 right-4">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                  <path
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Select Service Type *
          </label>
          <div className="grid grid-cols-1 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  selectedService === service.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
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
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{service.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                      {service.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                      {service.price}
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      selectedService === service.id ? "opacity-100 scale-100" : "opacity-0 scale-75"
                    }`}
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="preferred-date"
            >
              Preferred Date *
            </label>
            <div className="relative">
              <input
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium [color-scheme:dark]"
                defaultValue={defaultDate}
                id="preferred-date"
                min={minDate}
                name="preferred-date"
                type="date"
              />
            </div>
          </div>

          <div className="group">
            <label
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="timeSlot"
            >
              Preferred Time *
            </label>
            <div className="relative">
              <select
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium appearance-none"
                id="timeSlot"
                name="timeSlot"
              >
                <option className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value="">
                  Select a time slot
                </option>
                {timeSlots.map((slot) => (
                  <option
                    key={slot}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={slot}
                  >
                    {slot}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className="group">
          <label
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            htmlFor="description"
          >
            Problem Description (Optional)
          </label>
          <div className="relative">
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium resize-none"
              id="description"
              name="description"
              placeholder="Please describe your plumbing issue in detail..."
              rows={4}
            />
            <div className="absolute top-3 right-4">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Emergency Option */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <input
              className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500 bg-white dark:bg-gray-700"
              id="isEmergency"
              name="isEmergency"
              type="checkbox"
            />
            <label className="ml-3 flex items-center" htmlFor="isEmergency">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                This is an emergency (45min response time)
              </span>
            </label>
          </div>
        </div>

        {/* Status Message */}
        {submitMessage && (
          <div
            className={`p-6 rounded-xl border-2 backdrop-blur-sm ${
              submitStatus === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            }`}
          >
            {submitStatus === "success" ? (
              <div className="text-center">
                {/* Success Icon with Animation */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 w-16 h-16 bg-green-400 rounded-full animate-ping opacity-20" />
                  </div>
                </div>

                {/* Success Title */}
                <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
                  🎉 Booking Request Sent Successfully!
                </h3>

                {/* Success Message */}
                <p className="text-sm text-green-700 dark:text-green-300 mb-4 leading-relaxed">
                  {submitMessage}
                </p>

                {/* Additional Info */}
                <div className="bg-green-100 dark:bg-green-800/30 rounded-lg p-3 border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Next Steps
                    </span>
                  </div>
                  <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                    <li>✓ Your booking details have been saved</li>
                    <li>✓ We will call you within 45 minutes</li>
                    <li>✓ We'll confirm your appointment time</li>
                    <li>
                      ✓ Emergency? Call us directly: <strong>07541777225</strong>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span className="text-sm font-medium">{submitMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
            isSubmitting
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          }`}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <svg
                className="w-5 h-5 mr-2 inline animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Sending Request...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2 inline"
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
              Send Booking Request
            </>
          )}
        </button>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          * Required fields. For emergencies, call us directly at{" "}
          <strong className="text-gray-900 dark:text-white">07541777225</strong>
        </p>
      </form>
    </div>
  );
}
