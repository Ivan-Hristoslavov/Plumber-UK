import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// Check if Stripe is configured
const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;

// Server-side Stripe instance (only if configured)
export const stripe = isStripeConfigured 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-05-28.basil",
    })
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
