/**
 * The rules for moving a Founding 100 application or membership between
 * statuses. Pure and import-free so the admin API and the tests share one
 * definition, and so the rules can be read in one place:
 *
 *   pending   -> active (approve) | declined (decline)
 *   active    -> paused (pause)   | cancelled (cancel)
 *   paused    -> active (resume)  | cancelled (cancel)
 *   declined / cancelled are final; the person can apply again.
 */

export type MembershipStatus = "pending" | "active" | "paused" | "declined" | "cancelled";
export type MembershipAction = "approve" | "decline" | "pause" | "resume" | "cancel";

export const MEMBERSHIP_STATUSES: MembershipStatus[] = ["pending", "active", "paused", "declined", "cancelled"];

const TRANSITIONS: Record<MembershipAction, { from: MembershipStatus[]; to: MembershipStatus }> = {
  approve: { from: ["pending"], to: "active" },
  decline: { from: ["pending"], to: "declined" },
  pause: { from: ["active"], to: "paused" },
  resume: { from: ["paused"], to: "active" },
  cancel: { from: ["active", "paused"], to: "cancelled" },
};

export function isMembershipAction(value: unknown): value is MembershipAction {
  return typeof value === "string" && value in TRANSITIONS;
}

export function isMembershipStatus(value: unknown): value is MembershipStatus {
  return typeof value === "string" && (MEMBERSHIP_STATUSES as string[]).includes(value);
}

export function canApply(action: MembershipAction, status: MembershipStatus): boolean {
  return TRANSITIONS[action].from.includes(status);
}

export function nextStatus(action: MembershipAction): MembershipStatus {
  return TRANSITIONS[action].to;
}

/** The actions the admin may take on a row in this status, in display order. */
export function availableActions(status: MembershipStatus): MembershipAction[] {
  return (Object.keys(TRANSITIONS) as MembershipAction[]).filter((action) => canApply(action, status));
}

/** Active and paused members hold one of the founding places. */
export function takesPlace(status: MembershipStatus): boolean {
  return status === "active" || status === "paused";
}

/**
 * Only approving a pending application fills a new place. Resuming a paused
 * member does not: they already hold theirs.
 */
export function needsFreePlace(action: MembershipAction): boolean {
  return action === "approve";
}

/** Today's date in London as YYYY-MM-DD; membership dates are business dates. */
export function londonToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

export type TransitionUpdate = {
  status: MembershipStatus;
  started_at?: string;
  cancelled_at?: string;
};

export type TransitionResult = { ok: true; update: TransitionUpdate } | { ok: false; error: string };

/**
 * The column changes for an action, or why it cannot be done. A start date is
 * only meaningful when approving, and must be a real date within a year of
 * today so a mistyped year cannot silently put a member in 2062.
 */
export function buildTransition(
  action: MembershipAction,
  current: MembershipStatus,
  options: { today: string; startDate?: unknown },
): TransitionResult {
  if (!canApply(action, current)) {
    return { ok: false, error: `A ${current} membership cannot be ${pastTense(action)}.` };
  }

  const update: TransitionUpdate = { status: nextStatus(action) };

  if (action === "approve") {
    const start = options.startDate === undefined || options.startDate === "" ? options.today : options.startDate;
    if (!isIsoDate(start)) return { ok: false, error: "Please enter a valid start date." };
    if (Math.abs(daysBetween(options.today, start)) > 366) {
      return { ok: false, error: "The start date must be within a year of today." };
    }
    update.started_at = start;
  }

  if (action === "cancel") update.cancelled_at = options.today;

  return { ok: true, update };
}

function pastTense(action: MembershipAction): string {
  return { approve: "approved", decline: "declined", pause: "paused", resume: "resumed", cancel: "cancelled" }[action];
}

export const STATUS_LABEL: Record<MembershipStatus, string> = {
  pending: "Pending",
  active: "Active",
  paused: "Paused",
  declined: "Declined",
  cancelled: "Cancelled",
};
