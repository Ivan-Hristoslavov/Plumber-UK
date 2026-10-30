import { NextRequest, NextResponse } from "next/server";

import { BRAND_NAME } from "@/lib/brand";
import { buildMembershipAlertEmail, buildMembershipReceivedEmail } from "@/lib/email-builders";
import {
  FOUNDING_LIMIT,
  FOUNDING_TERMS_VERSION,
  getFoundingPlan,
} from "@/lib/founding";
import {
  PLACE_TAKING_STATUSES,
  createMembershipsClient,
} from "@/lib/founding-server";
import { rateLimit } from "@/lib/rate-limit";
import { getAdminRecipient, sendEmail } from "@/lib/sendgrid";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Outward code, optional space, inward code: SW16 5HA, sw165ha, E1 6AN.
const UK_POSTCODE_PATTERN = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function normalisePostcode(value: string) {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { limited } = rateLimit(`founding-apply:${ip}`, { maxRequests: 5, windowMs: 10 * 60_000 });
  if (limited) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // A real person never sees or fills this field. Answer as if it worked so a
  // bot learns nothing from the response.
  if (text(body.website, 200) !== "") {
    return NextResponse.json({ success: true });
  }

  const plan = getFoundingPlan(text(body.plan, 20));
  if (!plan) {
    return NextResponse.json({ error: "Please choose a plan." }, { status: 400 });
  }
  if (plan.comingSoon) {
    return NextResponse.json({ error: `${plan.name} is not open for joining yet.` }, { status: 400 });
  }

  const fullName = text(body.fullName, 120);
  const email = text(body.email, 200).toLowerCase();
  const phone = text(body.phone, 40);
  const address = text(body.address, 300);
  const postcodeInput = text(body.postcode, 12);

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }
  if (address.length < 5) {
    return NextResponse.json({ error: "Please enter the address of the property." }, { status: 400 });
  }
  if (!UK_POSTCODE_PATTERN.test(postcodeInput)) {
    return NextResponse.json({ error: "Please enter a valid UK postcode." }, { status: 400 });
  }
  if (body.acceptTerms !== true) {
    return NextResponse.json({ error: "Please accept the membership terms to continue." }, { status: 400 });
  }
  if (body.termsVersion !== FOUNDING_TERMS_VERSION) {
    return NextResponse.json(
      { error: "The membership terms have just been updated. Please reload the page and read them again.", termsChanged: true },
      { status: 409 },
    );
  }

  const supabase = createMembershipsClient();

  // Places go to accepted members only; an open application does not hold one.
  const { count, error: countError } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .in("status", [...PLACE_TAKING_STATUSES]);

  // A missing count is not zero: with the table absent or the query failing,
  // carrying on would skip the limit check entirely.
  if (countError || count === null) {
    console.error("Founding apply: could not count places", countError?.message ?? "no count returned");
    return NextResponse.json(
      { error: "Applications are not available right now. Please try again shortly or call us." },
      { status: 503 },
    );
  }

  if (count >= FOUNDING_LIMIT) {
    return NextResponse.json(
      { error: `All ${FOUNDING_LIMIT} founding places have been taken.`, full: true },
      { status: 409 },
    );
  }

  const record = {
    plan: plan.id,
    // Taken from the published plan, never from the browser.
    monthly_price: plan.price,
    labour_rate: plan.labourRate,
    status: "pending" as const,
    full_name: fullName,
    email,
    phone,
    address,
    postcode: normalisePostcode(postcodeInput),
    marketing_opt_in: body.marketingOptIn === true,
    terms_version: FOUNDING_TERMS_VERSION,
    terms_accepted_at: new Date().toISOString(),
  };

  const { data: membership, error: insertError } = await supabase
    .from("memberships")
    .insert(record)
    .select("id, created_at")
    .single();

  if (insertError) {
    // 23505: the one-open-application-per-email index.
    if (insertError.code === "23505") {
      return NextResponse.json(
        {
          error: "We already have an application or membership for this email address. If you need to change it, please call us.",
          duplicate: true,
        },
        { status: 409 },
      );
    }
    console.error("Founding apply: insert failed", insertError.code, insertError.message);
    return NextResponse.json(
      { error: "We could not save your application. Please try again or call us." },
      { status: 500 },
    );
  }

  // The application is saved; a failed email must not turn that into an error.
  const emailInput = { ...record, id: membership.id, created_at: membership.created_at };

  try {
    const { email: adminEmail } = await getAdminRecipient();
    if (adminEmail) {
      const alert = buildMembershipAlertEmail(emailInput);
      await sendEmail({ to: adminEmail, subject: alert.subject, text: alert.text, html: alert.html });
    } else {
      console.error("Founding apply: no admin email to notify");
    }
  } catch (error) {
    console.error("Founding apply: admin notification failed", error);
  }

  try {
    const received = buildMembershipReceivedEmail(emailInput, BRAND_NAME);
    await sendEmail({ to: email, subject: received.subject, text: received.text, html: received.html });
  } catch (error) {
    console.error("Founding apply: applicant confirmation failed", error);
  }

  return NextResponse.json({ success: true });
}
