"use client";

import { useState, useEffect } from "react";
import { usePricingCards } from "@/hooks/usePricingCards";
import type { PricingCard } from "@/types";

function PricingCardSkeleton() {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-600 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100 to-orange-100 rounded-full translate-y-12 -translate-x-12" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Icon */}
        <div className="flex items-center mb-6 flex-shrink-0">
          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl mr-4"></div>
          <div className="min-w-0 flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 mb-6 flex-1">
          <div className="space-y-3">
            {/* Header row */}
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            </div>
            {/* Data rows */}
            <div className="space-y-2">
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Skeleton */}
        <div className="space-y-2 mb-6 flex-shrink-0">
          <div className="flex items-start">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2 mt-0.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
          <div className="flex items-start">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2 mt-0.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
          <div className="flex items-start">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mr-2 mt-0.5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionPricingLoading() {
  return (
    <section className="relative py-10 sm:py-14 overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our rates
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Clear, competitive pricing with no hidden fees. Choose the service that best fits your needs.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-center max-w-6xl mx-auto mb-16">
          <PricingCardSkeleton />
          <PricingCardSkeleton />
        </div>
      </div>
    </section>
  );
}

// Cards are admin-managed and unbounded in number, so accents cycle rather than
// being keyed to a specific card.
const CARD_ACCENTS = [
  {
    bar: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconFg: "text-blue-600 dark:text-blue-400",
    rateBg: "bg-blue-50 dark:bg-blue-900/20",
    price: "text-blue-600 dark:text-blue-400",
    checkBg: "bg-blue-100 dark:bg-blue-900/40",
    checkFg: "text-blue-600 dark:text-blue-400",
    // Wrench — hourly repair work
    iconPath:
      "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  },
  {
    bar: "from-orange-500 to-red-600",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconFg: "text-orange-600 dark:text-orange-400",
    rateBg: "bg-orange-50 dark:bg-orange-900/20",
    price: "text-orange-600 dark:text-orange-400",
    checkBg: "bg-orange-100 dark:bg-orange-900/40",
    checkFg: "text-orange-600 dark:text-orange-400",
    // Calendar — full-day bookings
    iconPath:
      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
];

export function SectionPricing({ initialCards = [] }: { initialCards?: PricingCard[] }) {
  const [mounted, setMounted] = useState(false);
  const { pricingCards: fetchedCards, loading, error } = usePricingCards();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-supplied cards let this section render its real content in the HTML
  // instead of a skeleton. The hook still runs and takes over once it resolves,
  // so admin edits appear without a redeploy.
  const pricingCards = fetchedCards.length > 0 ? fetchedCards : initialCards;
  const hasContent = pricingCards.length > 0;

  // Without seed data, server and first client render must both be the skeleton:
  // usePricingCards reads a global cache that only exists on the client, so
  // `loading` differs between the two and would otherwise mismatch on hydration.
  if (!hasContent && (!mounted || loading)) {
    return <SectionPricingLoading />;
  }

  if (error && !hasContent) {
    return (
      <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-red-600 dark:text-red-400">Error loading pricing information</div>
        </div>
      </section>
    );
  }
  const single = pricingCards.length === 1;

  return (
    <section className="relative py-10 sm:py-14 overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300 mb-2">
            Transparent pricing
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Our rates
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Clear pricing, no hidden fees. Labour is charged by the hour.
          </p>
        </div>

        {/* One card is laid out wide (price on the left, what is covered on the
            right) instead of sitting in half of a two-column grid. */}
        <div className={`grid gap-5 mx-auto ${single ? "max-w-4xl" : "lg:grid-cols-2 max-w-6xl"}`}>
          {pricingCards.map((card, index) => {
            const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
            const labelKey = card.table_headers?.[0];
            const valueKeys = card.table_headers?.slice(1) ?? [];
            const rows = labelKey ? card.table_rows ?? [] : [];

            return (
              <article
                key={card.id}
                className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className={`h-1 w-full bg-gradient-to-r ${accent.bar}`} />

                <div className={`grid gap-5 p-5 sm:p-6 ${single ? "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-8" : ""}`}>
                  {/* Left: what it is, the price, and the way to book it */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent.iconBg}`}>
                        <svg className={`h-5 w-5 ${accent.iconFg}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d={accent.iconPath} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold leading-snug text-gray-900 dark:text-white">{card.title}</h3>
                        {card.subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{card.subtitle}</p>}
                      </div>
                    </div>

                    {rows.map((row, rowIndex) => (
                      <div key={rowIndex} className={`mt-4 rounded-2xl px-4 py-3 ${accent.rateBg}`}>
                        {valueKeys.map((key) => (
                          <div key={key} className="flex items-baseline gap-1.5">
                            <span className={`text-3xl font-extrabold tracking-tight ${accent.price}`}>{row[key] || ""}</span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{key}</span>
                          </div>
                        ))}
                        {row[labelKey!] && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                            </svg>
                            {row[labelKey!]}
                          </p>
                        )}
                      </div>
                    ))}

                    <a
                      href="#contact"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 md:mt-auto"
                    >
                      Book this service
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                      </svg>
                    </a>
                  </div>

                  {/* Right: what is covered, as compact tags rather than a long
                      one-per-line list. */}
                  {card.notes && card.notes.length > 0 && (
                    <div>
                      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        What&apos;s covered
                      </p>
                      <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                        {card.notes.map((note, noteIndex) => (
                          <li
                            key={noteIndex}
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs sm:text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
                          >
                            <svg className={`h-3 w-3 shrink-0 ${accent.checkFg}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
                            </svg>
                            {note.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Good to know: the four terms in one compact strip. */}
        <dl className="mx-auto mt-5 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700 lg:grid-cols-4">
          {[
            { term: "Labour only", detail: "Materials are extra. You can supply your own." },
            { term: "Materials via us", detail: "At cost plus 20% if we source them." },
            { term: "Call-out fee", detail: "Covers travel and the first assessment." },
            { term: "Full-day rate", detail: "Cheaper per hour, subject to availability." },
          ].map((item) => (
            <div key={item.term} className="bg-white p-3 sm:p-4 dark:bg-gray-800">
              <dt className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{item.term}</dt>
              <dd className="mt-0.5 text-xs sm:text-sm leading-snug text-gray-600 dark:text-gray-400">{item.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
          Prices are benchmarked against average South West London rates.
        </p>
      </div>
    </section>
  );
}
