import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getStripeClient } from "@/lib/stripe";
import type { SubscriptionPlan } from "@/lib/types";

export const runtime = "nodejs";

function planFromMetadata(
  meta: Stripe.Metadata | null,
  mode: string,
): SubscriptionPlan | null {
  const p = meta?.plan;
  if (p === "basic" || p === "pro" || p === "elite") return p;
  if (mode === "payment" && meta?.plan === "onboarding") return null;
  return null;
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !whSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured." }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id ?? session.client_reference_id ?? null;
    const plan = planFromMetadata(session.metadata, session.mode ?? "");

    const admin = getSupabaseServiceClient();
    if (userId && plan && admin) {
      await admin.from("users").update({ subscription_plan: plan }).eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
