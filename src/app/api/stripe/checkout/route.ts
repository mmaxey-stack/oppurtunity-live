import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { plans, resolveStripePaymentLink } from "@/lib/plans";
import { getStripeClient } from "@/lib/stripe";
import { appendPaymentLinkContext } from "@/lib/stripe/payment-link";

const planToEnvKey: Record<"basic" | "pro" | "onboarding" | "elite", string> = {
  ...(Object.fromEntries(plans.map((plan) => [plan.id, plan.stripePriceEnv])) as Record<
    "basic" | "pro" | "onboarding",
    string
  >),
  elite: "STRIPE_PRICE_ELITE",
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { planId?: "basic" | "pro" | "onboarding" | "elite" };

  if (!body.planId || !(body.planId in planToEnvKey)) {
    return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Sign in required to checkout." }, { status: 401 });
  }

  const userId = authUser.id;
  const email = authUser.email ?? null;

  const paymentLinkUrl = resolveStripePaymentLink(body.planId);
  if (paymentLinkUrl) {
    return NextResponse.json({ url: appendPaymentLinkContext(paymentLinkUrl, userId, email) });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY. Add environment variables and retry." },
      { status: 500 },
    );
  }

  const priceId = process.env[planToEnvKey[body.planId]];
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing ${planToEnvKey[body.planId]} in environment variables.` },
      { status: 500 },
    );
  }

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: body.planId === "onboarding" ? "payment" : "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    customer_email: email ?? undefined,
    success_url: `${origin}/billing?success=true&plan=${body.planId}`,
    cancel_url: `${origin}/billing?canceled=true&plan=${body.planId}`,
    metadata: {
      app: "oppurtunity",
      plan: body.planId,
      supabase_user_id: userId,
    },
  });

  return NextResponse.json({ url: session.url });
}
