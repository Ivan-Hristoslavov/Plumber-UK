"use client";

import Link from "next/link";

import FormBooking from "./FormBooking";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { ButtonWhatsApp } from "@/components/ButtonWhatsApp";
import { trackPhoneCall } from "@/components/GoogleAnalytics";
import { AREA_SERVICES, type AreaContent } from "@/lib/area-content";

export type AreaFaq = { question: string; answer: string };

interface AreaPageProps {
  areaName: string;
  postcode: string;
  responseMinutes: string;
  content: AreaContent;
  faqs: AreaFaq[];
  /** "From £90" style prices for the two main services, when known. */
  prices: { leakDetection: string | null };
  nearbyAreas: { name: string; slug: string }[];
}

const PHONE_PATH =
  "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z";

/**
 * One landing page per covered area. Compact, like the homepage, and built
 * from copy that is specific to the area (lib/area-content.ts) so the pages
 * are not near-duplicates of each other.
 */
export function AreaPage({ areaName, postcode, responseMinutes, content, faqs, prices, nearbyAreas }: AreaPageProps) {
  const profile = useAdminProfile();
  const businessPhone = profile?.phone || "+44 7541777225";
  const displayPhone = businessPhone.replace(/^\+44\s?/, "0");

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-blue-100">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2 text-blue-300">/</span>
            <Link href="/areas" className="hover:text-white">Areas</Link>
            <span className="mx-2 text-blue-300">/</span>
            <span className="font-medium text-white">{areaName}</span>
          </nav>

          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            Plumber &amp; Leak Detection in <span className="text-yellow-300">{areaName}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-blue-100 sm:text-lg">
            Leaks found and fixed, blocked drains cleared and same-day call-outs across {areaName} (
            {content.postcodes.join(", ") || postcode}). Typical response around {responseMinutes} minutes.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            {prices.leakDetection && (
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">Leak detection {prices.leakDetection}</span>
            )}
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">No payment upfront</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <a
              href={`tel:${businessPhone}`}
              onClick={() => trackPhoneCall("area_page_hero")}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-lg font-bold shadow-lg shadow-red-900/30 transition-colors hover:bg-red-500 sm:col-span-1"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d={PHONE_PATH} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              {displayPhone}
            </a>
            <a
              href="#book"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-4 py-3 font-semibold backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Book online
            </a>
            <ButtonWhatsApp variant="solid" label="WhatsApp" source="area_page_whatsapp" className="rounded-lg px-4 py-3 text-base" />
          </div>
        </div>
      </section>

      {/* About the area */}
      <section className="py-10 sm:py-12">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Your local plumber in {areaName}</h2>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">{content.intro[0]}</p>
            <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">{content.intro[1]}</p>
          </div>
          {content.neighbourhoods.length > 0 && (
            <aside className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                We cover all of {areaName}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {content.neighbourhoods.map((place) => (
                  <li key={place} className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                    {place}
                  </li>
                ))}
                {content.postcodes.map((code) => (
                  <li key={code} className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {code}
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>

      {/* Leak detection in the area */}
      <section className="bg-white py-10 dark:bg-gray-800/60 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Leak detection in {areaName}</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-gray-700 dark:text-gray-300">
            Water through the ceiling, a damp patch, a meter that keeps turning or a bill that suddenly jumps usually means a
            hidden leak. We trace it to the source before opening anything up, repair it, and leave the area tidy.{" "}
            {content.leakNote}
          </p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Find", "We trace the leak and check the pipework around it, so only the right spot is opened up."],
              ["Fix", "We repair the pipe, joint, valve or fitting, on the same visit where we can."],
              ["Check", "We test the repair and explain what happened and what, if anything, to watch for."],
            ].map(([title, text], index) => (
              <li key={title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {index + 1}. {title}
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{text}</p>
              </li>
            ))}
          </ol>
          <Link href="/services/leak-detection" className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300">
            More about leak detection →
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Plumbing services in {areaName}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AREA_SERVICES.map((service) => (
              <li key={service.title} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {service.href ? (
                    <Link href={service.href} className="hover:text-blue-700 dark:hover:text-blue-300">
                      {service.title} in {areaName}
                    </Link>
                  ) : (
                    <>
                      {service.title} in {areaName}
                    </>
                  )}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{service.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-white py-10 dark:bg-gray-800/60 sm:py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Questions from {areaName} customers</h2>
            <div className="mt-5 divide-y divide-gray-200 rounded-2xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              {faqs.map((faq) => (
                <details key={faq.question} className="group p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                    <span className="text-blue-600 transition-transform group-open:rotate-45 dark:text-blue-400" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nearby areas */}
      {nearbyAreas.length > 0 && (
        <section className="py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Also covering nearby</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {nearbyAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/areas/${area.slug}`}
                  className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                >
                  Plumber {area.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking */}
      <section id="book" className="scroll-mt-24 py-10 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white sm:text-2xl">Book a plumber in {areaName}</h2>
                <p className="text-xs text-blue-100 sm:text-sm">About a minute · No payment upfront · We call to confirm</p>
              </div>
              <a
                href={`tel:${businessPhone}`}
                onClick={() => trackPhoneCall("area_page_form_header")}
                aria-label="Call us instead"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 text-sm font-semibold text-white hover:bg-white/25"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={PHONE_PATH} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                <span className="hidden sm:inline">Call instead</span>
              </a>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <FormBooking />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
