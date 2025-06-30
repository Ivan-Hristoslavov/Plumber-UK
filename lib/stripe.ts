import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// Check if Stripe is configured
const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Server-side Stripe instance (only if configured)
export const stripe = isStripeConfigured 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!)
  : null;

// Client-side Stripe instance
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn("Stripe not configured - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY missing");
    return null;
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Helper to check if Stripe is available
export const isStripeAvailable = () => isStripeConfigured;

// Payment status mapping
export const STRIPE_TO_DB_STATUS = {
  requires_payment_method: "pending",
  requires_confirmation: "pending",
  requires_action: "pending",
  processing: "pending",
  succeeded: "paid",
  canceled: "failed",
  requires_capture: "pending",
} as const;

// Payment method mapping
export const STRIPE_TO_DB_METHOD = {
  card: "card",
  bank_transfer: "bank_transfer",
  cash: "cash",
} as const;

// Helper function to create payment links with different currencies
export const createPaymentLink = async (params: {
  amount: number;
  currency?: string;
  description: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) => {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const { amount, currency = "gbp", description, customerEmail, metadata = {} } = params;

  // First create a product
  const product = await stripe.products.create({
    name: description,
  });

  // Then create a price for that product
  const price = await stripe.prices.create({
    unit_amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    product: product.id,
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      ...metadata,
      created_at: new Date().toISOString(),
    },
    ...(customerEmail && { 
      automatic_tax: { enabled: false },
      customer_creation: "always"
    }),
  });

  return paymentLink;
};

// Helper function to create checkout sessions with different currencies
export const createCheckoutSession = async (params: {
  amount: number;
  currency?: string;
  description: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) => {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const { 
    amount, 
    currency = "gbp", 
    description, 
    customerEmail, 
    successUrl, 
    cancelUrl, 
    metadata = {} 
  } = params;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: description,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...(customerEmail && { customer_email: customerEmail }),
    metadata: {
      ...metadata,
      created_at: new Date().toISOString(),
    },
    expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  });

  return session;
};
