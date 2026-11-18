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
      className="py-10 sm:py-14 bg-gray-100 dark:bg-gray-900 transition-colors duration-500"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  Book Your Service Online
                </h2>
                {/* Answers the three things people hesitate over before starting
                    a booking form: how long it takes, whether they pay now, and
                    what happens next. */}
                <p className="text-blue-100 text-sm sm:text-base">
                  Takes about a minute • No payment upfront • We call to confirm your slot
                </p>
              </div>

              {/* An emergency caller should never be funnelled into a form —
                  give them the phone as an equal option right here. */}
              <a
                href={`tel:${businessPhone}`}
                onClick={() => trackPhoneCall("booking_form_header")}
                className="inline-flex items-center justify-center gap-2 shrink-0 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2.5 text-white font-semibold text-sm backdrop-blur-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                In a hurry? Call instead
              </a>
              <ButtonWhatsApp
                variant="solid"
                label="WhatsApp"
                source="booking_form_whatsapp"
                className="shrink-0 py-2.5 text-sm"
              />
            </div>
          </div>
          <div className="py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8">
            <FormBooking />
          </div>
        </div>
      </div>
    </section>
  );
}
