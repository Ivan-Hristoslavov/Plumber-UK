import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api-auth";
import {
  buildBookingNotificationEmail,
  buildPaymentLinkEmail,
  generateInvoiceEmailHtml,
} from "@/lib/email-builders";
import { formatLondonDateTime, renderEmail, siteUrl } from "@/lib/email-templates";
import {
  describeSendGridError,
  getAdminRecipient,
  getEmailEnvStatus,
  getSenderEmail,
  sendEmail,
} from "@/lib/sendgrid";

export const dynamic = "force-dynamic";

const TEMPLATES = ["test", "booking", "payment", "invoice"] as const;
type TemplateId = (typeof TEMPLATES)[number];

const isTemplateId = (value: unknown): value is TemplateId =>
  typeof value === "string" && (TEMPLATES as readonly string[]).includes(value);

/** The real email, filled with obviously fake data. Subjects are marked [TEST]. */
function buildSampleEmail(template: Exclude<TemplateId, "test">) {
  const base = siteUrl();

  if (template === "booking") {
    const day = new Date();
    day.setUTCDate(day.getUTCDate() + 1);

    const email = buildBookingNotificationEmail({
      id: "TEST-0001",
      customer_name: "Sarah Johnson",
      customer_email: "sarah.johnson@example.com",
      customer_phone: "07700 900123",
      service: "Emergency Plumbing",
      date: day.toISOString().slice(0, 10),
      time: "09:30:00",
      amount: 85,
      address: "14 Elms Road, Clapham, London SW4 9ER",
      notes: "Water coming through the kitchen ceiling. Key is with the neighbour at no. 16.",
      created_at: new Date().toISOString(),
    });
    return { ...email, subject: `[TEST] ${email.subject}` };
  }

  if (template === "payment") {
    const email = buildPaymentLinkEmail({
      company: "FixMyLeak",
      adminName: "FixMyLeak",
      adminEmail: process.env.GMAIL_USER || process.env.ADMIN_EMAIL || "info@fixmyleak.co.uk",
      hasCompanyName: false,
      customerName: "Sarah Johnson",
      amount: 85,
      paymentLinkUrl: base,
    });
    return { ...email, subject: `[TEST] ${email.subject}` };
  }

  const invoice = {
    invoice_number: "INV-TEST-0042",
    invoice_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    total_amount: 185,
    notes: "Replaced the burst section of pipe under the kitchen sink.\nThank you for your business.",
    company_name: "FixMyLeak",
    company_address: "London",
    company_phone: "07541 777225",
    company_email: process.env.GMAIL_USER || "info@fixmyleak.co.uk",
    customer: { name: "Sarah Johnson", email: "sarah.johnson@example.com" },
    manual_service: "Leak repair",
  };

  return {
    subject: `[TEST] Invoice ${invoice.invoice_number} from ${invoice.company_name}`,
    html: generateInvoiceEmailHtml(invoice, base, false, "gbp"),
    text: `Invoice ${invoice.invoice_number} from ${invoice.company_name}\n\nTotal: £${invoice.total_amount.toFixed(2)}\n\nThis is a test invoice email with sample data.`,
  };
}

// GET - Report how booking emails are configured, without sending anything.
// This mirrors the real booking flow (SendGrid HTTP API, same recipient and
// sender lookup), so what it shows is what a customer booking will use.
export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const [recipient, sender] = await Promise.all([
      getAdminRecipient(),
      getSenderEmail(),
    ]);
    const env = getEmailEnvStatus();

    const warnings: string[] = [];
    if (env.provider === "none") {
      warnings.push(
        "No email provider is configured. Set GMAIL_USER + GMAIL_APP_PASSWORD (Gmail) or SENDGRID_API_KEY (SendGrid).",
      );
    }
    if (!recipient.email) {
      warnings.push(
        "No recipient: BOOKING_NOTIFY_EMAIL and ADMIN_EMAIL are not set and admin_profile.email is empty or unreadable. New bookings send no email.",
      );
    }
    if (recipient.profileError && recipient.source !== "BOOKING_NOTIFY_EMAIL") {
      warnings.push(
        `Could not read admin_profile (${recipient.profileError}). The ADMIN_EMAIL fallback is used instead.`,
      );
    }
    if (
      env.provider === "sendgrid" &&
      recipient.email &&
      sender.toLowerCase() === recipient.email.toLowerCase()
    ) {
      warnings.push(
        "Sender and recipient are the same address. SendGrid accepts this, but Gmail and others often hide it in Spam.",
      );
    }

    return NextResponse.json({
      success: true,
      configured: env.provider !== "none" && !!recipient.email,
      env,
      recipient,
      sender,
      warnings,
    });
  } catch (error) {
    console.error("Error reading email configuration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to read email configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST - Send a real test email through the same path as booking notifications.
// `to` is optional and defaults to the address new bookings are sent to.
export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));
    const requested =
      typeof body?.to === "string" && body.to.trim() ? body.to.trim() : null;
    const template: TemplateId = isTemplateId(body?.template) ? body.template : "test";

    const recipient = await getAdminRecipient();
    const to = requested || recipient.email;

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No recipient. Enter an address, or set the email in the admin profile or ADMIN_EMAIL.",
        },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json(
        { success: false, error: "That does not look like an email address." },
        { status: 400 },
      );
    }

    const from = await getSenderEmail();

    if (template === "test") {
      const sentAt = formatLondonDateTime(new Date());

      const { html, text } = renderEmail({
        preheader: "If you can read this, booking alerts will arrive.",
        eyebrow: "Test email",
        title: "Email is working",
        intro: `This is a test of the booking notification email. If you can read this, new booking alerts sent to ${to} will arrive.`,
        blocks: [
          {
            type: "rows",
            title: "Delivery details",
            rows: [
              { label: "Sent to", value: to },
              { label: "Sent from", value: from },
              { label: "Sent at", value: sentAt },
            ],
          },
        ],
        buttons: [{ label: "Open admin panel", url: `${siteUrl()}/admin/dashboard`, tone: "brand" }],
        footerNote: "Nothing to do. You can delete this message.",
      });

      await sendEmail({ to, subject: "Test email from FixMyLeak admin", text, html });
    } else {
      await sendEmail({ to, ...buildSampleEmail(template) });
    }

    return NextResponse.json({
      success: true,
      message: `The mail server accepted the email for ${to}. Check the inbox and Spam folder.`,
      recipient: to,
      sender: from,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    const info = describeSendGridError(error);

    return NextResponse.json(
      {
        success: false,
        error: info.details[0] || info.message,
        statusCode: info.statusCode,
        details: info.details,
      },
      { status: 500 },
    );
  }
}
