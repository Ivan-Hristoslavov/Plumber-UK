import { BRAND_NAME } from "@/lib/brand";

/**
 * One layout for every email the site sends (booking alerts, payment links,
 * invoices, tests). Table-based with inline styles because Gmail, Outlook and
 * Yahoo ignore most modern CSS. Everything interpolated is escaped.
 */

const COLORS = {
  page: "#f1f5f9",
  card: "#ffffff",
  ink: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  line: "#e2e8f0",
  soft: "#f8fafc",
  brand: "#2563eb",
  brandDark: "#1d4ed8",
  brandSoft: "#eff6ff",
  success: "#059669",
  successDark: "#047857",
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

/** Escapes, then turns line breaks into <br>. */
export const escapeMultiline = (value: unknown): string =>
  escapeHtml(value).replace(/\r?\n/g, "<br>");

/** Only http(s), mailto and tel links are allowed into an href. */
function safeUrl(url: string): string {
  return /^(https?:|mailto:|tel:)/i.test(url) ? escapeHtml(url) : "#";
}

export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk").replace(/\/$/, "");

export const formatLongDate = (isoDate: string): string => {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? `${isoDate}T00:00:00Z` : isoDate);
  if (Number.isNaN(date.getTime())) return String(isoDate);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const formatShortDate = (isoDate: string): string => {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? `${isoDate}T00:00:00Z` : isoDate);
  if (Number.isNaN(date.getTime())) return String(isoDate);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
};

export const formatClock = (time: string | null | undefined): string =>
  (time || "").slice(0, 5);

export const formatLondonDateTime = (value: string | Date): string =>
  new Date(value).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export interface EmailRow {
  label: string;
  value: string;
  /** Makes the value a link (tel:, mailto:, https:). */
  href?: string;
  /** Larger, bolder value, for amounts. */
  emphasis?: boolean;
}

export type EmailBlock =
  | {
      /** The one thing to see at a glance: when, what, how much. */
      type: "highlight";
      label: string;
      title: string;
      subtitle?: string;
      aside?: { label: string; value: string };
    }
  | { type: "rows"; title?: string; rows: EmailRow[] }
  | { type: "note"; title?: string; text: string }
  | { type: "paragraph"; text: string };

export interface EmailButton {
  label: string;
  url: string;
  tone?: "brand" | "success" | "light";
}

export interface EmailContent {
  /** Hidden preview line shown next to the subject in the inbox. */
  preheader: string;
  eyebrow?: string;
  title: string;
  /** Plain text, escaped here. */
  intro?: string;
  blocks: EmailBlock[];
  buttons?: EmailButton[];
  footerNote?: string;
  /** Company name in the header and footer. Defaults to the brand. */
  brandName?: string;
}

function renderButton(button: EmailButton): string {
  const tone = button.tone || "brand";
  const fill =
    tone === "success" ? COLORS.success : tone === "light" ? COLORS.card : COLORS.brand;
  const border =
    tone === "success" ? COLORS.successDark : tone === "light" ? COLORS.line : COLORS.brandDark;
  const color = tone === "light" ? COLORS.ink : "#ffffff";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 8px 12px 0;display:inline-table;">
      <tr><td align="center" bgcolor="${fill}" style="border-radius:10px;border:1px solid ${border};">
        <a href="${safeUrl(button.url)}" style="display:inline-block;padding:13px 24px;font-family:${FONT};font-size:15px;font-weight:600;line-height:1;color:${color};text-decoration:none;border-radius:10px;">${escapeHtml(button.label)}</a>
      </td></tr>
    </table>`;
}

function renderBlock(block: EmailBlock): string {
  switch (block.type) {
    case "highlight":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:${COLORS.brandSoft};border:1px solid #dbeafe;border-radius:14px;">
        <tr>
          <td style="padding:20px 22px;">
            <div style="font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.brand};">${escapeHtml(block.label)}</div>
            <div style="font-family:${FONT};font-size:22px;line-height:1.3;font-weight:700;color:${COLORS.ink};margin-top:6px;">${escapeHtml(block.title)}</div>
            ${block.subtitle ? `<div style="font-family:${FONT};font-size:15px;line-height:1.4;color:${COLORS.body};margin-top:4px;">${escapeHtml(block.subtitle)}</div>` : ""}
          </td>
          ${
            block.aside
              ? `<td align="right" valign="middle" style="padding:20px 22px 20px 0;white-space:nowrap;">
            <div style="font-family:${FONT};font-size:12px;color:${COLORS.muted};">${escapeHtml(block.aside.label)}</div>
            <div style="font-family:${FONT};font-size:26px;font-weight:700;color:${COLORS.brandDark};margin-top:2px;">${escapeHtml(block.aside.value)}</div>
          </td>`
              : ""
          }
        </tr>
      </table>`;

    case "rows":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
        ${
          block.title
            ? `<tr><td colspan="2" style="padding:0 0 8px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.muted};">${escapeHtml(block.title)}</td></tr>`
            : ""
        }
        ${block.rows
          .map(
            (row, i) => `<tr>
          <td valign="top" style="padding:11px 12px 11px 0;${i > 0 || block.title ? `border-top:1px solid ${COLORS.line};` : ""}font-family:${FONT};font-size:14px;color:${COLORS.muted};width:34%;">${escapeHtml(row.label)}</td>
          <td valign="top" style="padding:11px 0;${i > 0 || block.title ? `border-top:1px solid ${COLORS.line};` : ""}font-family:${FONT};font-size:${row.emphasis ? "18px" : "15px"};font-weight:${row.emphasis ? "700" : "500"};color:${COLORS.ink};line-height:1.45;">${
              row.href
                ? `<a href="${safeUrl(row.href)}" style="color:${COLORS.brand};text-decoration:none;">${escapeHtml(row.value)}</a>`
                : escapeMultiline(row.value)
            }</td>
        </tr>`,
          )
          .join("")}
      </table>`;

    case "note":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;">
        <tr><td style="padding:14px 18px;font-family:${FONT};font-size:14px;line-height:1.55;color:#78350f;">
          ${block.title ? `<div style="font-weight:700;margin-bottom:4px;">${escapeHtml(block.title)}</div>` : ""}
          ${escapeMultiline(block.text)}
        </td></tr>
      </table>`;

    case "paragraph":
      return `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${COLORS.body};">${escapeMultiline(block.text)}</p>`;
  }
}

export function renderEmailHtml(content: EmailContent): string {
  const brand = escapeHtml(content.brandName || BRAND_NAME);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(content.title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.page};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLORS.page};font-size:1px;line-height:1px;">${escapeHtml(content.preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.page}" style="background:${COLORS.page};">
  <tr>
    <td align="center" style="padding:28px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr>
          <td style="padding:0 4px 14px;font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:-0.01em;color:${COLORS.ink};">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${COLORS.brand};margin-right:8px;"></span>${brand}
          </td>
        </tr>
        <tr>
          <td style="background:${COLORS.card};border:1px solid ${COLORS.line};border-radius:18px;overflow:hidden;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="${COLORS.brand}" style="background:${COLORS.brand};background-image:linear-gradient(135deg,${COLORS.brand},${COLORS.brandDark});padding:28px 28px 26px;">
                  ${content.eyebrow ? `<div style="font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#bfdbfe;">${escapeHtml(content.eyebrow)}</div>` : ""}
                  <div style="font-family:${FONT};font-size:24px;line-height:1.25;font-weight:700;color:#ffffff;margin-top:${content.eyebrow ? "6px" : "0"};">${escapeHtml(content.title)}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:26px 28px 14px;">
                  ${content.intro ? `<p style="margin:0 0 20px;font-family:${FONT};font-size:15px;line-height:1.6;color:${COLORS.body};">${escapeMultiline(content.intro)}</p>` : ""}
                  ${content.blocks.map(renderBlock).join("\n")}
                  ${content.buttons?.length ? `<div style="margin:6px 0 8px;">${content.buttons.map(renderButton).join("")}</div>` : ""}
                </td>
              </tr>
              ${
                content.footerNote
                  ? `<tr><td style="padding:4px 28px 26px;font-family:${FONT};font-size:13px;line-height:1.55;color:${COLORS.muted};">${escapeMultiline(content.footerNote)}</td></tr>`
                  : ""
              }
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:18px 8px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:#94a3b8;">
            ${brand} &middot; Emergency plumber, South West London<br>
            <a href="${siteUrl()}" style="color:#94a3b8;text-decoration:underline;">${escapeHtml(siteUrl().replace(/^https?:\/\//, ""))}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Plain-text twin of the same content, for clients that do not show HTML. */
export function renderEmailText(content: EmailContent): string {
  const lines: string[] = [];
  if (content.eyebrow) lines.push(content.eyebrow.toUpperCase());
  lines.push(content.title, "");
  if (content.intro) lines.push(content.intro, "");

  for (const block of content.blocks) {
    switch (block.type) {
      case "highlight":
        lines.push(
          `${block.label}: ${block.title}`,
          ...(block.subtitle ? [block.subtitle] : []),
          ...(block.aside ? [`${block.aside.label}: ${block.aside.value}`] : []),
          "",
        );
        break;
      case "rows":
        if (block.title) lines.push(block.title.toUpperCase());
        lines.push(...block.rows.map((r) => `${r.label}: ${r.value}`), "");
        break;
      case "note":
        lines.push(...(block.title ? [`${block.title}:`] : []), block.text, "");
        break;
      case "paragraph":
        lines.push(block.text, "");
        break;
    }
  }

  for (const button of content.buttons || []) {
    lines.push(`${button.label}: ${button.url}`);
  }
  if (content.buttons?.length) lines.push("");
  if (content.footerNote) lines.push(content.footerNote, "");
  lines.push(`${content.brandName || BRAND_NAME} - ${siteUrl()}`);

  return lines.join("\n");
}

export const renderEmail = (content: EmailContent) => ({
  html: renderEmailHtml(content),
  text: renderEmailText(content),
});
