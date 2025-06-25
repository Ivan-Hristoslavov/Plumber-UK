import { NextRequest, NextResponse } from "next/server";

import { supabase } from "../../../../lib/supabase";
import { stripe } from "../../../../lib/stripe";

// GET - Verify payment by session ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Get payment from database
    const { data: payment, error: dbError } = await supabase
      .from("payments")
      .select(
        `
        *,
        customers(name, email),
        bookings(service, date)
      `,
      )
      .eq("reference", sessionId)
      .single();

    if (dbError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Verify with Stripe
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Update payment status if needed
      if (
        session.payment_status === "paid" &&
        payment.payment_status !== "paid"
      ) {
        await supabase
          .from("payments")
          .update({
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        payment.payment_status = "paid";
      }

      return NextResponse.json({
        ...payment,
        stripe_session: {
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency,
        },
        service: payment.bookings?.service,
      });
    } catch (stripeError) {
      console.error("Stripe verification error:", stripeError);

      // Return database payment data even if Stripe verification fails
      return NextResponse.json({
        ...payment,
        service: payment.bookings?.service,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
