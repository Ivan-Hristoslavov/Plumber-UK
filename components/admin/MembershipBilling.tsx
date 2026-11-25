"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/components/Toast";
import {
  type BillingAction,
  type BillingCharge,
  type BillingDetails,
  type BillingStep,
  formatMoney,
  isRunning,
  parseAmount,
  refundable,
} from "@/lib/membership-billing-admin";

const BUTTON =
  "h-8 rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-white disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800";
const DANGER =
  "h-8 rounded-lg border border-red-300 px-3 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10";

const DOT: Record<BillingStep["tone"], string> = { info: "bg-blue-500", good: "bg-emerald-500", bad: "bg-red-500" };

const when = (value: string | number) =>
  new Date(typeof value === "number" ? value * 1000 : value).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

type Confirm = { action: Exclude<BillingAction, "refund"> } | { action: "refund"; charge: BillingCharge; requestId: string };

const COPY: Record<Exclude<BillingAction, "refund">, { title: string; body: string; button: string; done: string; danger?: boolean }> = {
  cancel_at_period_end: {
    title: "Stop at the end of the paid month?",
    body: "They keep their benefits until the end of the month they paid for, then no more payments are taken.",
    button: "Stop at period end",
    done: "No more payments after this period.",
    danger: true,
  },
  keep: { title: "Keep the subscription?", body: "The scheduled cancellation is removed and monthly payments carry on.", button: "Keep subscription", done: "Monthly payments carry on." },
  cancel_now: {
    title: "Cancel the subscription now?",
    body: "It ends immediately, no more payments are taken and the membership is cancelled. Nothing is refunded automatically. This cannot be undone.",
    button: "Cancel now",
    done: "The subscription has ended.",
    danger: true,
  },
  pause: {
    title: "Pause monthly payments?",
    body: "No payments are taken until you resume. This does not change the membership status; use Pause on the card for that.",
    button: "Pause payments",
    done: "Payments are paused.",
  },
  resume: { title: "Resume monthly payments?", body: "The next monthly payment is taken as normal.", button: "Resume payments", done: "Payments are on again." },
};

function ConfirmDialog({
  confirm,
  name,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  confirm: Confirm;
  name: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (amount?: number) => void;
}) {
  const left = confirm.action === "refund" ? refundable(confirm.charge) : 0;
  const [text, setText] = useState((left / 100).toFixed(2));
  const backRef = useRef<HTMLButtonElement>(null);
  const amount = parseAmount(text);
  const validAmount = confirm.action !== "refund" || (amount !== null && amount <= left);

  useEffect(() => {
    // Focus the safe button: these actions move money.
    backRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const copy =
    confirm.action === "refund"
      ? {
          title: `Refund ${name}?`,
          body: `The money goes back to the card they paid with, usually within 5 to 10 days. It cannot be undone, and the subscription carries on unless you cancel it too.`,
          button: amount !== null && validAmount ? `Refund ${formatMoney(amount, confirm.charge.currency)}` : "Refund",
          danger: true,
        }
      : COPY[confirm.action];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => !busy && onClose()} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="billing-dialog-title" className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 sm:rounded-3xl">
        <h2 id="billing-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-white">{copy.title}</h2>
        <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">{copy.body}</p>
        {confirm.action === "refund" && (
          <div className="mt-4">
            <label htmlFor="refund-amount" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount ({confirm.charge.currency.toUpperCase()}), up to {formatMoney(left, confirm.charge.currency)}
            </label>
            <input
              id="refund-amount"
              inputMode="decimal"
              value={text}
              disabled={busy}
              onChange={(event) => setText(event.target.value)}
              aria-invalid={!validAmount}
              className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {!validAmount && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">Enter an amount between 0.01 and {(left / 100).toFixed(2)}.</p>}
          </div>
        )}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button ref={backRef} type="button" disabled={busy} onClick={onClose} className="h-10 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800">
            Back
          </button>
          <button
            type="button"
            disabled={busy || !validAmount}
            onClick={() => onConfirm(confirm.action === "refund" ? (amount ?? undefined) : undefined)}
            className={`h-10 rounded-xl px-5 text-sm font-semibold text-white disabled:opacity-50 ${copy.danger ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"}`}
          >
            {busy ? "Working…" : copy.button}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Billing for one member: opened on demand, because it asks Stripe. */
export function MembershipBilling({
  memberId,
  name,
  ended,
  onChanged,
}: {
  memberId: string;
  name: string;
  /** The membership itself is cancelled or declined. */
  ended: boolean;
  onChanged: () => void;
}) {
  const { showSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<BillingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const url = `/api/admin/memberships/${memberId}/billing`;

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(url, { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not load the billing history.");
      setDetails(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the billing history.");
    }
  }, [url]);

  const run = async (amount?: number) => {
    if (!confirm) return;
    setBusy(true);
    setActionError(null);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          confirm.action === "refund"
            ? { action: "refund", chargeId: confirm.charge.id, amount, requestId: confirm.requestId }
            : { action: confirm.action },
        ),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The change could not be made.");
      showSuccess(name, confirm.action === "refund" ? "Refund sent." : COPY[confirm.action].done);
      setConfirm(null);
      if (result.details) setDetails(result.details);
      else load();
      // The webhook updates the card a moment later.
      window.setTimeout(onChanged, 2500);
    } catch (runError) {
      setActionError(runError instanceof Error ? runError.message : "The change could not be made.");
    } finally {
      setBusy(false);
    }
  };

  const ask = (next: Confirm) => {
    setActionError(null);
    setConfirm(next);
  };
  const close = useCallback(() => setConfirm(null), []);

  const subscription = details?.subscription ?? null;
  const running = isRunning(subscription);

  return (
    <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) load();
        }}
        className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
      >
        {open ? "Hide billing history" : "Billing history and refunds"}
      </button>

      {open && error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}{" "}
          <button type="button" onClick={load} className="font-semibold underline">Try again</button>
        </p>
      )}
      {open && !error && !details && <div className="mt-3 h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" aria-busy="true" />}

      {open && details && (
        <div className="mt-3 space-y-4">
          {ended && running && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              This membership has ended but Stripe is still charging. Cancel the subscription.
            </p>
          )}

          {subscription && (
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-100">
                Subscription: <strong>{subscription.paused ? "payments paused" : subscription.status.replace(/_/g, " ")}</strong>
                {!subscription.live && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">TEST</span>}
              </p>
              {running && subscription.periodEnd && (
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {subscription.cancelAtPeriodEnd ? "Ends" : "Next payment"} {when(subscription.periodEnd)}
                </p>
              )}
              {running && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className={BUTTON} onClick={() => ask({ action: subscription.paused ? "resume" : "pause" })}>
                    {subscription.paused ? "Resume payments" : "Pause payments"}
                  </button>
                  <button type="button" className={BUTTON} onClick={() => ask({ action: subscription.cancelAtPeriodEnd ? "keep" : "cancel_at_period_end" })}>
                    {subscription.cancelAtPeriodEnd ? "Keep subscription" : "Stop at period end"}
                  </button>
                  <button type="button" className={DANGER} onClick={() => ask({ action: "cancel_now" })}>Cancel now</button>
                </div>
              )}
            </div>
          )}

          {details.charges.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-400">Payments</h4>
              <ul className="mt-1.5 divide-y divide-gray-200 dark:divide-gray-700">
                {details.charges.map((charge) => {
                  const left = refundable(charge);
                  return (
                    <li key={charge.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <div className="text-sm text-gray-800 dark:text-gray-100">
                        <strong>{formatMoney(charge.amount, charge.currency)}</strong>{" "}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {charge.status === "failed" ? "failed" : charge.refunded >= charge.amount ? "refunded" : charge.refunded > 0 ? `${formatMoney(charge.refunded, charge.currency)} refunded` : charge.status === "pending" ? "processing" : "paid"}
                          {" · "}{when(charge.created)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {charge.receiptUrl && (
                          <a href={charge.receiptUrl} target="_blank" rel="noopener noreferrer" className={`${BUTTON} inline-flex items-center`}>Receipt</a>
                        )}
                        {left > 0 && (
                          <button type="button" className={DANGER} onClick={() => ask({ action: "refund", charge, requestId: crypto.randomUUID() })}>Refund</button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-gray-400">Every step</h4>
            <ol className="mt-2 space-y-2.5">
              {details.steps.map((step, index) => (
                <li key={`${step.at}-${index}`} className="flex gap-2.5 text-sm">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[step.tone]}`} aria-hidden="true" />
                  <span className="text-gray-800 dark:text-gray-100">
                    {step.title}
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{step.dayOnly ? when(step.at).split(",")[0] : when(step.at)}{step.detail && ` · ${step.detail}`}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {details.dashboardUrl && (
            <a href={details.dashboardUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Open in Stripe →
            </a>
          )}
        </div>
      )}

      {confirm && <ConfirmDialog confirm={confirm} name={name} busy={busy} error={actionError} onClose={close} onConfirm={run} />}
    </div>
  );
}
