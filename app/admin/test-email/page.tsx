"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

type EmailStatus = {
  success: boolean;
  configured?: boolean;
  env?: {
    provider: "gmail-app-password" | "gmail-oauth2" | "sendgrid" | "none";
    sendgridApiKey: boolean;
    adminEmail: boolean;
  };
  recipient?: {
    email: string | null;
    source: "BOOKING_NOTIFY_EMAIL" | "admin_profile" | "ADMIN_EMAIL" | "none";
    profileError?: string;
  };
  sender?: string;
  warnings?: string[];
  error?: string;
};

type SendResult = {
  success: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
  details?: string[];
  recipient?: string;
  sender?: string;
};

type StripeResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const PROVIDER_LABEL: Record<string, string> = {
  "gmail-app-password": "Gmail SMTP (app password)",
  "gmail-oauth2": "Gmail SMTP (OAuth2)",
  sendgrid: "SendGrid",
  none: "Not configured",
};

const TEMPLATE_OPTIONS = [
  {
    id: "test",
    label: "Simple test email",
    hint: "A short message that only confirms delivery works.",
  },
  {
    id: "booking",
    label: "New booking alert",
    hint: "What you receive when a customer books. Sample customer, date and notes.",
  },
  {
    id: "payment",
    label: "Payment request",
    hint: "What a customer receives with a payment link. Sample amount.",
  },
  {
    id: "invoice",
    label: "Invoice",
    hint: "What a customer receives with an invoice. Sample invoice, no PDF attached.",
  },
] as const;

type TemplateId = (typeof TEMPLATE_OPTIONS)[number]["id"];

const SOURCE_LABEL: Record<string, string> = {
  BOOKING_NOTIFY_EMAIL: "BOOKING_NOTIFY_EMAIL environment variable",
  admin_profile: "Admin → Profile",
  ADMIN_EMAIL: "ADMIN_EMAIL environment variable",
  none: "not set",
};

const card =
  "rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";

function Dot({ ok }: { ok: boolean | null }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
        ok === null
          ? "bg-gray-300 dark:bg-gray-600"
          : ok
            ? "bg-emerald-500"
            : "bg-red-500"
      }`}
    />
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium text-gray-900 dark:text-white sm:text-right">
        {children}
      </dd>
    </div>
  );
}

export default function TestEmailPage() {
  const { showSuccess, showError } = useToast();

  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [customTo, setCustomTo] = useState("");
  const [template, setTemplate] = useState<TemplateId>("test");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [stripeTesting, setStripeTesting] = useState(false);
  const [stripeResult, setStripeResult] = useState<StripeResult | null>(null);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const response = await fetch("/api/test-email", { cache: "no-store" });
      setStatus(await response.json());
    } catch (error) {
      console.error("Error loading email status:", error);
      setStatus({ success: false, error: "Could not load the email configuration" });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const sendTestEmail = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: customTo.trim() || undefined, template }),
      });
      const result: SendResult = await response.json();
      setSendResult(result);

      if (result.success) {
        showSuccess("Test email", result.message || "Test email sent");
      } else {
        showError("Test email", result.error || "Failed to send test email");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      setSendResult({ success: false, error: "Could not reach the server" });
      showError("Test email", "Could not reach the server");
    } finally {
      setSending(false);
    }
  };

  const testStripe = async () => {
    setStripeTesting(true);
    try {
      const response = await fetch("/api/payments/verify?test=true");
      const result: StripeResult = await response.json();
      setStripeResult(result);

      if (result.success) {
        showSuccess("Stripe", "Stripe is properly configured");
      } else {
        showError("Stripe", result.error || "Stripe configuration failed");
      }
    } catch (error) {
      console.error("Error testing Stripe:", error);
      setStripeResult({ success: false, error: "Failed to test Stripe configuration" });
      showError("Stripe", "Failed to test Stripe configuration");
    } finally {
      setStripeTesting(false);
    }
  };

  const recipient = status?.recipient;
  const ready = !!status?.configured;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
          Email &amp; Payments check
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          See where new-booking emails go, and send a real test through the same route.
        </p>
      </div>

      {/* Verdict */}
      {!statusLoading && status && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ${
            ready
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
              : "border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100"
          }`}
        >
          <span className="mt-1">
            <Dot ok={ready} />
          </span>
          <p>
            {ready
              ? `Booking emails are set up and go to ${recipient?.email}. Send a test below to confirm they arrive.`
              : status.error ||
                "Booking emails are not fully set up. See the details below."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 sm:gap-6">
        {/* Email configuration */}
        <section className={card} aria-labelledby="email-config">
          <div className="flex items-center justify-between">
            <h2
              id="email-config"
              className="text-base font-semibold text-gray-900 dark:text-white"
            >
              New booking email
            </h2>
            <button
              type="button"
              onClick={loadStatus}
              disabled={statusLoading}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 dark:text-blue-400"
            >
              {statusLoading ? "Checking..." : "Re-check"}
            </button>
          </div>

          {statusLoading && !status ? (
            <div className="mt-4 space-y-3 animate-pulse" aria-busy="true">
              <div className="h-4 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ) : (
            <dl className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
              <Row label="Email provider">
                <span className="inline-flex items-center gap-2">
                  <Dot ok={status?.env ? status.env.provider !== "none" : null} />
                  {status?.env ? PROVIDER_LABEL[status.env.provider] : "—"}
                </span>
              </Row>
              <Row label="Emails are sent to">
                <span className="inline-flex items-center gap-2">
                  <Dot ok={recipient ? !!recipient.email : null} />
                  {recipient?.email || "Nobody — no address found"}
                </span>
              </Row>
              <Row label="Address taken from">
                {recipient ? SOURCE_LABEL[recipient.source] : "—"}
              </Row>
              <Row label="Sent from">{status?.sender || "—"}</Row>
            </dl>
          )}

          {status?.warnings && status.warnings.length > 0 && (
            <ul className="mt-3 space-y-2">
              {status.warnings.map((warning) => (
                <li
                  key={warning}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
                >
                  {warning}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Send a test */}
        <section className={card} aria-labelledby="email-send">
          <h2
            id="email-send"
            className="text-base font-semibold text-gray-900 dark:text-white"
          >
            Send a test email
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Goes out through the same provider as a real booking alert.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="test-template"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email type
              </label>
              <select
                id="test-template"
                value={template}
                onChange={(e) => setTemplate(e.target.value as TemplateId)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {TEMPLATE_OPTIONS.find((option) => option.id === template)?.hint}
              </p>
            </div>

            <div>
              <label
                htmlFor="test-to"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Send to
              </label>
              <input
                id="test-to"
                type="email"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                placeholder={recipient?.email || "name@example.com"}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to use the booking alert address
                {recipient?.email ? ` (${recipient.email})` : ""}. Sample emails are
                marked [TEST] in the subject and use made-up customer data.
              </p>
            </div>

            <button
              type="button"
              onClick={sendTestEmail}
              disabled={sending || statusLoading}
              className={`${primaryButton} w-full`}
            >
              {sending ? "Sending..." : "Send test email"}
            </button>

            {sendResult && (
              <div
                role="status"
                className={`rounded-xl border px-3 py-2.5 text-sm ${
                  sendResult.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
                    : "border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100"
                }`}
              >
                <p className="font-medium">
                  {sendResult.success
                    ? sendResult.message
                    : `Not sent${sendResult.statusCode ? ` (error ${sendResult.statusCode})` : ""}`}
                </p>
                {!sendResult.success && (
                  <>
                    <p className="mt-1">{sendResult.error}</p>
                    {sendResult.statusCode === 403 && (
                      <p className="mt-2 text-xs opacity-90">
                        403 usually means the sender address is not verified in SendGrid.
                        Verify it under Settings → Sender Authentication, or change the
                        business email in Admin → Profile.
                      </p>
                    )}
                    {sendResult.statusCode === 401 && (
                      <p className="mt-2 text-xs opacity-90">
                        401 means the API key is invalid or revoked. Create a new key in
                        SendGrid and update SENDGRID_API_KEY.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Stripe */}
      <section className={card} aria-labelledby="stripe-check">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="stripe-check"
              className="text-base font-semibold text-gray-900 dark:text-white"
            >
              Stripe connection
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Makes a live call to Stripe with the configured keys.
            </p>
          </div>
          <button
            type="button"
            onClick={testStripe}
            disabled={stripeTesting}
            className={secondaryButton}
          >
            {stripeTesting ? "Testing..." : "Test Stripe"}
          </button>
        </div>

        {stripeResult && (
          <p
            role="status"
            className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${
              stripeResult.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
                : "border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100"
            }`}
          >
            {stripeResult.message || stripeResult.error}
          </p>
        )}
      </section>

      {/* Help */}
      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/5 dark:text-blue-100 sm:p-6">
        <h2 className="text-base font-semibold">If booking emails do not arrive</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            Send a test above. If it fails, the message is the mail provider&apos;s own reason.
          </li>
          <li>
            If the test arrives but real bookings do not, the booking form is not
            reaching this address. Check the address under &ldquo;Emails are sent
            to&rdquo;.
          </li>
          <li>
            Check Spam. With SendGrid, also check Activity in its dashboard to see whether
            the message was delivered, deferred or blocked.
          </li>
          <li>
            With SendGrid the sender must be a verified Single Sender or authenticated
            domain. With Gmail the sender is always the Gmail account itself.
          </li>
        </ol>
      </section>
    </div>
  );
}
