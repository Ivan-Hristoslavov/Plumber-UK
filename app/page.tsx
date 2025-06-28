"use client";

import Image from "next/image";
import { Suspense } from "react";
import LayoutMain from "@/components/LayoutMain";
import { SectionHero } from "@/components/SectionHero";
import { SectionPricing } from "@/components/SectionPricing";
import { FAQSection } from "@/components/FAQSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { GallerySection } from "@/components/GallerySection";
import FooterMain from "@/components/FooterMain";
import { AdminProfileData } from "@/components/AdminProfileData";
import { AdminProfileMarkdown } from "@/components/AdminProfileMarkdown";
import { useAreas } from "@/hooks/useAreas";
import FormBooking from "@/components/FormBooking";
import { ReviewForm } from "@/components/ReviewForm";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function HomePage() {
  const { areas, loading: areasLoading } = useAreas();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <SectionHero />

      {/* Pricing Section */}
      <SectionPricing />

      {/* About Section */}
      <section
        className="py-20 bg-white dark:bg-gray-900 transition-colors duration-500"
        id="about"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  About{" "}
                  <AdminProfileData type="name" fallback="Plamen Zhelev" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                  Professional Plumbing Services You Can Trust
                </h2>

                <div className="space-y-4">
                  {/* Custom About Text */}
                  <AdminProfileMarkdown
                    type="about"
                    fallback=""
                    className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300"
                  />

                  {/* Customization Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Experience
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          <AdminProfileData
                            type="years_of_experience"
                            fallback="10+ years"
                          />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Certifications
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <AdminProfileData
                            type="certifications"
                            fallback="Gas Safe Registered"
                          />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                      <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          Response Time
                        </p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          <AdminProfileData
                            type="response_time"
                            fallback="45 minutes"
                          />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                      <div className="w-8 h-8 bg-amber-500 dark:bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Specializations
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          <AdminProfileData
                            type="specializations"
                            fallback="Emergency repairs, Boiler installations"
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Services */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Emergency repairs",
                  "Boiler installations",
                  "Bathroom plumbing",
                  "Water regulations compliance",
                ].map((service, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      {service}
                    </span>
                  </div>
                ))}
              </div>

              {/* Contact Button */}
              <div className="pt-4">
                <a
                  href="#contact"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Get Free Quote
                </a>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/plamen.jpeg"
                  alt="Professional Plumber at work"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section
        className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-500"
        id="areas"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
              <svg
                className="w-4 h-4 mr-2"
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
              Service Coverage
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Areas We Cover
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              Professional plumbing services across South West London with rapid
              response times
            </p>
          </div>

          {areasLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-600 dark:text-gray-300">
                Loading service areas...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {areas.map((area) => (
                <div
                  key={area.id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                      {area.name}
                    </h3>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
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

                  <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                    {area.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {area.response_time} response
                    </div>
                    <a
                      href={`/areas/${area.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-300"
                    >
                      Learn More →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Outside Our Main Areas?
              </h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-300">
              If you're outside these zones, feel free to contact us to check
              availability – we prioritise local response but may be able to
              help or refer you to a trusted colleague.
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium transition-colors duration-300">
              We aim to arrive within{" "}
              <AdminProfileData type="response_time" fallback="45 minutes" />{" "}
              for emergency callouts in our main service areas.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection />

      {/* Gallery Section */}
      <GallerySection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Contact Section */}
      <section
        className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 relative overflow-hidden transition-colors duration-500"
        id="contact"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%),
                             radial-gradient(circle at 50% 50%, #06b6d4 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-white/10 rounded-full text-white dark:text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Get In Touch
                </div>
                <h2 className="text-4xl font-bold text-white mb-6 transition-colors duration-300">
                  Ready to Fix Your Plumbing?
                </h2>
                <p className="text-xl text-white/80 leading-relaxed transition-colors duration-300">
                  Contact us today for fast, reliable plumbing services. We're
                  available 24/7 for emergencies.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 bg-white/10 dark:bg-white/5 rounded-2xl backdrop-blur-sm border border-white/20 dark:border-white/10">
                  <div className="w-12 h-12 bg-green-500/80 dark:bg-green-600/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <div>
                    <h3 className="text-lg font-semibold text-white transition-colors duration-300">
                      Phone
                    </h3>
                    <p className="text-white/70 transition-colors duration-300">
                      Call us anytime, 24/7 emergency service
                    </p>
                    <a
                      href="tel:+447700900123"
                      className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-300"
                    >
                      <AdminProfileData
                        type="phone"
                        fallback="+44 7700 900123"
                      />
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/10 dark:bg-white/5 rounded-2xl backdrop-blur-sm border border-white/20 dark:border-white/10">
                  <div className="w-12 h-12 bg-blue-500/80 dark:bg-blue-600/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white transition-colors duration-300">
                      Email
                    </h3>
                    <p className="text-white/70 transition-colors duration-300">
                      Send us your questions anytime
                    </p>
                    <a
                      href="mailto:plamen@fixmyleak.co.uk"
                      className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-300"
                    >
                      <AdminProfileData
                        type="email"
                        fallback="plamen@fixmyleak.co.uk"
                      />
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/10 dark:bg-white/5 rounded-2xl backdrop-blur-sm border border-white/20 dark:border-white/10">
                  <div className="w-12 h-12 bg-purple-500/80 dark:bg-purple-600/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <div>
                    <h3 className="text-lg font-semibold text-white transition-colors duration-300">
                      Service Area
                    </h3>
                    <p className="text-white/70 transition-colors duration-300">
                      South West London coverage
                    </p>
                    <p className="text-blue-300 font-semibold">
                      <AdminProfileData
                        type="service_areas"
                        fallback="Clapham, Balham, Chelsea, Wandsworth, Battersea"
                      />
                    </p>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="bg-white/10 dark:bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-white mb-4 transition-colors duration-300">
                  Professional Credentials
                </h3>
                <div className="flex flex-wrap gap-2 pt-4">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                    <svg
                      className="w-4 h-4 mr-1 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white/90 text-xs font-medium">
                      Fully Qualified
                    </span>
                  </div>
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                    <svg
                      className="w-4 h-4 mr-1 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        clipRule="evenodd"
                        d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                        fillRule="evenodd"
                      />
                    </svg>
                    <span className="text-white/90 text-xs font-medium">
                      Public Liability
                    </span>
                  </div>
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                    <svg
                      className="w-4 h-4 mr-1 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        clipRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        fillRule="evenodd"
                      />
                    </svg>
                    <span className="text-white/90 text-xs font-medium">
                      Gas Safe:{" "}
                      <AdminProfileData
                        type="gas_safe_number"
                        fallback="GAS123456"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="relative">
              {/* Background decorative elements for form */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl transform rotate-1"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-3xl transform -rotate-1"></div>

              <div className="relative bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-white/10 transition-colors duration-300">
                <FormBooking />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Form Section */}
      <ReviewForm />
    </main>
  );
}
