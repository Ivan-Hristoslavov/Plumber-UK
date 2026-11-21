import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/api-auth";
import { BRAND_NAME } from "@/lib/brand";
import { buildMembershipPaymentLinkEmail } from "@/lib/email-builders";
import { createMembershipsClient, isMissingTableError } from "@/lib/founding-server";
import { createAndStorePaymentLink, describePaymentLinkError } from "@/lib/membership-payment-link-server";
import { sendEmail } from "@/lib/sendgrid";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Create (or replace) a Stripe payment link for an accepted member's monthly
 * plan, and optionally email it. The fee is the one they agreed when they
 * applied, not today's price.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid membership id." }, { status: 400 });

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // An empty body is fine: it means "create the link, do not email".
  }

  try {
    const supabase = createMembershipsClient();
    const { data: member, error: findError } = await supabase.from("memberships").select("*").eq("id", id).maybeSingle();

    if (findError) {
      if (isMissingTableError(findError)) {
        return NextResponse.json({ error: "Memberships have not been set up yet.", setupRequired: true }, { status: 503 });
      }
      console.error("Admin payment link: lookup failed", findError.code, findError.message);
      return NextResponse.json({ error: "Failed to load the membership." }, { status: 500 });
    }
    if (!member) return NextResponse.json({ error: "Membership not found." }, { status: 404 });

    // Only accepted members pay; and someone who already pays does not need a link.
    if (member.status !== "active") {
      return NextResponse.json({ error: "Only an accepted (active) member can be sent a payment link." }, { status: 409 });
    }
    if (member.payment_status === "paid") {
      return NextResponse.json({ error: "This member is already paying." }, { status: 409 });
    }

    let link: { url: string; linkId: string };
    try {
      link = await createAndStorePaymentLink(member);
    } catch (error) {
      console.error("Admin payment link: creation failed", error);
      const { status, message } = describePaymentLinkError(error);
      return NextResponse.json({ error: message }, { status });
    }

    let emailSent: boolean | null = null;
    if (body.sendEmail === true) {
      try {
        const message = buildMembershipPaymentLinkEmail(member, BRAND_NAME, link.url);
        await sendEmail({ to: member.email, subject: message.subject, text: message.text, html: message.html });
        emailSent = true;
      } catch (error) {
        console.error("Admin payment link: email failed", error);
        emailSent = false;
      }
    }

    const { data: fresh } = await supabase.from("memberships").select("*").eq("id", id).maybeSingle();
    return NextResponse.json({ membership: fresh ?? member, paymentLinkUrl: link.url, emailSent });
  } catch (error) {
    console.error("Admin payment link: unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
