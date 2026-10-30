"use client";

import Link from "next/link";
import { useState } from "react";

import { BRAND_NAME } from "@/lib/brand";
import {
  FOUNDING_HREF,
  FOUNDING_PLANS,
  FOUNDING_SHARED_BENEFITS,
  FOUNDING_TERMS_VERSION,
  formatPlanPrice,
  getFoundingPlan,
  type FoundingPlanId,
} from "@/lib/founding";

const FIELD =
  "w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-3.5 py-3 text-base text-gray-900 dark:text-white placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
const LABEL = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

type Status = "idle" | "submitting" | "done";

export default function FoundingJoinForm({ initialPlan }: { initialPlan: FoundingPlanId }) {
  const [plan, setPlan] = useState<FoundingPlanId>(initialPlan);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const selected = getFoundingPlan(plan)!;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = new FormData(event.currentTarget);
    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch("/api/founding/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone"),
          address: form.get("address"),
          postcode: form.get("postcode"),
          acceptTerms: form.get("acceptTerms") === "on",
          marketingOptIn: form.get("marketingOptIn") === "on",
          termsVersion: FOUNDING_TERMS_VERSION,
          website: form.get("website"),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again or call us.");
        setStatus("idle");
        return;
      }

      setSubmittedEmail(String(form.get("email") || ""));
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("We could not reach the server. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="max-w-xl mx-auto rounded-3xl border border-green-200 dark:border-green-800 bg-white dark:bg-gray-800 p-8 sm:p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Application received</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Thank you. We have sent a confirmation to <strong className="text-gray-900 dark:text-white">{submittedEmail}</strong>.
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We will review your application and confirm your place in writing. Nothing has been charged.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition-colors"
        >
          Back to {BRAND_NAME}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 lg:gap-8 items-start">
      <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-8">
        {/* 1. Plan */}
        <fieldset>
          <legend className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Your plan</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FOUNDING_PLANS.map((option) => (
              <label
                key={option.id}
                className={`relative rounded-2xl border-2 p-4 transition ${
                  option.comingSoon
                    ? "cursor-not-allowed border-gray-200 dark:border-gray-700 opacity-60"
                    : plan === option.id
                      ? "cursor-pointer border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "cursor-pointer border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                } focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={option.id}
                  className="sr-only"
                  checked={plan === option.id}
                  disabled={option.comingSoon}
                  onChange={() => setPlan(option.id)}
                />
                <span className="block text-base font-bold text-gray-900 dark:text-white">{option.name}</span>
                <span className="block text-sm text-gray-600 dark:text-gray-300">{formatPlanPrice(option.price)} / month</span>
                <span className="mt-1 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                  £{option.labourRate}/hour{option.rateApplies ? ` ${option.rateApplies}` : ""}
                </span>
                {option.comingSoon && (
                  <span className="mt-2 inline-block rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 text-[11px] font-bold uppercase text-amber-800 dark:text-amber-200">
                    Launching soon
                  </span>
                )}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 2. Details */}
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-3 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">About you and your home</span>
          </legend>

          <div>
            <label className={LABEL} htmlFor="fullName">Full name</label>
            <input className={FIELD} id="fullName" name="fullName" type="text" autoComplete="name" required minLength={2} maxLength={120} placeholder="Your full name" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL} htmlFor="email">Email</label>
              <input className={FIELD} id="email" name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" />
            </div>
            <div>
              <label className={LABEL} htmlFor="phone">Phone</label>
              <input className={FIELD} id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="07xxx xxxxxx" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_10rem] gap-4">
            <div>
              <label className={LABEL} htmlFor="address">Property address</label>
              <input className={FIELD} id="address" name="address" type="text" autoComplete="street-address" required minLength={5} maxLength={300} placeholder="House number and street" />
            </div>
            <div>
              <label className={LABEL} htmlFor="postcode">Postcode</label>
              <input className={`${FIELD} uppercase`} id="postcode" name="postcode" type="text" autoComplete="postal-code" required maxLength={12} placeholder="SW16 5HA" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Membership covers one nominated home within our service area.
          </p>

          {/* Honeypot: invisible to people, tempting to bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
        </fieldset>

        {/* 3. Terms */}
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-3 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Terms</span>
          </legend>

          <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>The key points, in plain words:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No minimum term. Cancel any time with no cancellation fee.</li>
              <li>We confirm your place in writing. Benefits start after we accept you and your first payment succeeds.</li>
              <li>Materials and parking are charged separately.</li>
              <li>Priority booking is subject to availability, not a guaranteed response time.</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
            <input type="checkbox" name="acceptTerms" required className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span>
              I have read and accept the{" "}
              <Link href={`${FOUNDING_HREF}/terms`} target="_blank" className="font-semibold text-blue-600 dark:text-blue-400 underline underline-offset-2">
                Founding 100 membership terms
              </Link>
              .
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" name="marketingOptIn" className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span>Send me occasional news and offers by email. Optional, and you can opt out at any time.</span>
          </label>
        </fieldset>

        <div aria-live="polite">
          {error && (
            <p role="alert" className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-4 text-base font-extrabold uppercase tracking-wide shadow-lg shadow-blue-600/25 transition-all"
        >
          {status === "submitting" ? "Sending…" : `Apply for ${selected.name}`}
        </button>
        <p className="-mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Applying is free. Nothing is charged until we have accepted you.
        </p>
      </form>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Your plan</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selected.name}</h2>
        <p className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">
          {formatPlanPrice(selected.price)} <span className="text-base font-medium text-gray-500 dark:text-gray-400">/ month</span>
        </p>
        <p className="mt-1 mb-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
          £{selected.labourRate} per hour {selected.rateApplies ?? "member labour rate"}
        </p>
        <ul className="space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
          {[...selected.features, ...FOUNDING_SHARED_BENEFITS].map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
              </svg>
              {line}
            </li>
          ))}
        </ul>
        <Link href={FOUNDING_HREF} className="mt-5 inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Compare all plans
        </Link>
      </aside>
    </div>
  );
}
