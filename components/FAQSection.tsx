"use client";

import { useState } from "react";
import { useFAQ } from "@/hooks/useFAQ";

const VISIBLE_COUNT = 4;

export function FAQSection() {
  const { faqItems, isLoading, error } = useFAQ();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-600 dark:text-gray-300">Loading FAQ...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error || faqItems.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {error ? "Error loading FAQ" : "No FAQ items available yet."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const hasMore = faqItems.length > VISIBLE_COUNT;

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about our plumbing services
          </p>
        </div>

        <div className="relative">
          <div className="space-y-4">
            {/* Visible items (first 4) - no fade so no clipped edges */}
            {faqItems.slice(0, VISIBLE_COUNT).map((item, index) => (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600 overflow-hidden"
                >
                  <button
                    aria-expanded={openItems.includes(index)}
                    aria-controls={`faq-panel-${item.id}`}
                    className="w-full px-5 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => toggleItem(index)}
                  >
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white pr-3 sm:pr-4">
                      {item.question}
                    </h3>
                    <div
                      className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center transition-transform duration-300 ${
                        openItems.includes(index) ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
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
                  </button>

                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-hidden={!openItems.includes(index)}
                    className={`transition-all duration-300 ease-in-out ${
                      openItems.includes(index)
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <div className="px-5 sm:px-8 pb-4 sm:pb-6">
                      <div className="border-t border-gray-100 dark:border-gray-600 pt-3 sm:pt-4">
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            ))}

            {/* Expandable: extra items with height animation */}
            {hasMore && (
              <div
                className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
                style={{ maxHeight: showAll ? "4000px" : "0" }}
              >
                <div className="space-y-4 pt-4">
                  {faqItems.slice(VISIBLE_COUNT).map((item, sliceIndex) => {
                    const index = VISIBLE_COUNT + sliceIndex;
                    return (
                      <div
                        key={item.id}
                        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600 overflow-hidden"
                      >
                        <button
                          aria-expanded={openItems.includes(index)}
                          aria-controls={`faq-panel-${item.id}`}
                          className="w-full px-5 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => toggleItem(index)}
                        >
                          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white pr-3 sm:pr-4">
                            {item.question}
                          </h3>
                          <div
                            className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center transition-transform duration-300 ${
                              openItems.includes(index) ? "rotate-180" : ""
                            }`}
                          >
                            <svg
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
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
                        </button>

                        <div
                          id={`faq-panel-${item.id}`}
                          role="region"
                          aria-hidden={!openItems.includes(index)}
                          className={`transition-all duration-300 ease-in-out ${
                            openItems.includes(index)
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          } overflow-hidden`}
                        >
                          <div className="px-5 sm:px-8 pb-4 sm:pb-6">
                            <div className="border-t border-gray-100 dark:border-gray-600 pt-3 sm:pt-4">
                              <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {hasMore && (
          <div className="flex justify-center mt-4 sm:mt-6">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-medium shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
            >
              <span>{showAll ? "Show Less" : `Show All ${faqItems.length} Questions`}</span>
              <svg
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 ${showAll ? "rotate-180" : ""}`}
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
            </button>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-6 sm:mt-8 md:mt-10 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 text-white">
            <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 md:mb-4">Still have questions?</h3>
            <p className="text-white/90 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 md:mb-6 max-w-2xl mx-auto">
              Our friendly team is here to help. Get in touch and we'll answer
              any questions you have about our services.
            </p>
            <a
              className="inline-flex items-center justify-center bg-white text-blue-600 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
