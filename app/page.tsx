"use client";

import Image from "next/image";

import { FAQSection } from "../components/FAQSection";

import { SectionHero } from "@/components/SectionHero";
import { SectionPricing } from "@/components/SectionPricing";
import { FormBooking } from "@/components/FormBooking";

const faqItems = [
  {
    question: "What areas do you cover in London?",
    answer:
      "We provide plumbing services across South West London, including Clapham, Balham, Chelsea, Battersea, Wandsworth, and Streatham. We aim to arrive within 45 minutes for emergency callouts in these areas.",
  },
  {
    question: "Are your plumbers qualified?",
    answer:
      "Yes, we are fully qualified and Gas Safe registered with over 10 years of experience. We maintain professional qualifications and have worked on high-end properties including Claridge's Hotel in Mayfair.",
  },
  {
    question: "How quickly can you respond to emergencies?",
    answer:
      "We offer same-day emergency plumbing services with response times of up to 45 minutes for our main coverage areas in South West London. Available 24/7 for urgent plumbing issues.",
  },
  {
    question: "What are your payment terms?",
    answer:
      "We accept all major credit cards, bank transfers, and cash payments. We provide transparent pricing with no hidden costs - you pay exactly what we quote. Payment is due upon completion of work.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Home Section */}
      <SectionHero />

      {/* Pricing Section */}
      <SectionPricing />

      {/* About Section */}
      <section
        className="relative py-24 overflow-hidden transition-all duration-500"
        id="about"
      >
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-all duration-500" />
        <div className="absolute inset-0 opacity-5 dark:opacity-20">
          <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500 dark:bg-blue-400 rounded-full" />
          <div className="absolute top-60 right-20 w-32 h-32 bg-purple-500 dark:bg-purple-400 rounded-full" />
          <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-yellow-500 dark:bg-yellow-400 rounded-full" />
          <div className="absolute bottom-20 right-10 w-36 h-36 bg-green-500 dark:bg-green-400 rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              About Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              Meet the professionals who bring years of experience and
              dedication to every plumbing job
            </p>
          </div>

          {/* Main Content Grid - Symmetric Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Image */}
            <div className="flex justify-center">
              <div className="relative group max-w-md">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 p-4 group-hover:shadow-3xl transition-all duration-500 transform group-hover:-translate-y-2">
                  <div className="relative rounded-2xl overflow-hidden">
                    <Image
                      priority
                      alt="Plamen Zhelev"
                      className="object-cover w-full h-[500px] transition-transform duration-500 group-hover:scale-105"
                      height={500}
                      src="/plamen.jpeg"
                      width={400}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Professional Name Card */}
                <div className="mt-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 px-6 py-4 transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                      Plamen Zhelev
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Professional Plumber
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-3">
                      <svg
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">
                        Fully Qualified • 10+ Years
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium transition-colors duration-300">
                        Available Now
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center mr-4 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Your Trusted Plumbing Partner
                  </h3>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                    My name is Plamen Zhelev, and I'm a fully qualified plumbing
                    and heating engineer based in London. With over 10 years of
                    hands-on experience and professional qualifications, I run
                    my own company – PZ Plumbing Ltd.
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                    I cover areas including Clapham, Balham, Chelsea,
                    Wandsworth, Battersea, and the surrounding parts of London.
                    I offer emergency callouts with response times of up to 45
                    minutes and same-day service guaranteed.
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded-lg transition-all duration-300">
                    <div className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0 transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium transition-colors duration-300">
                        <strong>Notable Project:</strong> Worked at Claridge's
                        Hotel in Mayfair for three years, installing and
                        maintaining high-end plumbing systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 transition-all duration-500">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                  Our Services
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 transition-all duration-300">
                    <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200 font-medium transition-colors duration-300">
                      Emergency Leak Detection
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 transition-all duration-300">
                    <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300">
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
                    <span className="text-gray-800 dark:text-gray-200 font-medium transition-colors duration-300">
                      Pipe Repairs & Replacements
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 transition-all duration-300">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M8 14v3a2 2 0 002 2h4a2 2 0 002-2v-3M8 14V9a2 2 0 012-2h4a2 2 0 012 2v5M8 14H6a2 2 0 01-2-2V9a2 2 0 012-2h2m8 7h2a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200 font-medium transition-colors duration-300">
                      Bathroom & Kitchen Installations
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <span className="text-gray-800 font-medium">
                      Boiler Repairs & Servicing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas We Cover Section */}
      <section
        className="relative py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-500"
        id="areas"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Areas We Cover
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto transition-colors duration-300">
              FixMyLeak proudly serves South West and Central London areas with
              same-day plumbing and leak detection services
            </p>
          </div>

          {/* Service Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Clapham",
                postcode: "SW4",
                description:
                  "Emergency plumber Clapham - Same day leak detection and pipe repairs",
              },
              {
                name: "Balham",
                postcode: "SW12",
                description:
                  "Fast response plumbing services in Balham - Available 24/7",
              },
              {
                name: "Battersea",
                postcode: "SW8",
                description:
                  "Professional plumber Battersea - Boiler repairs and installations",
              },
              {
                name: "Wandsworth",
                postcode: "SW18",
                description:
                  "Trusted plumbing services Wandsworth - Emergency callouts",
              },
              {
                name: "Chelsea",
                postcode: "SW3",
                description:
                  "Premium plumber Chelsea - Luxury bathroom installations",
              },
              {
                name: "Streatham",
                postcode: "SW16",
                description:
                  "Reliable plumber Streatham - Leak detection specialists",
              },
            ].map((area) => (
              <div
                key={area.name}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-400 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {area.name}
                  </h3>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
                    {area.postcode}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {area.description}
                </p>
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">45-minute response time</span>
                </div>
              </div>
            ))}
          </div>

          {/* Coverage Information */}

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
              We aim to arrive within 45 minutes for emergency callouts in our
              main service areas.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Section */}
      <section
        className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-12 overflow-hidden transition-colors duration-500"
        id="contact"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full" />
          <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Get In Touch</h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Ready to fix your plumbing issues? Contact us today for fast,
              reliable service.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Contact Information
              </h3>

              {/* Contact Cards */}
              <div className="space-y-4">
                <div className="group bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="h-5 w-5 text-white"
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
                      <p className="font-semibold text-white">
                        Emergency Hotline
                      </p>
                      <p className="text-white/80 text-lg font-bold">
                        07541777225
                      </p>
                      <p className="text-white/60 text-xs">
                        45 min response time guaranteed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="h-5 w-5 text-white"
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
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <p className="text-white/80 text-lg font-bold">
                        yo_plam@yahoo.com
                      </p>
                      <p className="text-white/60 text-xs">
                        Free consultation available
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="h-5 w-5 text-white"
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
                      <p className="font-semibold text-white">Service Areas</p>
                      <div className="text-white/80">
                        <p className="font-bold text-sm">London Coverage</p>
                        <p className="text-sm">
                          Clapham • Balham • Chelsea • Wandsworth • Battersea
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2 pt-4">
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
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
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
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
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
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
                    PZ Plumbing Ltd
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20 dark:border-gray-600/50 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-white mb-4">
                Book a Service
              </h3>
              <FormBooking />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
