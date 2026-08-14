"use client";

import Link from "next/link";
import FormBooking from "./FormBooking";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { trackPhoneCall } from "@/components/GoogleAnalytics";
import { responseTimeMinutes } from "@/lib/response-time";

type AreaLink = { name: string; slug: string; postcode: string };
type RelatedService = { name: string; slug: string; price: number | null };

interface ServicePageProps {
  name: string;
  description: string;
  price: number | null;
  durationMinutes: number | null;
  areas: AreaLink[];
  relatedServices: RelatedService[];
}

export function ServicePage({
  name,
  description,
  price,
  durationMinutes,
  areas,
  relatedServices,
}: ServicePageProps) {
  const profile = useAdminProfile();
  const businessPhone = profile?.phone || "+44 7541777225";
  const displayPhone = businessPhone.replace(/^\+44\s?/, "0");
  const responseTime = responseTimeMinutes(profile?.response_time);

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 md:py-28 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-20 right-16 w-24 h-24 bg-white rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
            South West London • {responseTime}-minute response
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {name} in <span className="text-yellow-300">South West London</span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${businessPhone}`}
              onClick={() => trackPhoneCall("service_page_hero")}
              aria-label={`Call now ${displayPhone}`}
              className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-red-900/30 transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {displayPhone}
            </a>
            <button
              onClick={() => document.getElementById("book")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Book Online
            </button>
          </div>
        </div>
      </section>

      {/* What it covers + price */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {price !== null && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                From
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">£{price}</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Quoted before any work starts — no hidden fees.
              </p>
            </div>
          )}

          {durationMinutes !== null && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Typical visit
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {durationMinutes} min
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Most jobs are finished in a single visit.
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Response
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{responseTime} min</div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Emergency callouts across South West London.
            </p>
          </div>
        </div>
      </section>

      {/* Areas covered - internal links to the area pages */}
      {areas.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {name} near you
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            We cover these areas for {name.toLowerCase()}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center transition-colors"
              >
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{area.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{area.postcode}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Booking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="book">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 sm:px-8 py-5 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Book {name}</h2>
                <p className="text-blue-100 text-sm sm:text-base">
                  Takes about a minute • No payment upfront • We call to confirm your slot
                </p>
              </div>
              <a
                href={`tel:${businessPhone}`}
                onClick={() => trackPhoneCall("service_page_form_header")}
                className="inline-flex items-center justify-center gap-2 shrink-0 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2.5 text-white font-semibold text-sm backdrop-blur-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                In a hurry? Call instead
              </a>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <FormBooking />
          </div>
        </div>
      </section>

      {/* Other services */}
      {relatedServices.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Other services
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {relatedServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {service.name}
                {service.price !== null && (
                  <span className="text-blue-500 dark:text-blue-400"> · from £{service.price}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
