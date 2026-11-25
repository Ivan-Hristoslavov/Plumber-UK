"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { type MembershipPayments as Data, formatMoney, paymentLabel } from "@/lib/membership-billing-admin";

const BADGE: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  Failed: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  Disputed: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};
const NEUTRAL = "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";

const day = (seconds: number) =>
  new Date(seconds * 1000).toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Monthly membership charges on the Payments page. They live in Stripe, not in
 * the payments table, so they have their own section and totals.
 */
export function MembershipPayments() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/admin/memberships/payments", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not load membership payments.");
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load membership payments.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Net of refunds, per currency.
  const totals = new Map<string, number>();
  for (const payment of data?.payments ?? []) {
    if (payment.status === "succeeded") totals.set(payment.currency, (totals.get(payment.currency) ?? 0) + payment.amount - payment.refunded);
  }
  const testMode = data?.payments.some((payment) => !payment.live) ?? false;

  return (
    <section aria-labelledby="membership-payments" className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="membership-payments" className="text-lg font-semibold text-gray-900 dark:text-white">
            Membership payments
            {testMode && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">TEST</span>}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Founding 100 monthly fees, read directly from Stripe. Not included in the totals above.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {Array.from(totals).map(([currency, amount]) => (
            <span key={currency} className="text-sm text-gray-500 dark:text-gray-400">
              After refunds <strong className="text-gray-900 dark:text-white">{formatMoney(amount, currency)}</strong>
            </span>
          ))}
          <button type="button" onClick={load} className="h-9 rounded-xl border border-gray-300 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800">
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p>
      ) : !data ? (
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" aria-busy="true" />
      ) : data.payments.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {data.members > 0
            ? "No payments for these members in the connected Stripe account. The keys on this site may be for a different account."
            : "No member has paid yet."}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-200 dark:divide-gray-800">
          {data.payments.map((payment) => {
            const label = paymentLabel(payment);
            return (
              <li key={payment.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {payment.name} <span className="font-normal capitalize text-gray-500 dark:text-gray-400">· {payment.plan}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {day(payment.created)}
                    {payment.failure && ` · ${payment.failure}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-gray-900 dark:text-white">{formatMoney(payment.amount, payment.currency)}</strong>
                  {payment.refunded > 0 && <span className="text-xs text-gray-500 dark:text-gray-400">−{formatMoney(payment.refunded, payment.currency)}</span>}
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE[label] ?? NEUTRAL}`}>{label}</span>
                  {payment.receiptUrl && (
                    <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">Receipt</a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {data?.truncated && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Only the most recent payments are shown.</p>}
      <Link href="/admin/memberships" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
        Refund or manage in Memberships →
      </Link>
    </section>
  );
}
