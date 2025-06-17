import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_TO_DB_STATUS } from '../../../../lib/stripe';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
      case 'payment_intent.requires_action':
        await handlePaymentIntentUpdate(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentIntentUpdate(paymentIntent: any) {
  const paymentIntentId = paymentIntent.id;
  const status = paymentIntent.status;
  const paymentMethod = paymentIntent.payment_method?.type || 'card';

  // Find payment in database
  const { data: payment, error: findError } = await supabase
    .from('payments')
    .select('*')
    .eq('reference', paymentIntentId)
    .single();

  if (findError || !payment) {
    console.error('Payment not found for payment intent:', paymentIntentId);
    return;
  }

  // Map Stripe status to database status
  const dbStatus = STRIPE_TO_DB_STATUS[status as keyof typeof STRIPE_TO_DB_STATUS] || 'pending';

  // Update payment status
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      payment_status: dbStatus,
      payment_method: paymentMethod,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  if (updateError) {
    console.error('Error updating payment status:', updateError);
    return;
  }

  // If payment is successful, update booking status
  if (dbStatus === 'paid' && payment.booking_id) {
    await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.booking_id);
  }

  console.log(`Payment ${payment.id} updated to status: ${dbStatus}`);
} 