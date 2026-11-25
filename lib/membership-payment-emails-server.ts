import { BRAND_NAME } from "@/lib/brand";
import { buildMembershipPaidAlertEmail, buildMembershipPaidEmail } from "@/lib/email-builders";
import { createMembershipsClient } from "@/lib/founding-server";
import { getAdminRecipient, sendEmail } from "@/lib/sendgrid";

/**
 * Tell the member and the plumber that the first payment was taken. Never
 * throws: the payment is already recorded, and each email is sent on its own so
 * one failing does not stop the other.
 */
export async function sendFirstPaymentEmails(membershipId: string): Promise<void> {
  const supabase = createMembershipsClient();
  const { data: member, error } = await supabase.from("memberships").select("*").eq("id", membershipId).maybeSingle();
  if (error || !member) {
    console.error("Membership payment emails: could not load the member", error?.message ?? "not found");
    return;
  }

  try {
    const message = buildMembershipPaidEmail(member, BRAND_NAME);
    await sendEmail({ to: member.email, subject: message.subject, text: message.text, html: message.html });
  } catch (sendError) {
    console.error("Membership payment emails: member email failed", sendError);
  }

  try {
    const { email: adminEmail } = await getAdminRecipient();
    if (!adminEmail) {
      console.error("Membership payment emails: no admin email to notify");
      return;
    }
    const alert = buildMembershipPaidAlertEmail(member);
    await sendEmail({ to: adminEmail, subject: alert.subject, text: alert.text, html: alert.html });
  } catch (sendError) {
    console.error("Membership payment emails: admin email failed", sendError);
  }
}
