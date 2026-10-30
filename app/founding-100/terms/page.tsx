import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { getAdminProfile } from "@/lib/admin-profile";
import { BRAND_NAME } from "@/lib/brand";
import {
  FOUNDING_HREF,
  FOUNDING_LIMIT,
  FOUNDING_PLANS,
  FOUNDING_TERMS_DETAILS,
  formatPlanPrice,
  unresolvedTermsDetails,
} from "@/lib/founding";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 300;

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Founding 100 Membership Terms & Conditions";
  return {
    title,
    description: `The terms of the ${BRAND_NAME} Founding 100 membership: fees, member labour rates, priority booking, cancellation and your statutory rights.`,
    alternates: { canonical: `${BASE}${FOUNDING_HREF}/terms` },
    // Stay out of search results until every detail has been filled in.
    robots: { index: unresolvedTermsDetails().length === 0, follow: true },
  };
}

/** Settings are stored as JSON; a value can arrive quoted or double-quoted. */
function settingValue(raw: unknown): string {
  let value = raw;
  for (let i = 0; i < 2 && typeof value === "string"; i++) {
    try {
      value = JSON.parse(value);
    } catch {
      break;
    }
  }
  return value === null || value === undefined ? "" : String(value).trim();
}

async function getTermsDetails() {
  const supabase = createClient();
  const [profile, settingsResult, areasResult] = await Promise.all([
    getAdminProfile(),
    supabase.from("admin_settings").select("key, value").in("key", ["registrationNumber", "vatEnabled"]),
    supabase.from("admin_areas_cover").select("name, postcode").eq("is_active", true).order("order", { ascending: true }),
  ]);

  const settings = Object.fromEntries(
    (settingsResult.data || []).map((row: { key: string; value: unknown }) => [row.key, settingValue(row.value)]),
  );

  return {
    legalName: profile?.company_name?.trim() || BRAND_NAME,
    email: profile?.business_email?.trim() || "",
    phone: profile?.phone?.trim() || "",
    address: profile?.company_address?.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim() || "",
    registrationNumber: settings.registrationNumber || "",
    vatRegistered: settings.vatEnabled === "true",
    areas: (areasResult.data || []) as { name: string; postcode: string }[],
  };
}

/** A detail the business has not supplied yet — loud on purpose. */
function Tbc({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-amber-200 px-1 py-0.5 text-amber-950 font-semibold dark:bg-amber-400/30 dark:text-amber-100">
      [{children} to be confirmed]
    </mark>
  );
}

function Clause({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="scroll-mt-24" id={`clause-${n}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
        {n}. {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">{children}</div>
    </section>
  );
}

export default async function FoundingTermsPage() {
  const d = await getTermsDetails();
  const unresolved = unresolvedTermsDetails();
  const { rateHours, supportHours } = FOUNDING_TERMS_DETAILS;

  const contact = [
    d.email && `email ${d.email}`,
    d.phone && `telephone ${d.phone}`,
    d.address && `post ${d.address}`,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-blue-200">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-blue-300">/</span>
            <Link href={FOUNDING_HREF} className="hover:text-white transition-colors">Founding 100</Link>
            <span className="mx-2 text-blue-300">/</span>
            <span className="text-white font-medium">Terms</span>
          </nav>
          <p className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-blue-200 mb-2">
            {BRAND_NAME} Founding {FOUNDING_LIMIT}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Membership Terms &amp; Conditions</h1>
          <p className="text-blue-200 text-sm">Version dated 29 October 2026</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {unresolved.length > 0 && (
          <div role="note" className="rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
            <strong>Draft.</strong> A few details are still to be confirmed and are highlighted below. This
            page is not shown in search results until they are filled in.
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">At a glance</h2>
          <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
            Join the first {FOUNDING_LIMIT} local {BRAND_NAME} members for preferential plumbing labour rates,
            access to telephone/WhatsApp advice and priority booking subject to availability. Membership is
            optional and can be cancelled at any time without a cancellation fee. Materials and parking are
            charged separately. The Premium repair benefit is conditional and limited, as explained below.
          </p>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[34rem] text-sm text-left">
              <thead>
                <tr className="bg-blue-950 text-white">
                  <th className="px-3 py-2 font-semibold rounded-tl-lg">Plan</th>
                  <th className="px-3 py-2 font-semibold">Monthly fee</th>
                  <th className="px-3 py-2 font-semibold">Member labour rate</th>
                  <th className="px-3 py-2 font-semibold rounded-tr-lg">Included repairs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                {FOUNDING_PLANS.map((plan) => (
                  <tr key={plan.id} className="odd:bg-white even:bg-blue-50/60 dark:odd:bg-gray-800 dark:even:bg-gray-700/40">
                    <td className="px-3 py-2.5 font-semibold text-gray-900 dark:text-white">{plan.name}</td>
                    <td className="px-3 py-2.5">{formatPlanPrice(plan.price)}</td>
                    <td className="px-3 py-2.5">£{plan.labourRate}/hour{plan.rateApplies ? ` ${plan.rateApplies}` : ""}</td>
                    <td className="px-3 py-2.5">
                      {plan.id === "premium"
                        ? "Up to 2 eligible minor repairs, max 30 min labour each, subject to a 90-day wait and conditions"
                        : "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Clause n={1} title="Who we are and what this agreement covers">
          <p>
            The membership provider is {d.legalName}, trading as {BRAND_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
            {contact.length > 0 && <> Business contact: {contact.join("; ")}.</>}
            {d.registrationNumber && <> Company registration number: {d.registrationNumber}.</>}
            {" "}The member (&ldquo;you&rdquo;) is the consumer named in the enrolment confirmation. Membership
            applies to one nominated residential property within our stated service area
            {d.areas.length > 0 && (
              <> ({d.areas.map((a) => `${a.name} ${a.postcode}`).join(", ")})</>
            )}
            . This agreement governs membership benefits; individual visits also follow our standard plumbing
            service terms, supplied before work where applicable.
          </p>
        </Clause>

        <Clause n={2} title="Enrolment, eligibility and availability">
          <p>
            Membership is offered to the first {FOUNDING_LIMIT} accepted applicants, subject to capacity and
            service-area eligibility. The &ldquo;Founding {FOUNDING_LIMIT}&rdquo; limit describes available membership
            places, not a promise of permanent exclusivity or guaranteed appointment slots. We confirm
            acceptance, plan, property, monthly price, start date and payment method in writing. No benefit
            starts until acceptance and the first successful payment, except where the law requires otherwise.
            We may decline an application for legitimate capacity or eligibility reasons, not arbitrarily or
            discriminatorily.
          </p>
        </Clause>

        <Clause n={3} title="Monthly fees and payment">
          <p>
            Membership fees are £6.99, £10.00 or £18.00 per month, as selected, inclusive of VAT where applicable
            {d.vatRegistered ? "." : <>. {d.legalName} is not currently VAT registered, so no VAT is added.</>}
            {" "}Payment is collected monthly by the agreed method, expected to be GoCardless Direct Debit. We
            will explain the payment schedule and provide applicable Direct Debit Guarantee information. If
            payment fails, we will notify you and give a reasonable opportunity to resolve it; benefits may be
            paused after notice while payment remains overdue. No undisclosed administration or collection fee
            applies.
          </p>
        </Clause>

        <Clause n={4} title="Member labour rates and billing">
          <p>
            Essential members pay £65 per hour of eligible labour; Priority members pay £50 per hour; Premium
            members pay £50 per hour for work not included in their limited minor-repair benefit. These rates
            apply during standard working hours{" "}
            {rateHours ? `(${rateHours})` : <Tbc>rate hours</Tbc>} within the agreed service area, subject to
            availability. Until any minimum charge, time rounding, travel or call-out time charge, or out-of-hours
            or emergency rate has been disclosed and accepted before a booking, we will not impose an
            undisclosed minimum or surcharge. Written estimates will identify any additional charges.
          </p>
        </Clause>

        <Clause n={5} title="Materials, parking and other third-party charges">
          <p>
            Materials, replacement parts, consumables, parking, congestion/ULEZ charges where applicable, and
            other agreed third-party costs are not included in membership fees or labour rates. We will tell you
            in advance where reasonably practicable and seek your approval before incurring material or
            exceptional costs. Parking charges will be based on actual reasonable costs attributable to the
            visit, with evidence available on request; no parking charge applies if none is incurred. We will
            not charge penalties or fines arising from our own parking infringements to you. Where you can
            lawfully provide suitable parking, please tell us before the appointment. Any material mark-up must
            be disclosed in advance if used.
          </p>
        </Clause>

        <Clause n={6} title="Advice and priority booking">
          <p>
            Members may request reasonable plumbing guidance by phone or WhatsApp during published support hours{" "}
            {supportHours ? `(${supportHours})` : <Tbc>support hours</Tbc>}. Advice is general, based on
            information supplied, and does not replace an inspection where necessary. We cannot guarantee a
            remote diagnosis or immediate response. We may limit repeated or abusive requests fairly, with
            notice, to protect service capacity. Priority booking means we will seek to offer members available
            appointment slots ahead of non-members where practical; it is not a guaranteed response time,
            emergency attendance or 24/7 cover.
          </p>
        </Clause>

        <Clause n={7} title="Premium: narrowly defined included minor repairs">
          <p>
            <em>Premium is not open for joining yet. This clause will apply to Premium members once it opens.</em>
          </p>
          <p>
            Premium includes up to two eligible minor-repair attendances in each rolling 12 months of continuous
            paid membership, each including up to 30 minutes of labour. The benefit first becomes available after
            90 full days of continuous paid membership. Unused attendances do not roll over or convert to cash.
            Eligible examples, subject to inspection and accessibility: tightening an exposed leaking connection,
            adjusting an accessible toilet cistern mechanism, or replacing a straightforward tap washer.
            Materials and parking remain payable. We will confirm whether the proposed job qualifies before
            attendance wherever reasonably possible; if it does not qualify, we will offer a quote and seek
            approval before chargeable work.
          </p>
          <p>
            Excluded from included Premium labour: pre-existing or known faults at joining; hidden or
            inaccessible leaks; exploratory works; removing tiles, walls or floors; drainage blockages;
            appliance repairs; gas work; major pipework replacement; electrical work; damage caused by misuse or
            neglect; and any work requiring specialist access, extra labour or multiple trades. Exclusions do not
            remove your statutory rights. If a job exceeds 30 minutes, the first eligible 30 minutes are
            included and further approved labour is charged at £50/hour, subject to the disclosed billing rules.
            We may refuse unsafe work and explain why.
          </p>
        </Clause>

        <Clause n={8} title="Cancellation: no minimum term">
          <p>
            You may cancel at any time without a cancellation fee
            {d.email || d.phone ? (
              <>, by {[d.email && `email to ${d.email}`, d.phone && `telephone on ${d.phone}`].filter(Boolean).join(" or ")}</>
            ) : null}
            . We will acknowledge cancellation in writing. Cancellation stops future renewals and payments;
            membership benefits normally continue until the end of the paid billing period. Monthly fees already
            paid are not normally refunded for a partly used period, subject always to statutory cancellation,
            refund and other consumer rights. We will not charge for future months after an effective
            cancellation. Cancelling a Direct Debit alone does not necessarily notify us that you want to cancel
            the membership; contact us as well so we can close your membership promptly.
          </p>
        </Clause>

        <Clause n={9} title="Online cooling-off rights">
          <p>
            If you join online or at a distance, you may have a statutory 14-day cancellation right. We will
            provide the required pre-contract information and a clear cancellation method. If you expressly
            request services to begin during a cooling-off period, any lawful payment for services supplied
            before cancellation will be explained and handled in accordance with applicable consumer law. This
            clause does not reduce any statutory rights.
          </p>
        </Clause>

        <Clause n={10} title="Existing problems, fair use and safety">
          <p>
            Membership is not intended to cover an already identified defect through the Premium included-repair
            allowance. You should disclose known faults when asking for an appointment. We will not use an unfair
            blanket exclusion to avoid our statutory obligations. We may pause a request that presents a safety
            risk, needs a qualified specialist, or cannot be carried out lawfully; we will explain next steps. In
            an immediate danger involving gas, electricity or severe flooding, contact the appropriate emergency
            service or utility emergency line.
          </p>
        </Clause>

        <Clause n={11} title="Appointments, access and cancellations">
          <p>
            Please provide safe access to the property and accurate information about the problem. If you need to
            change an appointment, notify us as soon as possible. Any missed-appointment or late-cancellation fee
            must be a fair, proportionate estimate of actual loss, disclosed and accepted before the booking; no
            such fee is imposed by these terms until a schedule is published. We may rearrange visits for safety,
            illness or circumstances outside reasonable control, keeping you informed.
          </p>
        </Clause>

        <Clause n={12} title="Changes to benefits or price">
          <p>
            We will not change the agreed monthly price or materially reduce core benefits during a paid billing
            period. For future periods, we will provide at least 30 days&rsquo; clear advance notice of any proposed
            price or material benefit change, explain the reason and give you an easy, penalty-free way to cancel
            before the change takes effect. Changes cannot override statutory rights. Any special Founding{" "}
            {FOUNDING_LIMIT} price guarantee must be stated explicitly in the enrolment confirmation; none is
            promised by these terms.
          </p>
        </Clause>

        <Clause n={13} title="Quality, complaints and statutory rights">
          <p>
            We will provide services with reasonable care and skill and comply with applicable consumer law.
            Nothing in these terms excludes or limits liability where doing so would be unlawful, including
            liability for death or personal injury caused by negligence, fraud, or statutory consumer remedies.
            For a concern or complaint, contact {d.email || "us"}; we aim to acknowledge within 5 working days
            and provide a substantive response within 14 working days where practical. Your rights under the
            Consumer Rights Act 2015 and other applicable law remain unaffected.
          </p>
        </Clause>

        <Clause n={14} title="Personal information and communications">
          <p>
            We process member contact, property and service information to administer the agreement, arrange
            visits and manage payments. See our <Link href="/privacy" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">Privacy Policy</Link>{" "}
            for purposes, retention, lawful bases, rights and payment-provider details. Marketing messages are
            optional where consent or another lawful basis is required and can be opted out of. We do not sell
            member personal data.
          </p>
        </Clause>

        <Clause n={15} title="Contract status and governing law">
          <p>
            These membership terms, your plan confirmation and any expressly incorporated service terms form the
            agreement. If there is a conflict, any mandatory consumer law prevails. English law applies, but this
            does not deprive consumers living elsewhere in the UK of mandatory protections that apply to them.
            Courts with jurisdiction under applicable consumer law may hear disputes. If a clause is
            unenforceable, the remainder will continue so far as legally possible.
          </p>
        </Clause>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href={FOUNDING_HREF}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition-colors"
          >
            Back to the plans
          </Link>
        </div>
      </div>
    </main>
  );
}
