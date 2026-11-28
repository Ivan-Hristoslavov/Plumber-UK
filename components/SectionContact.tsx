"use client";

import dynamic from "next/dynamic";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { trackPhoneCall } from "@/components/GoogleAnalytics";
import { ButtonWhatsApp } from "@/components/ButtonWhatsApp";

const FormBooking = dynamic(() => import("@/components/FormBooking"), { ssr: false });

/**
 * The booking form, with a call and a WhatsApp button for anyone in a hurry.
 * The contact cards and coverage list that used to sit above it were removed
 * at the client's request to cut scrolling: phone and WhatsApp stay here, and
 * the areas have their own section and pages.
 */
export default function SectionContact() {
  const adminProfile = useAdminProfile();
  const businessPhone = adminProfile?.phone || "+44 7541777225";

  return (
    <section
      className="py-8 sm:py-12 bg-gray-100 dark:bg-gray-900 transition-colors duration-500"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* One row: what this is, what it costs to start (nothing), and the
              two quicker ways in for anyone who would rather talk. */}
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight text-white sm:text-2xl">Book a plumber</h2>
              <p className="mt-0.5 text-xs text-blue-100 sm:text-sm">About a minute · No payment upfront · We call to confirm</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={`tel:${businessPhone}`}
                onClick={() => trackPhoneCall("booking_form_header")}
                aria-label="Call us instead"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:px-4"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                <span className="hidden sm:inline">Call instead</span>
              </a>
              <ButtonWhatsApp variant="solid" label="" source="booking_form_whatsapp" className="h-10 w-10 shrink-0 !rounded-xl shadow-none" />
            </div>
          </div>
          <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8">
            <FormBooking />
          </div>
        </div>
      </div>
    </section>
  );
}
