import type { Metadata } from "next";
import Link from "next/link";

import { BRAND_NAME } from "@/lib/brand";
import {
  FOUNDING_HREF,
  FOUNDING_LIMIT,
  FOUNDING_PLANS,
  FOUNDING_SHARED_BENEFITS,
  formatPlanPrice,
  joinHref,
} from "@/lib/founding";
import { getFoundingPlaces } from "@/lib/founding-server";

// The places counter is read from the database, so refresh it every minute
// rather than baking in whatever it was at build time.
export const revalidate = 60;

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Founding 100 Membership";
  const description = `Join the first ${FOUNDING_LIMIT} local homeowners with ${BRAND_NAME}: member labour rates, priority booking and plumbing advice from £6.99 a month. Cancel anytime.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE}${FOUNDING_HREF}` },
    openGraph: {
      title: `${title} | ${BRAND_NAME}`,
      description,
      url: `${BASE}${FOUNDING_HREF}`,
      type: "website",
      locale: "en_GB",
      siteName: BRAND_NAME,
      images: [{ url: "/fix_my_leak_logo.jpg", width: 1200, height: 630, alt: title }],
    },
  };
}

const BENEFITS = [
  {
    title: "Member labour rates",
    body: "A lower hourly rate on every job: £65 on Essential, £50 on Priority and Premium.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Priority booking",
    body: "We aim to offer members diary slots ahead of non-members. It depends on availability and is not a guaranteed response time.",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Plumbing advice",
    body: "Ask by phone or WhatsApp. It is general guidance and does not replace an inspection when one is needed.",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  {
    title: "Cancel anytime",
    body: "No minimum term and no cancellation fee. You stay for as long as it is useful to you.",
    icon: "M5 13l4 4L19 7",
  },
];

const STEPS = [
  {
    title: "Choose your plan",
    body: "Pick the monthly plan that suits how often you call a plumber.",
  },
  {
    title: "Read the terms and apply",
    body: "You see the full membership terms first, then tell us about you and your home.",
  },
  {
    title: "We confirm your place",
    body: "We confirm in writing, with your start date and how payment works. Benefits start after your first successful payment.",
  },
];

const FINE_PRINT = [
  "Places go to the first 100 accepted applicants, subject to capacity and your home being in our service area.",
  "Member rates apply to labour in standard working hours, within our service area and subject to availability.",
  "Materials, parts, parking and congestion or ULEZ charges are not included. We tell you in advance where we can and ask before incurring them.",
  "Premium's included repairs start after 90 days of paid membership and are limited, with exclusions such as hidden leaks, drainage blockages, gas and electrical work.",
];

const FAQ = [
  {
    q: "Can I cancel?",
    a: "Yes, at any time and with no cancellation fee. There is no minimum term. Your benefits normally continue until the end of the period you have already paid for.",
  },
  {
    q: "Are materials and parts included?",
    a: "No. Membership covers the labour rate. Materials, parts and parking are charged separately, and we agree any significant cost with you first.",
  },
  {
    q: "What does priority booking mean?",
    a: "Where we can, we offer members appointment slots before non-members. It is not a promised response time, emergency attendance or 24/7 cover.",
  },
  {
    q: "Is my place guaranteed?",
    a: `Places are offered to the first ${FOUNDING_LIMIT} accepted applicants. We confirm acceptance in writing, and may decline an application only for fair reasons such as capacity or location.`,
  },
  {
    q: "I only need a plumber once. Can I still book?",
    a: "Of course. You do not need to be a member to book us. Membership is for homeowners who want better rates and a plumber they know.",
  },
];

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
    </svg>
  );
}

export default async function FoundingPage() {
  const places = await getFoundingPlaces();
  const full = places !== null && places.remaining === 0;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Founding 100", item: `${BASE}${FOUNDING_HREF}` },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Invitation */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-blue-200">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-blue-300">/</span>
            <span className="text-white font-medium">Founding 100</span>
          </nav>

          <p className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-blue-100 mb-5">
            {BRAND_NAME} Founding {FOUNDING_LIMIT}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight mb-5">
            Be one of our first{" "}
            <span className="text-blue-300">{FOUNDING_LIMIT} founding members</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            We are inviting {FOUNDING_LIMIT} local homeowners to build a trusted, long-term
            relationship with {BRAND_NAME}, with member rates and first pick of our diary.
          </p>

          <a
            href="#plans"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-white text-blue-800 hover:bg-blue-50 px-8 sm:px-10 py-4 text-lg font-extrabold uppercase tracking-wide shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            See the plans
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
            </svg>
          </a>

          {places && (
            <p className="mt-5 text-sm font-semibold text-blue-100">
              {places.remaining === 0
                ? `All ${places.limit} founding places are taken`
                : places.taken === 0
                  ? `All ${places.limit} founding places are open`
                  : `${places.taken} of ${places.limit} founding places taken`}
            </p>
          )}
        </div>
      </section>

      {/* Why */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Why a Founding {FOUNDING_LIMIT}?
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {BRAND_NAME} is a local plumbing business. We would rather look after a small
          group of homeowners well than only ever meet people on their worst day. So we are
          opening {FOUNDING_LIMIT} founding places for households who want a plumber they
          know and trust. In return you get better rates and first call on our diary.
        </p>
      </section>

      {/* What you get */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <h2 className="sr-only">What members get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={benefit.icon} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{benefit.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="scroll-mt-24 bg-white dark:bg-gray-950/40 border-y border-gray-200 dark:border-gray-800 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Choose your plan
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Every plan is monthly with no minimum term. You see the full terms before you apply.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {FOUNDING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl bg-white dark:bg-gray-800 p-7 sm:p-8 ${
                  plan.highlight
                    ? "border-2 border-blue-500 shadow-xl shadow-blue-500/10 md:-translate-y-3"
                    : "border border-gray-200 dark:border-gray-700 shadow-sm"
                }`}
              >
                {plan.comingSoon && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 px-3.5 py-1 text-xs font-bold uppercase tracking-wide">
                    Launching soon
                  </span>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-5 min-h-[2.5rem]">{plan.tagline}</p>

                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">
                    {formatPlanPrice(plan.price)}
                  </span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">/ month</span>
                </div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-6">
                  £{plan.labourRate} per hour {plan.rateApplies ?? "member labour rate"}
                </p>

                <ul className="space-y-3 mb-7 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-800 dark:text-gray-100 font-medium">
                      <Check className="text-blue-600 dark:text-blue-400 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                  {FOUNDING_SHARED_BENEFITS.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="text-green-600 dark:text-green-400 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {full ? (
                  <span
                    aria-disabled="true"
                    className="block w-full text-center rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide cursor-not-allowed"
                  >
                    All places taken
                  </span>
                ) : plan.comingSoon ? (
                  <span
                    aria-disabled="true"
                    className="block w-full text-center rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide cursor-not-allowed"
                  >
                    Join {plan.name} — coming soon
                  </span>
                ) : (
                  <Link
                    href={joinHref(plan.id)}
                    className={`block w-full text-center rounded-xl px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5 ${
                      plan.highlight
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                        : "bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900"
                    }`}
                  >
                    Join {plan.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Prices are per month. Materials and parking are charged separately.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
          How it works
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <span className="flex w-10 h-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold mb-4">
                {index + 1}
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* The small print, in plain sight rather than behind a link */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">The good to know</h2>
          <ul className="space-y-3">
            {FINE_PRINT.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Questions
        </h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-gray-900 dark:text-white [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg className="w-5 h-5 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </summary>
              <p className="px-5 pb-5 -mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready to be one of the {FOUNDING_LIMIT}?
          </h2>
          <p className="text-blue-100 mb-7">
            Pick a plan, read the terms and tell us about your home. It takes a couple of minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#plans"
              className="inline-flex items-center justify-center rounded-xl bg-white text-blue-800 hover:bg-blue-50 px-8 py-3.5 text-base font-extrabold uppercase tracking-wide shadow-lg transition-colors"
            >
              Choose a plan
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 px-8 py-3.5 text-base font-semibold transition-colors"
            >
              Just need a plumber? Go to {BRAND_NAME}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
