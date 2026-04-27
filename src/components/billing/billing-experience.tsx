import Link from "next/link";
import { plans } from "@/lib/plans";
import { Plan } from "@/lib/types";
import { CheckoutButton } from "@/app/billing/checkout-button";
import {
  BriefcaseBusiness,
  Check,
  MessageCircle,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const DISPLAY_NAME: Record<Plan["id"], string> = {
  basic: "Starter",
  pro: "Pro Athlete",
  onboarding: "1:1 Growth Setup",
  elite: "Elite",
};

const PRO_OUTCOMES = [
  "Access higher-paying deals",
  "Unlock premium investing insights",
  "Priority marketplace placement",
  "Advanced deal analytics",
  "Athlete money OS tools",
] as const;

const VALUE_STACK: { line: string }[] = [
  { line: "Daily Play investing signals — $29/mo value" },
  { line: "Premium deal flow — $19/mo value" },
  { line: "Athlete financial education — $15/mo value" },
];

const HERO_BADGES = ["Better deal access", "Investing insights", "Athlete money tools"] as const;

const CONNECTS: {
  title: string;
  body: string;
  href: string;
  icon: typeof BriefcaseBusiness;
}[] = [
  {
    title: "Marketplace",
    body: "Get access to higher-quality business deals and better-matched opportunities.",
    href: "/marketplace",
    icon: BriefcaseBusiness,
  },
  {
    title: "Messaging",
    body: "Close deals faster with better visibility, priority responses, and deal tracking.",
    href: "/messages",
    icon: MessageCircle,
  },
  {
    title: "Investing",
    body: "Turn NIL income into smarter habits with premium education and market signals.",
    href: "/investing",
    icon: TrendingUp,
  },
];

const AFTER_UPGRADE = [
  "Better deals appear in your marketplace",
  "You unlock Pro investing content",
  "You get clearer next moves for earning and growing money",
] as const;

const TRUST_ITEMS = [
  "Cancel anytime",
  "Secure Stripe checkout",
  "No long-term contracts",
  "Educational tools only, not financial advice",
] as const;

function planDisplayName(id: Plan["id"]) {
  return DISPLAY_NAME[id];
}

function successPlanLabel(planId: string | undefined) {
  if (planId === "pro") return "Pro Athlete";
  if (planId === "basic") return "Starter";
  if (planId === "onboarding") return "1:1 Growth Setup";
  if (planId === "elite") return "Elite";
  return planId;
}

const proCtaClassName = [
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-400/50",
  "bg-slate-950 px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_24px_-4px_rgba(184,146,42,0.45),0_8px_20px_-8px_rgba(0,0,0,0.35)]",
  "transition-all duration-200 hover:border-amber-300/70 hover:bg-slate-900 hover:shadow-[0_0_32px_-4px_rgba(184,146,42,0.5)]",
  "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

type BillingExperienceProps = {
  proMember: boolean;
  showSuccess: boolean;
  showCanceled: boolean;
  planFromUrl: string | undefined;
};

export function BillingExperience({ proMember, showSuccess, showCanceled, planFromUrl }: BillingExperienceProps) {
  return (
    <div className="space-y-10 sm:space-y-12 md:space-y-14">
      {showSuccess ? (
        <div
          className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/95 to-white px-4 py-3.5 text-sm text-emerald-900 shadow-sm sm:px-5"
          role="status"
        >
          {planFromUrl
            ? `Thanks — your ${successPlanLabel(planFromUrl)} checkout completed.`
            : "Thanks — your payment was received."}
        </div>
      ) : null}
      {showCanceled ? (
        <div
          className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 text-sm text-amber-950 sm:px-5"
          role="status"
        >
          Checkout was canceled. You can try again when you are ready.
        </div>
      ) : null}

      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[#9B51E0]/20 bg-gradient-to-br from-[var(--surface-elevated)] via-[#0d0f14] to-[var(--surface)] px-5 py-8 shadow-[var(--shadow-md)] sm:px-8 sm:py-10"
        style={{
          backgroundImage:
            "radial-gradient(800px 360px at 12% 0%, rgba(155, 81, 224, 0.12) 0%, transparent 52%), radial-gradient(640px 300px at 100% 100%, rgba(245, 185, 66, 0.08) 0%, transparent 48%)",
        }}
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.26em] text-[#9B51E0]/80">Earning + wealth loop</p>
        <p className="mt-2 inline-flex rounded-full border border-[#F5B942]/35 bg-[#F5B942]/[0.1] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#F5E6B3]">
          Why Pro makes you more money
        </p>
        <h1 className="ui-heading-display mt-2 max-w-2xl text-balance text-slate-100">Turn your influence into income</h1>
        <p className="mt-3 max-w-2xl text-lg font-medium leading-relaxed text-slate-400 sm:text-xl">
          Unlock better deals, premium insights, and the tools to turn athlete income into long-term wealth.
        </p>
        <p className="mt-4 inline-flex max-w-2xl flex-wrap items-center gap-2 rounded-xl border border-[#27AE60]/30 bg-[#27AE60]/[0.08] px-4 py-2.5 text-sm font-semibold text-emerald-200">
          You earned <span className="font-extrabold tabular-nums text-[#F5E6B3]">$500</span> on a single collab → Pro pays for itself
          instantly.
        </p>
        <p className="mt-2 text-sm text-slate-300">Better deals. Faster matching. Higher payouts.</p>
        {proMember ? (
          <p className="mt-5 inline-flex max-w-2xl rounded-xl border border-[#27AE60]/35 bg-[#27AE60]/[0.1] px-4 py-2 text-sm font-medium text-emerald-200">
            You currently have Pro Athlete access — thank you for being a member.
          </p>
        ) : (
          <ul className="mt-6 flex max-w-3xl flex-col gap-2.5 sm:mt-7 sm:grid sm:grid-cols-3 sm:gap-4">
            {HERO_BADGES.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm font-medium text-slate-200 shadow-sm"
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B942]/90" />
                {line}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Plans */}
      <section aria-label="Plans">
        <div className="mb-3 text-center sm:mb-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Plans</h2>
          <p className="mt-2 max-w-2xl mx-auto text-sm text-slate-500">
            Starter for tools + messaging · Pro Athlete for premium deals + investing · Elite for top-tier intros.
          </p>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <a
            href="#plans-compare"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-slate-200 shadow-sm transition hover:border-[#9B51E0]/40"
          >
            Compare plans
          </a>
        </div>
        <div
          id="plans-compare"
          className="grid items-start gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-5 md:pt-1"
        >
          {plans.map((plan) => {
            const isPro = plan.id === "pro";
            const displayName = planDisplayName(plan.id);

            return (
              <article
                key={plan.id}
                className={[
                  "ui-card group relative flex flex-col p-5 transition-all duration-300 sm:p-6",
                  isPro
                    ? "z-10 border-2 border-[#F5B942]/45 bg-gradient-to-b from-[#1a1508]/95 via-[var(--surface-elevated)] to-[var(--surface)] shadow-[0_0_0_1px_rgba(245,185,66,0.15),0_24px_56px_-24px_rgba(0,0,0,0.45)] md:scale-[1.04] md:-translate-y-1.5"
                    : "hover:-translate-y-0.5 hover:border-white/12 hover:shadow-md",
                ].join(" ")}
              >
                {isPro ? (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-[#F5B942]/50 bg-gradient-to-r from-[#2a1f0a] to-[#1a1508] px-3 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#F5E6B3] shadow-sm">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">{displayName}</h3>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[#F5E6B3] sm:text-3xl">{plan.priceLabel}</p>
                {isPro ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#F5B942]/80">Included with Pro</p>
                    <ul className="space-y-1.5 text-sm text-slate-400">
                      {VALUE_STACK.map((row) => (
                        <li
                          key={row.line}
                          className="border-b border-white/8 pb-1.5 text-left last:border-0"
                        >
                          {row.line}
                        </li>
                      ))}
                    </ul>
                    <p className="rounded-lg border border-[#F5B942]/30 bg-[#F5B942]/[0.08] px-3 py-2.5 text-sm font-semibold text-[#F5E6B3]">
                      $63/mo value → {plan.priceLabel}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mt-4 min-h-[2.5rem] text-sm leading-relaxed text-slate-400 sm:min-h-[3rem]">{plan.description}</p>
                    {plan.id === "basic" ? (
                      <ul className="mt-3 space-y-1.5 text-sm font-medium text-slate-300">
                        <li>Messaging with businesses</li>
                        <li>Basic marketplace deals</li>
                      </ul>
                    ) : plan.id === "onboarding" ? (
                      <ul className="mt-3 space-y-1.5 text-sm font-medium text-slate-300">
                        <li>White-glove onboarding</li>
                        <li>Campaign positioning</li>
                      </ul>
                    ) : null}
                  </>
                )}
                {isPro ? (
                  <ul className="mb-1 mt-4 space-y-2.5 text-sm text-slate-300">
                    {PRO_OUTCOMES.map((line) => (
                      <li key={line} className="flex gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B942]/90" aria-hidden />
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-auto w-full pt-5">
                  {plan.id === "basic" ? (
                    <CheckoutButton planId="basic" label="Upgrade now — Starter" />
                  ) : plan.id === "pro" ? (
                    <CheckoutButton planId="pro" label="Upgrade now — Pro" className={proCtaClassName} />
                  ) : (
                    <CheckoutButton planId="onboarding" label="Book 1:1 setup" />
                  )}
                </div>
              </article>
            );
          })}
          <article className="ui-card group relative flex flex-col border-2 border-[#9B51E0]/30 bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] p-5 sm:p-6">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-[#9B51E0]/40 bg-[#9B51E0]/15 px-3 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-violet-200 shadow-sm">
              Top tier
            </span>
            <h3 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">Elite</h3>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#F5E6B3] sm:text-3xl">$79/mo</p>
            <p className="mt-4 min-h-[3.5rem] text-sm leading-relaxed text-slate-400 sm:min-h-[4rem]">
              For athletes ready for high-trust, high-ticket collabs. Upgrade with Stripe — we activate your Elite benefits
              immediately.
            </p>
            <ul className="mb-1 mt-2 space-y-2.5 text-sm text-slate-300">
              {["Top-priority deals in your market", "Verified brand intros", "Direct 1:1 matchmaking"].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9B51E0]/90" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-auto w-full pt-5">
              <CheckoutButton
                planId="elite"
                label="Upgrade now — Elite"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#9B51E0]/50 bg-gradient-to-b from-[#2a1a3a] to-[#0f0a14] px-4 py-3.5 text-sm font-bold text-slate-100 shadow-sm transition hover:border-violet-400/60 hover:shadow-md"
              />
            </div>
          </article>
        </div>
        <p className="mt-2 text-center text-sm text-slate-400">
          <span className="font-semibold text-slate-300">1,200+ athletes</span> used Oppurtunity last month — most upgrades
          happen right after a paid collab hits.
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">
          Starter, Pro, Elite, and 1:1 setup use secure Stripe checkout. Configure <code className="text-slate-400">STRIPE_PRICE_ELITE</code> or{" "}
          <code className="text-slate-400">STRIPE_PAYMENT_LINK_ELITE</code> in the server environment.
        </p>
      </section>

      {/* How Pro connects */}
      <section className="space-y-4 sm:space-y-5" aria-label="How Pro connects">
        <div className="text-center sm:text-left">
          <h2 className="ui-heading-section text-slate-100">How Pro connects everything</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:mx-0 sm:text-left mx-auto">
            Pro helps you earn more through the Marketplace, move deals in Messaging, and grow with Investing — one
            upgrade, one system.
          </p>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {CONNECTS.map(({ title, body, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F5B942]/30 hover:shadow-md active:scale-[0.99] sm:p-6"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#F5B942]/30 bg-white/[0.04] text-[#F5B942] shadow-sm transition-transform group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-base font-bold text-slate-100">{title}</p>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">{body}</p>
              <span className="mt-4 text-xs font-bold text-[#F5B942]/90 group-hover:underline">Open in app →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* What happens after */}
      <section
        className="rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] px-5 py-6 sm:px-8 sm:py-8"
        aria-label="After you upgrade"
      >
        <h2 className="ui-heading-section text-slate-100">What happens after you upgrade?</h2>
        <p className="mt-1 text-sm text-slate-500">A clear path from checkout to more deals and better habits.</p>
        <ol className="mt-6 space-y-3 text-sm text-slate-300 sm:text-[0.95rem]">
          {AFTER_UPGRADE.map((line, i) => (
            <li
              key={line}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#F5B942]/35 bg-[#F5B942]/10 text-sm font-bold text-[#F5E6B3]">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{line}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Trust */}
      <div className="border-t border-white/8 pt-8 sm:pt-10">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((line) => (
            <li
              key={line}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5 text-center text-sm font-medium text-slate-400"
            >
              {line === "Secure Stripe checkout" ? (
                <Shield className="h-4 w-4 shrink-0 text-amber-700" aria-hidden />
              ) : null}
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
