"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FilterBar, FilterSearch, FilterSelect } from "@/components/admin/FilterBar";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { useToast } from "@/components/Toast";
import {
  FOUNDING_HREF,
  FOUNDING_PLANS,
  type FoundingConfig,
  type FoundingConfigInput,
  type FoundingPlanId,
  formatPlanPrice,
  formatRate,
  toFoundingConfigInput,
  unresolvedTermsDetails,
  validateFoundingConfigInput,
} from "@/lib/founding";
import {
  MEMBERSHIP_STATUSES,
  type MembershipAction,
  type MembershipStatus,
  STATUS_LABEL,
  availableActions,
  londonToday,
} from "@/lib/memberships";

type Membership = {
  id: string;
  plan: FoundingPlanId;
  monthly_price: number | string;
  labour_rate: number | string;
  status: MembershipStatus;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  marketing_opt_in: boolean;
  terms_version: string;
  terms_accepted_at: string;
  admin_notes: string | null;
  started_at: string | null;
  cancelled_at: string | null;
  created_at: string;
};

type Places = { taken: number; limit: number; remaining: number };

type Payload = {
  setupRequired: boolean;
  settingsReady: boolean;
  memberships: Membership[];
  config: FoundingConfig;
  places: Places | null;
};

const CARD = "rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900";
const INPUT =
  "h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

const STATUS_STYLE: Record<MembershipStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  paused: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  declined: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

const PLAN_STYLE: Record<FoundingPlanId, string> = {
  essential: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200",
  priority: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  premium: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
};

const planName = (id: string) => FOUNDING_PLANS.find((plan) => plan.id === id)?.name ?? id;

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDay = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const ACTION_LABEL: Record<MembershipAction, string> = {
  approve: "Accept",
  decline: "Decline",
  pause: "Pause",
  resume: "Resume",
  cancel: "Cancel membership",
};

const ACTION_BUTTON: Record<MembershipAction, string> = {
  approve: "bg-emerald-600 text-white hover:bg-emerald-500",
  decline: "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10",
  pause: "border border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800",
  resume: "bg-blue-600 text-white hover:bg-blue-500",
  cancel: "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10",
};

// ---------------------------------------------------------------------------
// Action dialog
// ---------------------------------------------------------------------------

type DialogState = { member: Membership; action: MembershipAction } | null;

function ActionDialog({
  state,
  places,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  state: NonNullable<DialogState>;
  places: Places | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (options: { startDate?: string; sendEmail: boolean }) => void;
}) {
  const { member, action } = state;
  const [startDate, setStartDate] = useState(londonToday());
  const [sendEmail, setSendEmail] = useState(true);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const noRoom = action === "approve" && places !== null && places.remaining === 0;
  const emailable = action === "approve" || action === "decline";

  const copy: Record<MembershipAction, { title: string; body: string }> = {
    approve: {
      title: `Accept ${member.full_name}?`,
      body: `They join on the ${planName(member.plan)} plan at ${formatPlanPrice(Number(member.monthly_price))} a month and take one of the founding places.`,
    },
    decline: {
      title: `Decline ${member.full_name}?`,
      body: "They do not join. They can apply again later.",
    },
    pause: {
      title: `Pause ${member.full_name}?`,
      body: "They keep their place but their benefits are paused, for example while a payment is overdue.",
    },
    resume: {
      title: `Resume ${member.full_name}?`,
      body: "Their benefits start again.",
    },
    cancel: {
      title: `Cancel ${member.full_name}'s membership?`,
      body: "This ends the membership and frees their place. It cannot be undone, but they can apply again.",
    },
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center p-0 sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => !busy && onClose()} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-dialog-title"
        className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl"
      >
        <h2 id="membership-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-white">
          {copy[action].title}
        </h2>
        <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">{copy[action].body}</p>

        {action === "approve" && (
          <div className="mt-4">
            <label htmlFor="membership-start" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start date
            </label>
            <input id="membership-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={INPUT} />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Shown in their confirmation. Their benefits start once their first payment is taken.
            </p>
          </div>
        )}

        {emailable && (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              {action === "approve" ? "Email" : "Let"} <strong>{member.email}</strong>{" "}
              {action === "approve" ? "to confirm their place in writing" : "know by email"}
            </span>
          </label>
        )}

        {noRoom && (
          <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            All {places!.limit} places are taken. Raise the number of places in Settings, or pause or cancel a member first.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-10 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Back
          </button>
          <button
            ref={confirmRef}
            type="button"
            disabled={busy || noRoom}
            onClick={() => onConfirm({ startDate: action === "approve" ? startDate : undefined, sendEmail: emailable && sendEmail })}
            className={`h-10 rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
              action === "decline" || action === "cancel" ? "bg-red-600 text-white hover:bg-red-500" : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {busy ? "Saving…" : ACTION_LABEL[action]}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Member card
// ---------------------------------------------------------------------------

function MemberCard({
  member,
  onAction,
  onSaveNotes,
}: {
  member: Membership;
  onAction: (member: Membership, action: MembershipAction) => void;
  onSaveNotes: (member: Membership, notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(member.admin_notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const dirty = notes.trim() !== (member.admin_notes ?? "").trim();
  const actions = availableActions(member.status);

  // Keep the box in step when the row is refreshed from the server.
  useEffect(() => setNotes(member.admin_notes ?? ""), [member.admin_notes]);

  return (
    <article className={`${CARD} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">{member.full_name}</h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {formatPlanPrice(Number(member.monthly_price))}/month · {formatRate(Number(member.labour_rate))}/hour
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PLAN_STYLE[member.plan]}`}>{planName(member.plan)}</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[member.status]}`}>{STATUS_LABEL[member.status]}</span>
        </div>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Phone</dt>
          <dd><a href={`tel:${member.phone}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">{member.phone}</a></dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</dt>
          <dd className="truncate"><a href={`mailto:${member.email}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">{member.email}</a></dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Property</dt>
          <dd>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${member.address}, ${member.postcode}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:underline dark:text-gray-100"
            >
              {member.address}, {member.postcode}
            </a>
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Applied {formatDateTime(member.created_at)}
        {member.started_at && <> · Starts {formatDay(member.started_at)}</>}
        {member.cancelled_at && <> · Cancelled {formatDay(member.cancelled_at)}</>}
        {" · "}Accepted terms {member.terms_version}
        {member.marketing_opt_in && " · OK to send news"}
      </p>

      <div className="mt-4">
        <label htmlFor={`notes-${member.id}`} className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Private notes
        </label>
        <textarea
          id={`notes-${member.id}`}
          rows={2}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Only you can see this"
          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        {dirty && (
          <div className="mt-1.5 flex gap-2">
            <button
              type="button"
              disabled={savingNotes}
              onClick={async () => {
                setSavingNotes(true);
                try {
                  await onSaveNotes(member, notes);
                } finally {
                  setSavingNotes(false);
                }
              }}
              className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {savingNotes ? "Saving…" : "Save note"}
            </button>
            <button type="button" onClick={() => setNotes(member.admin_notes ?? "")} className="h-8 rounded-lg px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              Undo
            </button>
          </div>
        )}
      </div>

      {actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => onAction(member, action)}
              className={`h-9 rounded-xl px-4 text-sm font-semibold transition-colors ${ACTION_BUTTON[action]}`}
            >
              {ACTION_LABEL[action]}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Settings tab
// ---------------------------------------------------------------------------

type FormState = {
  limit: string;
  applicationsOpen: boolean;
  rateHours: string;
  supportHours: string;
  plans: Record<FoundingPlanId, { price: string; labourRate: string; open: boolean }>;
};

function toForm(input: FoundingConfigInput): FormState {
  const plans = Object.fromEntries(
    (Object.keys(input.plans) as FoundingPlanId[]).map((id) => [
      id,
      { price: String(input.plans[id].price), labourRate: String(input.plans[id].labourRate), open: input.plans[id].open },
    ]),
  ) as FormState["plans"];

  return { limit: String(input.limit), applicationsOpen: input.applicationsOpen, rateHours: input.rateHours, supportHours: input.supportHours, plans };
}

function fromForm(form: FormState): unknown {
  return {
    limit: Number(form.limit),
    applicationsOpen: form.applicationsOpen,
    rateHours: form.rateHours,
    supportHours: form.supportHours,
    plans: Object.fromEntries(
      (Object.keys(form.plans) as FoundingPlanId[]).map((id) => [
        id,
        { price: Number(form.plans[id].price), labourRate: Number(form.plans[id].labourRate), open: form.plans[id].open },
      ]),
    ),
  };
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (value: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      {/* State-driven, not peer-checked:, so dark mode cannot override the "on" colour. */}
      <span
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-gray-900 ${
          checked ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
        aria-hidden="true"
      >
        <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
        {hint && <span className="block text-sm text-gray-500 dark:text-gray-400">{hint}</span>}
      </span>
    </label>
  );
}

function SettingsPanel({
  config,
  settingsReady,
  taken,
  onSaved,
}: {
  config: FoundingConfig;
  settingsReady: boolean;
  taken: number;
  onSaved: (config: FoundingConfig) => void;
}) {
  const { showSuccess, showError } = useToast();
  const saved = useMemo(() => toForm(toFoundingConfigInput(config)), [config]);
  const [form, setForm] = useState<FormState>(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setForm(saved), [saved]);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const missing = unresolvedTermsDetails({ rateHours: form.rateHours.trim() || null, supportHours: form.supportHours.trim() || null });

  const setPlan = (id: FoundingPlanId, patch: Partial<FormState["plans"][FoundingPlanId]>) =>
    setForm((current) => ({ ...current, plans: { ...current.plans, [id]: { ...current.plans[id], ...patch } } }));

  const save = async () => {
    setError(null);
    const checked = validateFoundingConfigInput(fromForm(form));
    if (!checked.ok) {
      setError(checked.error);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/founding-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checked.value),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error || "The settings could not be saved.");
        showError("Not saved", body.error || "The settings could not be saved.");
        return;
      }
      onSaved(body.config);
      showSuccess("Settings saved", "The website will show the new details within moments.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {!settingsReady && (
        <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          The settings table has not been created yet, so changes cannot be saved and the standard figures are in use. Ask your developer to run the Founding 100 settings migration.
        </p>
      )}

      <section className={`${CARD} p-4 sm:p-6`}>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Programme</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Toggle
            checked={form.applicationsOpen}
            onChange={(applicationsOpen) => setForm({ ...form, applicationsOpen })}
            label="Taking applications"
            hint="Turn off to stop new applications. The pages stay visible, the buttons say closed."
          />
          <div>
            <label htmlFor="founding-limit" className="mb-1.5 block text-sm font-semibold text-gray-900 dark:text-white">
              Number of places
            </label>
            <input
              id="founding-limit"
              type="number"
              inputMode="numeric"
              min={Math.max(1, taken)}
              max={1000}
              step={1}
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
              className={`${INPUT} max-w-[10rem]`}
            />
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              {taken} {taken === 1 ? "place is" : "places are"} taken, so this cannot go lower than that.
            </p>
          </div>
        </div>
      </section>

      <section className={`${CARD} p-4 sm:p-6`}>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Plans</h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Prices and rates change on the website and in the terms straight away. People who have already applied keep the price they applied at.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {FOUNDING_PLANS.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.name}</p>
              <div className="mt-3 space-y-3">
                <div>
                  <label htmlFor={`price-${plan.id}`} className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">Monthly price (£)</label>
                  <input
                    id={`price-${plan.id}`}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.5"
                    max="500"
                    value={form.plans[plan.id].price}
                    onChange={(e) => setPlan(plan.id, { price: e.target.value })}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor={`rate-${plan.id}`} className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Hourly rate (£){plan.rateApplies ? ` ${plan.rateApplies}` : ""}
                  </label>
                  <input
                    id={`rate-${plan.id}`}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="1"
                    max="500"
                    value={form.plans[plan.id].labourRate}
                    onChange={(e) => setPlan(plan.id, { labourRate: e.target.value })}
                    className={INPUT}
                  />
                </div>
                <Toggle
                  checked={form.plans[plan.id].open}
                  onChange={(open) => setPlan(plan.id, { open })}
                  label="Open for joining"
                  hint={plan.id === "premium" ? "Keep this off until a solicitor has cleared the included repairs." : undefined}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${CARD} p-4 sm:p-6`}>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Opening hours in the terms</h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          The membership terms need these two details. Until both are filled in, the terms page shows &ldquo;to be confirmed&rdquo; and is hidden from Google.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rate-hours" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">When the member hourly rates apply</label>
            <input
              id="rate-hours"
              type="text"
              maxLength={120}
              value={form.rateHours}
              onChange={(e) => setForm({ ...form, rateHours: e.target.value })}
              placeholder="e.g. 08:00–19:00, Monday to Sunday"
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="support-hours" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">When phone and WhatsApp advice is available</label>
            <input
              id="support-hours"
              type="text"
              maxLength={120}
              value={form.supportHours}
              onChange={(e) => setForm({ ...form, supportHours: e.target.value })}
              placeholder="e.g. 09:00–17:00, Monday to Friday"
              className={INPUT}
            />
          </div>
        </div>
        {missing.length > 0 && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">Still to fill in: {missing.join(" and ")}.</p>
        )}
      </section>

      {error && (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving || !settingsReady}
          className="h-10 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {dirty && (
          <button type="button" onClick={() => { setForm(saved); setError(null); }} className="h-10 rounded-xl px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            Discard changes
          </button>
        )}
        <span className="ml-auto flex gap-4 text-sm">
          <Link href={FOUNDING_HREF} target="_blank" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">View programme page</Link>
          <Link href={`${FOUNDING_HREF}/terms`} target="_blank" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">View terms</Link>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page body
// ---------------------------------------------------------------------------

export function MembershipsManager() {
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"members" | "settings">("members");
  const [status, setStatus] = useState<MembershipStatus | "all">("all");
  const [plan, setPlan] = useState("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const response = await fetch("/api/admin/memberships", { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 401 ? "Please sign in again." : "Could not load memberships.");
      setData(await response.json());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load memberships.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const result: Record<MembershipStatus, number> = { pending: 0, active: 0, paused: 0, declined: 0, cancelled: 0 };
    for (const row of data?.memberships ?? []) result[row.status] += 1;
    return result;
  }, [data]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.memberships ?? [])
      .filter((row) => (status === "all" ? true : row.status === status))
      .filter((row) => (plan === "all" ? true : row.plan === plan))
      .filter((row) => !needle || [row.full_name, row.email, row.phone, row.postcode, row.address].some((value) => value.toLowerCase().includes(needle)))
      // Applications waiting for an answer first, then newest.
      .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.created_at.localeCompare(a.created_at));
  }, [data, status, plan, query]);

  const applyRow = (row: Membership) =>
    setData((current) => {
      if (!current) return current;
      const memberships = current.memberships.map((item) => (item.id === row.id ? row : item));
      const taken = memberships.filter((item) => item.status === "active" || item.status === "paused").length;
      return {
        ...current,
        memberships,
        places: { taken, limit: current.config.limit, remaining: Math.max(0, current.config.limit - taken) },
      };
    });

  const patch = async (id: string, body: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/memberships/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "The change could not be saved.");
    return result as { membership: Membership; emailSent: boolean | null };
  };

  const confirmAction = async (options: { startDate?: string; sendEmail: boolean }) => {
    if (!dialog) return;
    setDialogBusy(true);
    setDialogError(null);
    try {
      const result = await patch(dialog.member.id, { action: dialog.action, startDate: options.startDate, sendEmail: options.sendEmail });
      applyRow(result.membership);
      const name = dialog.member.full_name;
      showSuccess(
        `${name}: ${STATUS_LABEL[result.membership.status].toLowerCase()}`,
        result.emailSent === true
          ? "Saved, and the email has been sent."
          : result.emailSent === false
            ? "Saved, but the email could not be sent. Please contact them yourself."
            : "Saved.",
      );
      setDialog(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The change could not be saved.";
      setDialogError(message);
      if (/just changed|Refresh/i.test(message)) load();
    } finally {
      setDialogBusy(false);
    }
  };

  const saveNotes = async (member: Membership, notes: string) => {
    try {
      const result = await patch(member.id, { notes });
      applyRow(result.membership);
      showSuccess("Note saved", member.full_name);
    } catch (error) {
      showError("Note not saved", error instanceof Error ? error.message : "Please try again.");
      throw error;
    }
  };

  const places = data?.places ?? null;
  const percent = places ? Math.min(100, Math.round((places.taken / Math.max(1, places.limit)) * 100)) : 0;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Memberships"
        subtitle="Founding 100 applications and members"
        actions={
          <>
            <button
              type="button"
              onClick={() => { setLoading(true); load(); }}
              className="h-10 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Refresh
            </button>
            <Link href={FOUNDING_HREF} target="_blank" className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500">
              View public page
            </Link>
          </>
        }
      />

      {loading && !data ? (
        <div className="space-y-3" aria-busy="true">
          <div className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
      ) : loadError ? (
        <div role="alert" className={`${CARD} p-6 text-center`}>
          <p className="font-semibold text-gray-900 dark:text-white">{loadError}</p>
          <button type="button" onClick={() => { setLoading(true); load(); }} className="mt-3 h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500">
            Try again
          </button>
        </div>
      ) : data ? (
        <>
          {data.setupRequired && (
            <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <strong>Memberships are not set up yet.</strong> The database table has not been created, so applications cannot be saved. Ask your developer to run the memberships migration.
            </p>
          )}

          {places && (
            <section className={`${CARD} p-4 sm:p-5`}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Founding places</p>
                  <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {places.taken} <span className="text-base font-medium text-gray-500 dark:text-gray-400">of {places.limit} taken</span>
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{places.remaining} left</p>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800" role="progressbar" aria-valuenow={places.taken} aria-valuemin={0} aria-valuemax={places.limit} aria-label="Founding places taken">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500" style={{ width: `${percent}%` }} />
              </div>
            </section>
          )}

          <div role="tablist" aria-label="Memberships" className="flex gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-gray-800/70 sm:w-fit">
            {(["members", "settings"] as const).map((key) => (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`h-9 flex-1 rounded-xl px-5 text-sm font-semibold transition-colors sm:flex-none ${
                  tab === key ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {key === "members" ? "Members" : "Settings"}
                {key === "members" && counts.pending > 0 && (
                  <span className="ml-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold text-white">{counts.pending}</span>
                )}
              </button>
            ))}
          </div>

          {tab === "settings" ? (
            <SettingsPanel
              config={data.config}
              settingsReady={data.settingsReady}
              taken={places?.taken ?? 0}
              onSaved={(config) => setData((current) => (current ? { ...current, config, places: current.places && { ...current.places, limit: config.limit, remaining: Math.max(0, config.limit - current.places.taken) } } : current))}
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
                {(["all", ...MEMBERSHIP_STATUSES] as const).map((key) => {
                  const active = status === key;
                  const count = key === "all" ? data.memberships.length : counts[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setStatus(key)}
                      className={`h-9 rounded-full px-4 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      }`}
                    >
                      {key === "all" ? "All" : STATUS_LABEL[key]} <span className={active ? "text-blue-100" : "text-gray-400"}>{count}</span>
                    </button>
                  );
                })}
              </div>

              <FilterBar>
                <FilterSearch value={query} onChange={setQuery} placeholder="Search name, email, phone or postcode" />
                <FilterSelect value={plan} onChange={setPlan} label="Plan">
                  <option value="all">All plans</option>
                  {FOUNDING_PLANS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </FilterSelect>
              </FilterBar>

              {visible.length === 0 ? (
                <div className={`${CARD} px-6 py-14 text-center`}>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {data.memberships.length === 0 ? "No applications yet" : "Nothing matches your filters"}
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                    {data.memberships.length === 0
                      ? "When someone applies on the website, they appear here and you get an email."
                      : "Try a different status, plan or search."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {visible.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onAction={(row, action) => { setDialogError(null); setDialog({ member: row, action }); }}
                      onSaveNotes={saveNotes}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ) : null}

      {dialog && (
        <ActionDialog
          key={`${dialog.member.id}-${dialog.action}`}
          state={dialog}
          places={places}
          busy={dialogBusy}
          error={dialogError}
          onClose={() => setDialog(null)}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
}
