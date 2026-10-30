/**
 * Founding 100 membership programme — the first 100 local homeowners get a
 * monthly plan with member labour rates and priority booking.
 *
 * Kept in one place so the homepage, the programme page and the sign-up flow
 * can never disagree about the limit, the prices or where the programme lives.
 * Figures come from the membership terms draft (29 October 2026).
 */

/** Public page that explains the programme and lists the plans. */
export const FOUNDING_HREF = "/founding-100";

/** Total number of founding places. */
export const FOUNDING_LIMIT = 100;

export type FoundingPlanId = "essential" | "priority" | "premium";

export type FoundingPlan = {
  id: FoundingPlanId;
  name: string;
  /** Monthly fee in pounds. */
  price: number;
  /** Member labour rate, pounds per hour. */
  labourRate: number;
  /** What the hourly rate applies to, when it is not simply all labour. */
  rateApplies?: string;
  tagline: string;
  /** Plan-specific lines; what every plan shares is listed separately. */
  features: string[];
  /** Drawn larger and ringed so the eye lands there first. */
  highlight?: boolean;
  /**
   * Shown but not joinable. Premium's included repairs are marked provisional in
   * the terms and need a solicitor's review (consumer contracts and the FCA
   * insurance perimeter) before they are sold — flip this to false once cleared.
   */
  comingSoon?: boolean;
};

export const FOUNDING_PLANS: FoundingPlan[] = [
  {
    id: "essential",
    name: "Essential",
    price: 6.99,
    labourRate: 65,
    tagline: "Member rates for the occasional job.",
    features: [],
  },
  {
    id: "priority",
    name: "Priority",
    price: 10,
    labourRate: 50,
    tagline: "A lower hourly rate for regular call-outs.",
    features: [],
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 18,
    labourRate: 50,
    rateApplies: "for extra work",
    tagline: "Our lowest rate plus included minor repairs.",
    features: ["Up to 2 eligible minor repairs a year, 30 minutes of labour each"],
    comingSoon: true,
  },
];

/** What every plan includes, in the order the terms list it. */
export const FOUNDING_SHARED_BENEFITS = [
  "Priority booking, subject to availability",
  "Plumbing advice by phone or WhatsApp",
  "No minimum term — cancel anytime, no cancellation fee",
];

export function formatPlanPrice(price: number): string {
  return `£${price.toFixed(2)}`;
}

/** Where a plan's "Join" button leads: terms first, then the application. */
export function joinHref(plan: FoundingPlanId): string {
  return `${FOUNDING_HREF}/join?plan=${plan}`;
}

/**
 * Version of the membership terms an applicant accepts. Stored with every
 * application as proof of what they agreed to — bump it whenever the wording
 * on /founding-100/terms changes in a way members must be told about.
 */
export const FOUNDING_TERMS_VERSION = "2026-10-29-draft";

export function getFoundingPlan(id: string | null | undefined): FoundingPlan | undefined {
  return FOUNDING_PLANS.find((plan) => plan.id === id);
}

/** The plan to preselect on the application form for a ?plan= value. */
export function resolveJoinPlan(id: string | null | undefined): FoundingPlan {
  const requested = getFoundingPlan(id);
  if (requested && !requested.comingSoon) return requested;
  return FOUNDING_PLANS.find((plan) => plan.highlight && !plan.comingSoon) ??
    FOUNDING_PLANS.find((plan) => !plan.comingSoon)!;
}

/**
 * Details the membership terms still need from the business. Fill these in and
 * the highlighted "to be confirmed" markers on /founding-100/terms disappear;
 * while any is null that page stays out of search results.
 */
export const FOUNDING_TERMS_DETAILS: {
  /** Hours the member labour rates apply, e.g. "08:00-19:00, Monday to Sunday". */
  rateHours: string | null;
  /** Hours phone/WhatsApp advice is available, e.g. "09:00-17:00, Monday to Friday". */
  supportHours: string | null;
} = {
  rateHours: null,
  supportHours: null,
};

export function unresolvedTermsDetails(): string[] {
  const missing: string[] = [];
  if (!FOUNDING_TERMS_DETAILS.rateHours) missing.push("rate hours");
  if (!FOUNDING_TERMS_DETAILS.supportHours) missing.push("support hours");
  return missing;
}
