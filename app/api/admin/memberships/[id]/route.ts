import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/api-auth";
import { BRAND_NAME } from "@/lib/brand";
import { buildMembershipAcceptedEmail, buildMembershipDeclinedEmail } from "@/lib/email-builders";
import {
  PLACE_TAKING_STATUSES,
  createMembershipsClient,
  getFoundingConfig,
  isMissingTableError,
} from "@/lib/founding-server";
import {
  buildTransition,
  isMembershipAction,
  isMembershipStatus,
  londonToday,
  needsFreePlace,
} from "@/lib/memberships";
import { createAndStorePaymentLink, describePaymentLinkError } from "@/lib/membership-payment-link-server";
import { sendEmail } from "@/lib/sendgrid";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Change one application or membership: move it between statuses (approve,
 * decline, pause, resume, cancel) and/or save the admin's private notes.
 * Approving or declining can also email the person, which is the written
 * acceptance the membership terms promise.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid membership id." }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const supabase = createMembershipsClient();

    const { data: current, error: findError } = await supabase.from("memberships").select("*").eq("id", id).maybeSingle();
    if (findError) {
      if (isMissingTableError(findError)) {
        return NextResponse.json({ error: "Memberships have not been set up yet.", setupRequired: true }, { status: 503 });
      }
      console.error("Admin memberships: lookup failed", findError.code, findError.message);
      return NextResponse.json({ error: "Failed to load the membership." }, { status: 500 });
    }
    if (!current || !isMembershipStatus(current.status)) {
      return NextResponse.json({ error: "Membership not found." }, { status: 404 });
    }

    const update: Record<string, unknown> = {};

    if ("notes" in body) {
      if (typeof body.notes !== "string" || body.notes.length > 2000) {
        return NextResponse.json({ error: "Notes must be text of up to 2000 characters." }, { status: 400 });
      }
      update.admin_notes = body.notes.trim() || null;
    }

    let action: ReturnType<typeof asAction> = null;
    if (body.action !== undefined) {
      action = asAction(body.action);
      if (!action) return NextResponse.json({ error: "Unknown action." }, { status: 400 });

      if (needsFreePlace(action)) {
        const config = await getFoundingConfig();
        const { count, error: countError } = await supabase
          .from("memberships")
          .select("id", { count: "exact", head: true })
          .in("status", [...PLACE_TAKING_STATUSES]);

        // A missing count is not zero: skipping the check would let the limit be exceeded.
        if (countError || count === null) {
          return NextResponse.json({ error: "Could not check how many places are left." }, { status: 500 });
        }
        if (count >= config.limit) {
          return NextResponse.json(
            { error: `All ${config.limit} places are taken. Raise the number of places in the settings, or pause or cancel a member first.` },
            { status: 409 },
          );
        }
      }

      const transition = buildTransition(action, current.status, { today: londonToday(), startDate: body.startDate });
      if (!transition.ok) return NextResponse.json({ error: transition.error }, { status: 409 });
      Object.assign(update, transition.update);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
    }

    // For a status change, only update if the row is still in the status the
    // admin was looking at, so a double click or a second admin cannot apply
    // the same change twice.
    let query = supabase.from("memberships").update(update).eq("id", id);
    if (action) query = query.eq("status", current.status);

    const { data: updated, error: updateError } = await query.select("*").maybeSingle();
    if (updateError) {
      console.error("Admin memberships: update failed", updateError.code, updateError.message);
      return NextResponse.json({ error: "Failed to save the change." }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json(
        { error: "This membership was just changed by someone else. Refresh the page and try again." },
        { status: 409 },
      );
    }

    // Accepting can also create the member's Stripe payment link. The change is
    // already saved, so a link that cannot be made is reported, not an error.
    let result = updated;
    let paymentLinkUrl: string | null = null;
    let paymentLinkError: string | null = null;
    if (action === "approve" && body.includePaymentLink === true) {
      try {
        const link = await createAndStorePaymentLink(updated);
        paymentLinkUrl = link.url;
        const { data: fresh } = await supabase.from("memberships").select("*").eq("id", id).maybeSingle();
        if (fresh) result = fresh;
      } catch (error) {
        console.error("Admin memberships: payment link failed", error);
        paymentLinkError = describePaymentLinkError(error).message;
      }
    }

    // The change is saved; a failed email must not turn that into an error.
    let emailSent: boolean | null = null;
    if ((action === "approve" || action === "decline") && body.sendEmail === true) {
      try {
        const message =
          action === "approve"
            ? buildMembershipAcceptedEmail(result, BRAND_NAME, { paymentUrl: paymentLinkUrl ?? undefined })
            : buildMembershipDeclinedEmail(result, BRAND_NAME);
        await sendEmail({ to: result.email, subject: message.subject, text: message.text, html: message.html });
        emailSent = true;
      } catch (error) {
        console.error("Admin memberships: email to member failed", error);
        emailSent = false;
      }
    }

    return NextResponse.json({ membership: result, emailSent, paymentLinkUrl, paymentLinkError });
  } catch (error) {
    console.error("Admin memberships: unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function asAction(value: unknown) {
  return isMembershipAction(value) ? value : null;
}
