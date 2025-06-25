import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

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
