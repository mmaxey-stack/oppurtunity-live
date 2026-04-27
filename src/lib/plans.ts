import { Plan } from "@/lib/types";

/**
 * Public Stripe Payment Links (Dashboard → Product catalog → Payment links).
 * Override with STRIPE_PAYMENT_LINK_BASIC / _PRO / _ONBOARDING in `.env.local` if they change.
 */
export const STRIPE_PAYMENT_LINK_DEFAULTS: Partial<Record<Plan["id"], string>> = {
  basic: "https://buy.stripe.com/28E4gtgbOf9K7KV5FHdIA00",
  pro: "https://buy.stripe.com/bJebIV7Fi1iU5CN8RTdIA01",
  onboarding: "https://buy.stripe.com/cNi6oB5xa0eQd5f6JLdIA02",
  elite: undefined,
};

/** Returns a payment link URL when configured, or `undefined` to fall back to Checkout Sessions + price IDs. */
export function resolveStripePaymentLink(planId: Plan["id"]): string | undefined {
  const fromEnv =
    planId === "basic"
      ? process.env.STRIPE_PAYMENT_LINK_BASIC
      : planId === "pro"
        ? process.env.STRIPE_PAYMENT_LINK_PRO
        : planId === "elite"
          ? process.env.STRIPE_PAYMENT_LINK_ELITE
          : process.env.STRIPE_PAYMENT_LINK_ONBOARDING;
  if (fromEnv) return fromEnv;
  return STRIPE_PAYMENT_LINK_DEFAULTS[planId];
}

export const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    priceLabel: "$9/month",
    description: "Post deals, message users, and manage campaign operations.",
    stripePriceEnv: "STRIPE_PRICE_BASIC",
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$24.99/month",
    description: "Unlock premium investing insights, deeper analytics, and top-tier deal access.",
    stripePriceEnv: "STRIPE_PRICE_PRO",
  },
  {
    id: "onboarding",
    name: "Onboarding Call",
    priceLabel: "$100 one-time",
    description: "Get a guided 1:1 campaign setup session with our growth team.",
    stripePriceEnv: "STRIPE_PRICE_ONBOARDING",
  },
];