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

      let booking = null
      if (booking_id) {
        const { data: bookingData } = await supabase
        .from('bookings')
        .select('service, date')
        .eq('id', booking_id)
        .single()
        booking = bookingData
      }

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      // Create payment record in database first
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          booking_id: booking_id || null,
          customer_id,
          amount,
          payment_method: 'card',
          payment_status: 'pending',
          payment_date: new Date().toISOString().split('T')[0],
          reference: null, // Will be updated with session ID
          notes: 'Stripe Checkout Session created',
        }])
        .select()
        .single()

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
        return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
      }

      // Create Stripe Checkout Session
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const productName = description || (booking ? `Payment for ${booking.service}` : 'Service Payment')
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: productName,
              description: booking ? `Service: ${booking.service} | Date: ${booking.date}` : 'Payment for services',
            },
            unit_amount: Math.round(amount * 100), // Convert to pence
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel?payment_id=${payment.id}`,
        customer_email: customer.email,
        metadata: {
          customer_id,
          booking_id: booking_id || '',
          payment_id: payment.id,
          customer_name: customer.name,
        },
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expires in 24 hours
      })

      // Update payment record with session ID
      await supabase
        .from('payments')
        .update({
          reference: session.id,
          notes: `Stripe Checkout Session: ${session.id}`,
        })
        .eq('id', payment.id)

      return NextResponse.json({
        payment: { ...payment, reference: session.id },
        checkout_url: session.url,
        session_id: session.id,
        expires_at: session.expires_at,
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
    const { session_id, payment_intent_id, status, payment_method } = body

    let payment = null

    // Find payment by session ID or payment intent ID
    if (session_id) {
      const { data: paymentData, error: findError } = await supabase
        .from('payments')
        .select('*')
        .eq('reference', session_id)
        .single()
      
      if (!findError && paymentData) {
        payment = paymentData
      }
    } else if (payment_intent_id) {
      const { data: paymentData, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', payment_intent_id)
      .single()

      if (!findError && paymentData) {
        payment = paymentData
      }
    }

    if (!payment) {
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