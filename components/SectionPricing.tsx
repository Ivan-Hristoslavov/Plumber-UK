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
    <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            FixMyLeak - Professional Rates
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
  return (
    <section
      className="relative py-12 sm:py-16 md:py-24 overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-500"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            FixMyLeak - Professional Rates
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Clear, competitive pricing with no hidden fees. Choose the service
            that best fits your needs.
          </p>
        </div>

        {/* Dynamic Pricing Cards - Fixed Height Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-center max-w-6xl mx-auto mb-16">
          {pricingCards.map((card, index) => {
            const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

            return (
            <div key={card.id} className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col h-full">
              {/* A single accent bar carries the card's colour. The old design put
                  four blurred blobs behind the content, which fought the text. */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${accent.bar}`} />

              <div className="flex flex-col h-full p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${accent.iconBg}`}>
                    <svg className={`w-6 h-6 ${accent.iconFg}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d={accent.iconPath} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rates. The price is the reason people are on this section, so
                    each row leads with the figure at display size rather than
                    hiding it in a table cell. */}
                {card.table_rows && card.table_rows.length > 0 && card.table_headers && (
                  <div className="space-y-2 mb-6 flex-shrink-0">
                    {card.table_rows.map((row, rowIndex) => {
                      const labelKey = card.table_headers![0];
                      const valueKeys = card.table_headers!.slice(1);

                      return (
                        <div
                          key={rowIndex}
                          className={`rounded-2xl px-4 py-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${accent.rateBg}`}
                        >
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              {labelKey}
                            </div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                              {row[labelKey] || ""}
                            </div>
                          </div>
                          <div className="text-right">
                            {valueKeys.map((key) => (
                              <div key={key}>
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  {key}
                                </div>
                                <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${accent.price}`}>
                                  {row[key] || ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* What's covered */}
                {card.notes && card.notes.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-5 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                      What&apos;s covered
                    </div>
                    <ul className="space-y-2.5">
                      {card.notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${accent.checkBg}`}>
                            <svg className={`w-2.5 h-2.5 ${accent.checkFg}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
                            </svg>
                          </span>
                          <span className="leading-snug">{note.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {/* Good-to-know notes. Four repeated tick icons in four colours read as
            decoration; these are terms, so they are set as a plain definition
            list with the operative phrase carrying the emphasis. */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Good to know
            </h3>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {[
              { term: "Labour only", detail: "Rates above exclude materials, which you are welcome to supply yourself." },
              { term: "Materials via us", detail: "Supplied at cost plus 20% if you would rather we handled it." },
              { term: "Call-out fee", detail: "Covers travel and the initial assessment of the problem." },
              { term: "Full-day rate", detail: "Works out cheaper per hour, subject to availability." },
            ].map((item) => (
              <div key={item.term}>
                <dt className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {item.term}
                </dt>
                <dd className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-7 pt-5 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center">
            Prices are benchmarked against average South West London rates.
          </p>
        </div>
      </div>
    </section>
  );
}
