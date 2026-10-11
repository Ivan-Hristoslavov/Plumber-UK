import {
  formatClock,
  formatLondonDateTime,
  formatShortDate,
  renderEmail,
  renderEmailHtml,
  siteUrl,
} from "@/lib/email-templates";

/**
 * Builders for every email the site sends. They live here, not in the API
 * routes, so the admin "Send a test email" page can send the exact same
 * message with sample data.
 */

// The "new booking" alert the plumber receives.
export function buildBookingNotificationEmail(booking: any) {
  const when = `${formatShortDate(booking.date)}, ${formatClock(booking.time)}`;
  const amount = Number(booking.amount || 0);
  const base = siteUrl();

  const content = {
    preheader: `${booking.service} on ${when}${booking.customer_phone ? ` · ${booking.customer_phone}` : ""}`,
    eyebrow: "New booking",
    title: `${booking.customer_name} has booked`,
    intro: "A customer has just booked through the website. Check the details and confirm it in the admin panel.",
    blocks: [
      {
        type: "highlight" as const,
        label: "When",
        title: when,
        subtitle: booking.service,
        ...(amount > 0 ? { aside: { label: "Quoted", value: `£${amount.toFixed(2)}` } } : {}),
      },
      {
        type: "rows" as const,
        title: "Customer",
        rows: [
          { label: "Name", value: booking.customer_name },
          {
            label: "Phone",
            value: booking.customer_phone || "Not provided",
            ...(booking.customer_phone ? { href: `tel:${booking.customer_phone}` } : {}),
          },
          {
            label: "Email",
            value: booking.customer_email || "Not provided",
            ...(booking.customer_email ? { href: `mailto:${booking.customer_email}` } : {}),
          },
          ...(booking.address
            ? [
                {
                  label: "Address",
                  value: booking.address,
                  href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`,
                },
              ]
            : []),
        ],
      },
      ...(booking.notes
        ? [{ type: "note" as const, title: "Customer notes", text: booking.notes }]
        : []),
      {
        type: "rows" as const,
        rows: [
          { label: "Booking ref", value: String(booking.id) },
          {
            label: "Received",
            value: formatLondonDateTime(booking.created_at || new Date()),
          },
        ],
      },
    ],
    buttons: [
      ...(booking.customer_phone
        ? [{ label: `Call ${String(booking.customer_name).split(" ")[0]}`, url: `tel:${booking.customer_phone}`, tone: "success" as const }]
        : []),
      { label: "Open in admin", url: `${base}/admin/bookings`, tone: "brand" as const },
    ],
    footerNote: "This is an automatic alert from the FixMyLeak booking system.",
  };

  return {
    subject: `New booking: ${booking.customer_name} · ${when}`,
    ...renderEmail(content),
  };
}

export function buildPaymentLinkEmail(input: {
  company: string;
  adminName: string;
  adminEmail: string;
  hasCompanyName: boolean;
  customerName: string;
  amount: number;
  paymentLinkUrl: string;
}) {
  const amount = `£${Number(input.amount).toFixed(2)}`;

  return {
    subject: `Payment Request from ${input.company}`,
    ...renderEmail({
      brandName: input.company,
      preheader: `Pay ${amount} securely online`,
      eyebrow: "Payment request",
      title: `${amount} to pay`,
      intro: `Dear ${input.customerName},\n\nWe have prepared a secure payment link for your convenience.`,
      blocks: [
        {
          type: "rows",
          title: "Payment details",
          rows: [
            { label: "Amount", value: amount, emphasis: true },
            { label: "Pay by", value: "Card or other methods, securely via Stripe" },
          ],
        },
      ],
      buttons: [{ label: "Pay now", url: input.paymentLinkUrl, tone: "success" }],
      footerNote: `The link is secure and processed by Stripe. If you have any questions about this payment, just reply or get in touch.\n\n${input.adminName}${input.hasCompanyName ? `, ${input.company}` : ""}\n${input.adminEmail}`,
    }),
  };
}

export function generateInvoiceEmailHtml(invoice: any, paymentLink: string | null, hasAttachments: boolean, currency: string): string {
  const customerName = invoice.customer?.name || "Valued Customer";
  const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString("en-GB");
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-GB") : "Upon receipt";
  
  // Currency symbol mapping
  const currencySymbols: Record<string, string> = {
    gbp: "£",
    usd: "$",
    eur: "€",
    cad: "C$",
    aud: "A$",
  };
  
  const currencySymbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();

  const total = `${currencySymbol}${Number(invoice.total_amount).toFixed(2)}`;
  const service = invoice.booking?.service || invoice.manual_service || "Plumbing Service";

  return renderEmailHtml({
    brandName: invoice.company_name,
    preheader: `Invoice ${invoice.invoice_number} · ${total}${dueDate !== "Upon receipt" ? ` · due ${dueDate}` : ""}`,
    eyebrow: "Invoice",
    title: `Invoice ${invoice.invoice_number}`,
    intro: `Dear ${customerName},\n\nThank you for choosing ${invoice.company_name}. Your invoice is attached as a PDF, with the details below.`,
    blocks: [
      {
        type: "highlight",
        label: "Total due",
        title: total,
        subtitle: service,
        aside: { label: "Due", value: dueDate },
      },
      {
        type: "rows",
        title: "Invoice details",
        rows: [
          { label: "Invoice number", value: invoice.invoice_number },
          { label: "Invoice date", value: invoiceDate },
          { label: "Due date", value: dueDate },
          { label: "Service", value: service },
        ],
      },
      ...(invoice.notes
        ? [{ type: "note" as const, title: "Notes", text: invoice.notes }]
        : []),
      ...(hasAttachments
        ? [{ type: "paragraph" as const, text: "Photos of the completed work are attached to this email." }]
        : []),
      {
        type: "rows",
        title: "How to pay",
        rows: paymentLink
          ? [
              { label: "Online", value: `Secure card payment in ${currency.toUpperCase()} (button below, valid for 24 hours)` },
              { label: "Bank transfer", value: "Details available on request" },
              { label: "Cheque", value: `Payable to ${invoice.company_name}` },
            ]
          : [
              { label: "Within", value: "30 days of the invoice date" },
              { label: "Bank transfer", value: "Details available on request" },
              { label: "Cheque", value: `Payable to ${invoice.company_name}` },
            ],
      },
    ],
    buttons: paymentLink
      ? [{ label: `Pay ${total} online`, url: paymentLink, tone: "success" }]
      : [],
    footerNote: `Questions about this invoice? Get in touch:\n${invoice.company_name}${invoice.company_phone ? `\n${invoice.company_phone}` : ""}${invoice.company_email ? `\n${invoice.company_email}` : ""}${invoice.company_address ? `\n${invoice.company_address}` : ""}`,
  });
}
