import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { stripe, STRIPE_TO_DB_STATUS } from '../../../lib/stripe'

// GET - Fetch all payments
export async function GET() {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        customers!inner(name, email),
        bookings(service, date, customer_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new payment or payment intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...paymentData } = body

    if (type === 'create_payment_link') {
      // Create Stripe payment link
      const { customer_id, booking_id, amount, description } = paymentData

      // Get customer and booking details
      const { data: customer } = await supabase
        .from('customers')
        .select('name, email')
        .eq('id', customer_id)
        .single()

      const { data: booking } = await supabase
        .from('bookings')
        .select('service, date')
        .eq('id', booking_id)
        .single()

      if (!customer || !booking) {
        return NextResponse.json({ error: 'Customer or booking not found' }, { status: 404 })
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'gbp',
        metadata: {
          customer_id,
          booking_id,
          customer_name: customer.name,
          service: booking.service,
        },
        description: description || `Payment for ${booking.service} - ${customer.name}`,
      })

      // Create payment record in database
      const { data: payment, error } = await supabase
        .from('payments')
        .insert([{
          booking_id,
          customer_id,
          amount,
          payment_method: 'card',
          payment_status: 'pending',
          payment_date: new Date().toISOString().split('T')[0],
          reference: paymentIntent.id,
          notes: `Stripe Payment Intent: ${paymentIntent.id}`,
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating payment record:', error)
        return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
      }

      return NextResponse.json({
        payment,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      }, { status: 201 })

    } else {
      // Create regular payment record
      const paymentRecord = {
        ...paymentData,
        payment_status: paymentData.payment_status || 'paid', // Default to paid for manual payments
      }

      const { data: payment, error } = await supabase
        .from('payments')
        .insert([paymentRecord])
        .select()
        .single()

      if (error) {
        console.error('Error creating payment:', error)
        return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
      }

      return NextResponse.json({ payment }, { status: 201 })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update payment status (usually called by webhooks)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { payment_intent_id, status, payment_method } = body

    // Find payment by Stripe reference
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', payment_intent_id)
      .single()

    if (findError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment status
    const dbStatus = STRIPE_TO_DB_STATUS[status as keyof typeof STRIPE_TO_DB_STATUS] || 'pending'
    
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        payment_status: dbStatus,
        payment_method: payment_method || payment.payment_method,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating payment:', updateError)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    return NextResponse.json({ payment: updatedPayment })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 