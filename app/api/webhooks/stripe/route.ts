import { NextRequest, NextResponse } from "next/server";

import { stripe, STRIPE_TO_DB_STATUS, isStripeAvailable } from "../../../../lib/stripe";
import { supabase } from "../../../../lib/supabase";

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!isStripeAvailable() || !stripe) {
    return NextResponse.json(
      { error: "Stripe webhooks are not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Allow testing without signature in development
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (!signature && !isDevelopment) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event;

  try {
    if (signature) {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_test",
    );
    } else if (isDevelopment) {
      // For development testing, parse the body directly
      event = JSON.parse(body);
    } else {
      throw new Error("No signature provided");
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);

    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "checkout.session.expired":
        await handleCheckoutSessionExpired(event.data.object);
        break;

      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
      case "payment_intent.requires_action":
        await handlePaymentIntentUpdate(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const sessionId = session.id;
  const paymentStatus = session.payment_status; // 'paid', 'unpaid', 'no_payment_required'
  const paymentIntentId = session.payment_intent;

  console.log(
    `Checkout session completed: ${sessionId}, status: ${paymentStatus}`,
  );

  // Find payment in database by session ID
  const { data: payment, error: findError } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", sessionId)
    .single();

  if (findError || !payment) {
    console.error("Payment not found for checkout session:", sessionId);

    return;
  }

  // Update payment status
  const dbStatus = paymentStatus === "paid" ? "paid" : "failed";

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      payment_status: dbStatus,
      payment_method: "card",
      notes: `Stripe Checkout Session completed: ${sessionId}${paymentIntentId ? ` | Payment Intent: ${paymentIntentId}` : ""}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updateError) {
    console.error("Error updating payment status:", updateError);

    return;
  }

  // If payment is successful and linked to a booking, update booking status
  if (dbStatus === "paid" && payment.booking_id) {
    await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.booking_id);
  }

  console.log(`Payment ${payment.id} updated to status: ${dbStatus}`);
}

async function handleCheckoutSessionExpired(session: any) {
  const sessionId = session.id;

  console.log(`Checkout session expired: ${sessionId}`);

  // Find payment in database by session ID
  const { data: payment, error: findError } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", sessionId)
    .single();

  if (findError || !payment) {
    console.error("Payment not found for expired checkout session:", sessionId);

    return;
  }

  // Update payment status to failed
  const { error: updateError } = await supabase
    .from("payments")
    .update({
      payment_status: "failed",
      notes: `Stripe Checkout Session expired: ${sessionId}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updateError) {
    console.error("Error updating expired payment status:", updateError);

    return;
  }

  console.log(
    `Payment ${payment.id} marked as failed due to session expiration`,
  );
}

async function handlePaymentIntentUpdate(paymentIntent: any) {
  const paymentIntentId = paymentIntent.id;
  const status = paymentIntent.status;
  const paymentMethod = paymentIntent.payment_method?.type || "card";

  // Find payment in database
  const { data: payment, error: findError } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", paymentIntentId)
    .single();

  if (findError || !payment) {
    console.error("Payment not found for payment intent:", paymentIntentId);

    return;
  }

  // Map Stripe status to database status
  const dbStatus =
    STRIPE_TO_DB_STATUS[status as keyof typeof STRIPE_TO_DB_STATUS] ||
    "pending";

  // Update payment status
  const { error: updateError } = await supabase
    .from("payments")
    .update({
      payment_status: dbStatus,
      payment_method: paymentMethod,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updateError) {
    console.error("Error updating payment status:", updateError);

    return;
  }

  // If payment is successful, update booking status
  if (dbStatus === "paid" && payment.booking_id) {
    await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.booking_id);
  }

  console.log(`Payment ${payment.id} updated to status: ${dbStatus}`);
}
