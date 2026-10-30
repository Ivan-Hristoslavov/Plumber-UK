/**
 * Founding 100 membership programme — the first local homeowners get a monthly
 * plan with member labour rates and priority booking.
 *
 * Two layers, kept in this one import-free file so the homepage, programme
 * page, terms, sign-up and admin can never disagree:
 *
 *  - what the business edits in the admin (prices, hourly rates, the number of
 *    places, whether a plan can be joined, two opening-hours details) — stored
 *    in the locked `founding_settings` table and merged over the defaults below;
 *  - what stays in code on purpose (plan names, wording, the terms text, which
 *    a solicitor reviews and nobody should change by accident).
 *
 * Defaults are the figures from the membership terms draft (29 October 2026),
 * so the site works unchanged before anything has been saved.
 */

/** Public page that explains the programme and lists the plans. */
export const FOUNDING_HREF = "/founding-100";

/** Default number of founding places. */
export const FOUNDING_LIMIT = 100;

export type FoundingPlanId = "essential" | "priority" | "premium";

export const FOUNDING_PLAN_IDS: FoundingPlanId[] = ["essential", "priority", "premium"];

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
   * insurance perimeter) before they are sold; the admin opens the plan once
   * that is cleared.
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

/** Hourly rates are usually whole pounds; show pence only when there are some. */
export function formatRate(rate: number): string {
  return Number.isInteger(rate) ? `£${rate}` : `£${rate.toFixed(2)}`;
}

/** Where a plan's "Join" button leads: terms first, then the application. */
export function joinHref(plan: FoundingPlanId): string {
  return `${FOUNDING_HREF}/join?plan=${plan}`;
}

/**
 * Version of the membership terms an applicant accepts. Stored with every
 * application as proof of what they agreed to — bump it whenever the wording
 * on /founding-100/terms changes in a way members must be told about. The price
 * and rate they agreed to are stored on the application itself.
 */
export const FOUNDING_TERMS_VERSION = "2026-10-29-draft";

// ---------------------------------------------------------------------------
// Editable configuration
// ---------------------------------------------------------------------------

/** What the admin can change. This is exactly what is stored. */
export type FoundingConfigInput = {
  /** Number of founding places. */
  limit: number;
  /** When false the programme stays visible but takes no new applications. */
  applicationsOpen: boolean;
  /** Hours the member labour rates apply, e.g. "08:00-19:00, Monday to Sunday". */
  rateHours: string;
  /** Hours phone/WhatsApp advice is available, e.g. "09:00-17:00, Monday to Friday". */
  supportHours: string;
  plans: Record<FoundingPlanId, { price: number; labourRate: number; open: boolean }>;
};

/** The merged view the site renders. */
export type FoundingConfig = {
  limit: number;
  applicationsOpen: boolean;
  plans: FoundingPlan[];
  rateHours: string | null;
  supportHours: string | null;
};

export function defaultFoundingConfigInput(): FoundingConfigInput {
  const plans = Object.fromEntries(
    FOUNDING_PLANS.map((plan) => [plan.id, { price: plan.price, labourRate: plan.labourRate, open: !plan.comingSoon }]),
  ) as FoundingConfigInput["plans"];

  return { limit: FOUNDING_LIMIT, applicationsOpen: true, rateHours: "", supportHours: "", plans };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A stored value can be an object or JSON text; accept both. */
function asRecord(raw: unknown): Record<string, unknown> | null {
  let value = raw;
  for (let i = 0; i < 2 && typeof value === "string"; i++) {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return isRecord(value) ? value : null;
}

function numberOr(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) && n >= min && n <= max ? round2(n) : fallback;
}

/**
 * Turn whatever is stored (possibly nothing, possibly partial or hand-edited)
 * into a complete, safe configuration. Anything missing or out of range falls
 * back to the default rather than breaking the public pages.
 */
export function buildFoundingConfig(raw: unknown): FoundingConfig {
  const defaults = defaultFoundingConfigInput();
  const stored = asRecord(raw) ?? {};
  const storedPlans = asRecord(stored.plans) ?? {};

  const limit = Math.round(numberOr(stored.limit, defaults.limit, 1, 1000));

  const plans = FOUNDING_PLANS.map((base): FoundingPlan => {
    const saved = asRecord(storedPlans[base.id]) ?? {};
    const fallback = defaults.plans[base.id];
    const open = typeof saved.open === "boolean" ? saved.open : fallback.open;

    return {
      ...base,
      price: numberOr(saved.price, fallback.price, 0.5, 500),
      labourRate: numberOr(saved.labourRate, fallback.labourRate, 1, 500),
      comingSoon: !open,
    };
  });

  const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : null);

  return {
    limit,
    applicationsOpen: typeof stored.applicationsOpen === "boolean" ? stored.applicationsOpen : true,
    plans,
    rateHours: text(stored.rateHours),
    supportHours: text(stored.supportHours),
  };
}

/** The editable form's starting values for a configuration. */
export function toFoundingConfigInput(config: FoundingConfig): FoundingConfigInput {
  const plans = Object.fromEntries(
    config.plans.map((plan) => [plan.id, { price: plan.price, labourRate: plan.labourRate, open: !plan.comingSoon }]),
  ) as FoundingConfigInput["plans"];

  return {
    limit: config.limit,
    applicationsOpen: config.applicationsOpen,
    rateHours: config.rateHours ?? "",
    supportHours: config.supportHours ?? "",
    plans,
  };
}

export type ConfigValidation = { ok: true; value: FoundingConfigInput } | { ok: false; error: string };

/**
 * Strict check for what the admin submits. Unlike `buildFoundingConfig` this
 * rejects bad values with a message instead of quietly correcting them, so a
 * typo like a £600 price is caught rather than saved.
 */
export function validateFoundingConfigInput(input: unknown): ConfigValidation {
  if (!isRecord(input)) return { ok: false, error: "Settings are missing." };

  const limit = Number(input.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
    return { ok: false, error: "Places must be a whole number between 1 and 1000." };
  }
  if (typeof input.applicationsOpen !== "boolean") {
    return { ok: false, error: "Please say whether applications are open." };
  }

  const hours = (value: unknown, label: string): { ok: true; value: string } | { ok: false; error: string } => {
    if (value === undefined || value === null) return { ok: true, value: "" };
    if (typeof value !== "string") return { ok: false, error: `${label} must be text.` };
    const trimmed = value.trim();
    if (trimmed.length > 120) return { ok: false, error: `${label} is too long (120 characters at most).` };
    return { ok: true, value: trimmed };
  };
  const rateHours = hours(input.rateHours, "Rate hours");
  if (!rateHours.ok) return rateHours;
  const supportHours = hours(input.supportHours, "Support hours");
  if (!supportHours.ok) return supportHours;

  if (!isRecord(input.plans)) return { ok: false, error: "Plans are missing." };

  const plans = {} as FoundingConfigInput["plans"];
  for (const plan of FOUNDING_PLANS) {
    const entry = input.plans[plan.id];
    if (!isRecord(entry)) return { ok: false, error: `${plan.name} is missing.` };

    const price = Number(entry.price);
    if (!Number.isFinite(price) || price < 0.5 || price > 500) {
      return { ok: false, error: `${plan.name} monthly price must be between £0.50 and £500.` };
    }
    const labourRate = Number(entry.labourRate);
    if (!Number.isFinite(labourRate) || labourRate < 1 || labourRate > 500) {
      return { ok: false, error: `${plan.name} hourly rate must be between £1 and £500.` };
    }
    if (typeof entry.open !== "boolean") return { ok: false, error: `Please say whether ${plan.name} can be joined.` };

    plans[plan.id] = { price: round2(price), labourRate: round2(labourRate), open: entry.open };
  }

  return {
    ok: true,
    value: {
      limit,
      applicationsOpen: input.applicationsOpen,
      rateHours: rateHours.value,
      supportHours: supportHours.value,
      plans,
    },
  };
}

export function findFoundingPlan(plans: FoundingPlan[], id: string | null | undefined): FoundingPlan | undefined {
  return plans.find((plan) => plan.id === id);
}

/** The plan to preselect on the application form for a ?plan= value. */
export function resolveJoinPlan(plans: FoundingPlan[], id: string | null | undefined): FoundingPlan | undefined {
  const requested = findFoundingPlan(plans, id);
  if (requested && !requested.comingSoon) return requested;
  return plans.find((plan) => plan.highlight && !plan.comingSoon) ?? plans.find((plan) => !plan.comingSoon);
}

/**
 * Details the membership terms still need from the business. While any is
 * missing the highlighted "to be confirmed" markers show on
 * /founding-100/terms and that page stays out of search results.
 */
export function unresolvedTermsDetails(config: Pick<FoundingConfig, "rateHours" | "supportHours">): string[] {
  const missing: string[] = [];
  if (!config.rateHours) missing.push("rate hours");
  if (!config.supportHours) missing.push("support hours");
  return missing;
}
