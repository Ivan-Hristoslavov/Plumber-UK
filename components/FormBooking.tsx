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
    <form key={formKey} className="space-y-4" onSubmit={handleSubmit}>
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="group">
          <label
            className="block text-xs font-semibold text-white mb-1"
            htmlFor="name"
          >
            Full Name *
          </label>
          <div className="relative">
            <input
              required
              className="w-full px-3 py-2 rounded-lg border border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30 text-sm"
              id="name"
              name="name"
              placeholder="Enter your full name"
              type="text"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-4 h-4 text-white/60"
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
            className="block text-xs font-semibold text-white mb-1"
            htmlFor="email"
          >
            Email Address *
          </label>
          <div className="relative">
            <input
              required
              className="w-full px-3 py-2 rounded-lg border border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30 text-sm"
              id="email"
              name="email"
              placeholder="your.email@example.com"
              type="email"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-4 h-4 text-white/60"
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
            className="block text-xs font-semibold text-white mb-1"
            htmlFor="phone"
          >
            Phone Number *
          </label>
          <div className="relative">
            <input
              required
              className="w-full px-3 py-2 rounded-lg border border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30 text-sm"
              id="phone"
              name="phone"
              placeholder="+44 7XXX XXXXXX"
              type="tel"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-4 h-4 text-white/60"
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
            className="block text-xs font-semibold text-white mb-1"
            htmlFor="address"
          >
            Service Address *
          </label>
          <div className="relative">
            <textarea
              required
              className="w-full px-3 py-2 rounded-lg border border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30 resize-none text-sm"
              id="address"
              name="address"
              placeholder="Enter the full address where service is needed"
              rows={2}
            />
            <div className="absolute top-2 right-3">
              <svg
                className="w-4 h-4 text-white/60"
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
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-white mb-2">
          Select Service Type *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                selectedService === service.id
                  ? "border-blue-400 bg-blue-500/20 shadow-lg"
                  : "border-white/20 hover:border-white/40 hover:bg-white/5"
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
              <div className="flex items-center space-x-3">
                <div className="text-lg">{service.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {service.name}
                  </h4>
                  <p className="text-xs text-white/70 mb-1">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                    {service.price}
                  </span>
                </div>
                <div
                  className={`transition-opacity ${
                    selectedService === service.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="group">
          <label
            className="block text-xs font-semibold text-white mb-1"
            htmlFor="preferred-date"
          >
            Preferred Date *
          </label>
          <div className="relative">
            <input
              required
              className="w-full px-3 py-2 rounded-lg border border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white group-hover:border-white/30 [color-scheme:dark] text-sm"
              defaultValue={defaultDate}
              id="preferred-date"
              min={minDate}
              name="preferred-date"
              style={{
                colorScheme: "dark",
              }}
              type="date"
            />
          </div>
        </div>

        <div className="group">
          <label
            className="block text-xs font-semibold text-white mb-1"
            htmlFor="timeSlot"
          >
            Preferred Time *
          </label>
          <div className="relative">
            <select
              required
              className="w-full px-3 py-2 rounded-lg border border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white group-hover:border-white/30 appearance-none text-sm"
              id="timeSlot"
              name="timeSlot"
            >
              <option className="bg-gray-800 text-white" value="">
                Select a time slot
              </option>
              {timeSlots.map((slot) => (
                <option
                  key={slot}
                  className="bg-gray-800 text-white"
                  value={slot}
                >
                  {slot}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-white/60"
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
          className="block text-xs font-semibold text-white mb-1"
          htmlFor="description"
        >
          Problem Description
        </label>
        <div className="relative">
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30 resize-none text-sm"
            id="description"
            name="description"
            placeholder="Please describe your plumbing issue in detail..."
            rows={2}
          />
          <div className="absolute top-2 right-3">
            <svg
              className="w-4 h-4 text-white/60"
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
      <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
        <div className="flex items-center">
          <input
            className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 bg-white/10"
            id="isEmergency"
            name="isEmergency"
            type="checkbox"
          />
          <label className="ml-2 flex items-center" htmlFor="isEmergency">
            <svg
              className="w-4 h-4 text-red-400 mr-1"
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
            <span className="text-xs font-medium text-white">
              This is an emergency (45min response time)
            </span>
          </label>
        </div>
      </div>

      {/* Status Message */}
      {submitMessage && (
        <div
          className={`p-6 rounded-xl border backdrop-blur-sm ${
            submitStatus === "success"
              ? "bg-green-500/20 border-green-400/40 text-green-100 shadow-lg shadow-green-500/20"
              : "bg-red-500/20 border-red-400/30 text-red-100"
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
              <h3 className="text-lg font-bold text-green-100 mb-2">
                🎉 Booking Request Sent Successfully!
              </h3>

              {/* Success Message */}
              <p className="text-sm text-green-200 mb-4 leading-relaxed">
                {submitMessage}
              </p>

              {/* Additional Info */}
              <div className="bg-green-600/30 rounded-lg p-3 border border-green-400/30">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5 text-green-300 mr-2"
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
                  <span className="text-xs font-semibold text-green-200">
                    Next Steps
                  </span>
                </div>
                <ul className="text-xs text-green-300 space-y-1">
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
                className="w-5 h-5 mr-2 text-red-400"
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
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm ${
          isSubmitting
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <svg
              className="w-4 h-4 mr-2 inline animate-spin"
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
            Send Booking Request
            <svg
              className="w-4 h-4 ml-2 inline"
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
          </>
        )}
      </button>

      <p className="text-xs text-white/60 text-center">
        * Required fields. For emergencies, call us directly at{" "}
        <strong className="text-white">07541777225</strong>
      </p>
    </form>
  );
}
