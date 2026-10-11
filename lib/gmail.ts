import nodemailer from "nodemailer";

import { BRAND_NAME } from "@/lib/brand";

export interface GmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface GmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: GmailAttachment[];
}

export type GmailMode = "app-password" | "oauth2";

/**
 * Gmail / Google Workspace SMTP, used instead of SendGrid whenever it is
 * configured. Two ways to authenticate (set one):
 *
 *  - App password (simplest, does not expire):
 *      GMAIL_USER, GMAIL_APP_PASSWORD
 *  - OAuth2 (no password stored, but needs a refresh token):
 *      GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 */
export function getGmailMode(): GmailMode | null {
  if (!process.env.GMAIL_USER) return null;
  if (process.env.GMAIL_APP_PASSWORD) return "app-password";
  if (
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  ) {
    return "oauth2";
  }
  return null;
}

export const isGmailConfigured = () => getGmailMode() !== null;

export const getGmailSender = () => process.env.GMAIL_USER || null;

function createTransport(mode: GmailMode) {
  const user = process.env.GMAIL_USER!;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth:
      mode === "oauth2"
        ? {
            type: "OAuth2",
            user,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          }
        : {
            user,
            // Google shows app passwords with spaces for readability.
            pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, ""),
          },
  });
}

export async function sendViaGmail(message: GmailMessage): Promise<boolean> {
  const mode = getGmailMode();
  if (!mode) throw new Error("Gmail is not configured");

  const from = `"${process.env.GMAIL_FROM_NAME || BRAND_NAME}" <${process.env.GMAIL_USER}>`;

  console.log("Sending email via Gmail SMTP:", {
    mode,
    to: message.to,
    from,
    subject: message.subject,
    attachments: message.attachments?.length || 0,
  });

  const info = await createTransport(mode).sendMail({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: message.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });

  console.log("Email sent via Gmail SMTP:", {
    messageId: info.messageId,
    response: info.response,
  });

  return true;
}
