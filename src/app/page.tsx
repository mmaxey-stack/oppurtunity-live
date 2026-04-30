import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  ChartSpline,
  CircleDollarSign,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PremiumAthleteHome } from "@/components/dashboard/premium-athlete-home";
import { AnimatedCurrency } from "@/components/dashboard/animated-currency";
import { AnimatedInteger } from "@/components/dashboard/animated-integer";
import { DailyActionChecklist } from "@/components/dashboard/daily-action-checklist";
import { DailyMoneyLoop } from "@/components/dashboard/daily-money-loop";
import { HomeFeaturedAlleyMacSection } from "@/components/dashboard/home-featured-alley-mac";
import { SpotlightDealCard } from "@/components/dashboard/spotlight-deal-card";
import { mapMockToDisplay } from "@/components/marketplace/map-deals";
import { getAthleteHomeSpotlightWithFallback } from "@/lib/athlete-demo-spotlight";
import { personalizeAlleyMacForAthlete } from "@/lib/alley-mac-personalize";
import { ALLEY_MAC_DEAL_KEY } from "@/lib/marketplace-premium-types";
import { MOCK_MARKETPLACE_DEALS } from "@/lib/marketplace-mock-deals";
import { TodaySection, type NextBestAction, type TodayAction } from "@/components/dashboard/today-section";
import { BusinessStatCards } from "@/components/business-stat-cards";
import { BusinessCampaignPerformance } from "@/components/business/business-campaign-performance";
import { BusinessQuickActions } from "@/components/business/business-quick-actions";
import { BusinessTopAthletes } from "@/components/business/business-top-athletes";
import { BusinessGrowthTools } from "@/components/business-growth-tools";
import { GrowthLoopPanel } from "@/components/growth/growth-loop-panel";
import { AthleteRetentionSystem } from "@/components/retention/athlete-retention-system";
import { Panel, StatCard } from "@/components/cards";
import { ScrollReveal } from "@/components/scroll-reveal";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";
import { redirect } from "next/navigation";

function firstName(full: string) {
  const p = full.trim().split(/\s+/)[0];
  return p || "there";
}

function profileStrength(user: { full_name: string; email: string }, activeDeals: number, messageCount: number) {
  let s = 35;
  if (user.full_name && user.full_name.trim().length > 2) s += 20;
  if (user.email) s += 10;
  if (activeDeals > 0) s += 20;
  if (messageCount > 0) s += 15;
  return Math.min(100, s);
}

function trendFromSeed(base: number, mod: number) {
  return Math.min(28, 4 + (base % 5) * 2 + (mod % 4));
}

export default async function Home() {
  const { supabase, user } = await requireCurrentUser();
  const role = user.role;
  if (role === "investor") redirect("/investor");
  const proMember = isProMember(user);
  const fn = firstName(user.full_name);

  const alleyMacSource = MOCK_MARKETPLACE_DEALS.find((d) => d.id === ALLEY_MAC_DEAL_KEY);
  const alleyMacDisplay =
    role === "athlete" && alleyMacSource
      ? mapMockToDisplay(personalizeAlleyMacForAthlete(alleyMacSource, fn, user.id))
      : null;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoIso = weekAgo.toISOString();

  const { data: spotlightDeals } = await supabase
    .from("deals")
    .select("id, title, business_id, athlete_id, payout, sport, location, summary, status, created_at")
    .eq("status", "open")
    .is("athlete_id", null)
    .order("created_at", { ascending: false })
    .limit(2);

  const businessIds = Array.from(new Set((spotlightDeals ?? []).map((deal) => deal.business_id)));
  const { data: businesses } = await supabase
    .from("users")
    .select("id, full_name")
    .in("id", businessIds.length ? businessIds : ["00000000-0000-0000-0000-000000000000"]);
  const businessMap = new Map((businesses ?? []).map((business) => [business.id, business.full_name]));

  const hasAthleteDbSpotlight = role === "athlete" && (spotlightDeals ?? []).length > 0;

  const { count: activeDealsCount } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .or(role === "athlete" ? `athlete_id.eq.${user.id}` : `business_id.eq.${user.id}`)
    .in("status", ["open", "accepted"]);

  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  const { count: totalMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("read_by_receiver", false);

  const { count: inboundMessagesWeek } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .gte("created_at", weekAgoIso);

  const totalEarnings =
    role === "athlete" ? user.earnings_total : 0;
  const { data: bizAccepted } =
    role === "business"
      ? await supabase
          .from("deals")
          .select("payout")
          .eq("business_id", user.id)
          .eq("status", "accepted")
      : { data: null };

  const businessCommitted = (bizAccepted ?? []).reduce((sum, row) => sum + Number(row.payout), 0);
  const displayEarnings = role === "athlete" ? totalEarnings : businessCommitted;

  const { count: openMarketCount } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("status", "open")
    .is("athlete_id", null);

  const { count: myOpenListings } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("business_id", user.id)
    .eq("status", "open");

  const pScore = Math.min(100, user.profile_strength || profileStrength(user, activeDealsCount ?? 0, totalMessages ?? 0));
  const earningsTrend = `+$${Math.min(4200, Math.max(0, Math.round(displayEarnings * 0.08) + 120))} this week`;
  const eTrendPct = `+${trendFromSeed(activeDealsCount ?? 0, unreadNotifications ?? 0)}% vs last week`;

  const stats =
    role === "athlete"
      ? [
          {
            label: "Total Earnings",
            value: <AnimatedCurrency value={`$${Math.round(displayEarnings).toLocaleString()}`} />,
            trendLabel: earningsTrend,
            helper: "Paid earnings from completed deals (tracked in your profile).",
            icon: CircleDollarSign,
            accentClass: "from-[#F5B942]/35 to-[#F5B942]/10 text-amber-100",
          },
          {
            label: "Active Deals",
            value: <AnimatedInteger value={activeDealsCount ?? 0} />,
            trendLabel: eTrendPct,
            helper: "Deals in motion — follow up in messages to keep conversion high.",
            icon: BriefcaseBusiness,
            accentClass: "from-[#F5B942]/30 to-[#F2994A]/15 text-amber-100",
          },
          {
            label: "Unread Alerts",
            value: <AnimatedInteger value={unreadNotifications ?? 0} />,
            trendLabel:
              (unreadNotifications ?? 0) > 0 ? "Needs attention" : "Inbox is clean",
            helper: "Time-sensitive: payouts, offers, and platform signals land here first.",
            icon: BellRing,
            accentClass: "from-[#F2994A]/25 to-[#F5B942]/12 text-amber-100",
          },
          {
            label: "Unread messages",
            value: <AnimatedInteger value={unreadMessages ?? 0} />,
            trendLabel:
              (inboundMessagesWeek ?? 0) > 0
                ? `${inboundMessagesWeek} inbound (7d)`
                : (totalMessages ?? 0) > 0
                  ? "Threads open"
                  : "Message to create momentum",
            helper: "Unreads are money on the table — fast replies protect your win rate.",
            icon: UserRoundCheck,
            accentClass: "from-[#4A90E2]/30 to-[#4A90E2]/8 text-sky-100",
          },
        ]
      : [
          {
            label: "Active Spend",
            value: <AnimatedCurrency value={`$${Math.round(displayEarnings).toLocaleString()}`} />,
            trendLabel: earningsTrend,
            helper: "What you have committed to accepted campaigns.",
            icon: CircleDollarSign,
            accentClass: "from-[#F5B942]/35 to-[#F5B942]/10 text-amber-100",
          },
          {
            label: "Live Deals",
            value: <AnimatedInteger value={activeDealsCount ?? 0} />,
            trendLabel: eTrendPct,
            helper: "Open and accepted work — nudge message threads to close the loop.",
            icon: BriefcaseBusiness,
            accentClass: "from-[#F5B942]/30 to-[#F2994A]/15 text-amber-100",
          },
          {
            label: "Unread Alerts",
            value: <AnimatedInteger value={unreadNotifications ?? 0} />,
            trendLabel:
              (unreadNotifications ?? 0) > 0 ? "Action needed" : "All caught up",
            helper: "Campaign, payout, and system alerts in one place.",
            icon: BellRing,
            accentClass: "from-[#F2994A]/25 to-[#F5B942]/12 text-amber-100",
          },
          {
            label: "Athlete Responses",
            value: <AnimatedInteger value={totalMessages ?? 0} />,
            trendLabel: (inboundMessagesWeek ?? 0) > 0 ? "Reply while interest is hot" : "No pending athlete DMs (7d)",
            helper: "Two-way thread activity — high response rate wins campaigns.",
            icon: UserRoundCheck,
            accentClass: "from-[#4A90E2]/30 to-[#4A90E2]/8 text-sky-100",
          },
        ];

  const businessStats = [
    {
      label: "Active Spend",
      value: `$${Math.round(displayEarnings).toLocaleString()}`,
      helper: "Accepted deal commitments",
      iconName: "dollar" as const,
      accentClass: "from-[#F5B942]/35 to-[#F5B942]/10 text-amber-100",
    },
    {
      label: "Live Deals",
      value: String(activeDealsCount ?? 0),
      helper: "Open and accepted campaigns",
      iconName: "briefcase" as const,
      accentClass: "from-[#F5B942]/30 to-[#F2994A]/15 text-amber-100",
    },
    {
      label: "Unread Alerts",
      value: String(unreadNotifications ?? 0),
      helper: "Campaign and inbox events",
      iconName: "bell" as const,
      accentClass: "from-[#F2994A]/25 to-[#F5B942]/12 text-amber-100",
    },
    {
      label: "Athlete Responses",
      value: String(totalMessages ?? 0),
      helper: "Current message activity",
      iconName: "user" as const,
      accentClass: "from-[#4A90E2]/30 to-[#4A90E2]/8 text-sky-100",
    },
  ];

  let todayFocus: string;
  let todaySub: string;
  let todayActions: TodayAction[];
  let nextBestAction: NextBestAction;

  if (role === "athlete") {
    if (pScore < 72) {
      todayFocus = "lock in a stronger profile before you miss matches.";
      todaySub =
        "Deals are ranked. Brands see incomplete profiles as higher risk — finish the basics to unlock the full feed.";
    } else if ((openMarketCount ?? 0) > 0 && (spotlightDeals ?? []).length > 0) {
      todayFocus = `you have live opportunities to review (${openMarketCount} open in the market).`;
      todaySub = "A quick apply or message today keeps you in the money window for this week.";
    } else {
      todayFocus = "build pipeline: browse new campaigns and message 1–2 brands you like.";
      todaySub = "Revenue is a follow-up sport. A short, specific DM beats a generic pitch every time.";
    }
    todayActions = [
      { id: "1", label: "Review best-fit opportunities", href: "/marketplace", kind: "primary" },
      { id: "2", label: "Tighten your profile for trust", href: "/profile", kind: "default" },
      { id: "3", label: "Reply in messages", href: "/messages", kind: "default" },
    ];
    nextBestAction =
      (openMarketCount ?? 0) > 0
        ? {
            label: "Accept one live deal (+$75 target)",
            href: "/marketplace",
            hint: "Fast accepts increase your ranking for higher-paying deals.",
          }
        : {
            label: "Reply to your warmest message thread",
            href: "/messages",
            hint: "Response speed is the fastest way to unlock repeat campaigns.",
          };
  } else {
    if ((myOpenListings ?? 0) > 0) {
      todayFocus = "you have open listings — nudge athletes in messages to convert.";
      todaySub = "Stalled threads lose to faster brands. A single follow-up can unlock your next partner.";
    } else {
      todayFocus = "time to list a new campaign or scout athletes in the marketplace.";
      todaySub = "Visibility + outreach = deal flow. Post a clear payout and a crisp brief.";
    }
    todayActions = [
      { id: "1", label: "Post or refresh a deal", href: "/marketplace", kind: "primary" },
      { id: "2", label: "Message your pipeline", href: "/messages", kind: "default" },
      { id: "3", label: "Check billing + Pro tools", href: "/billing", kind: "default" },
    ];
    nextBestAction =
      (myOpenListings ?? 0) > 0
        ? {
            label: "Message top athletes on your open campaign",
            href: "/messages",
            hint: "Brands that follow up today see faster accept rates this week.",
          }
        : {
            label: "Post a new deal to start deal flow",
            href: "/marketplace#post-deal",
            hint: "The marketplace rewards fresh listings with immediate visibility.",
          };
  }

  const statusLine: { label: string; value: string; tone: "ok" | "warn" }[] = [
    {
      label: "Profile strength",
      value: `${pScore}% complete`,
      tone: pScore < 70 ? "warn" : "ok",
    },
    {
      label: "Deals in motion",
      value: `${activeDealsCount ?? 0} active`,
      tone: "ok",
    },
    {
      label: "Notifications",
      value: (unreadNotifications ?? 0) > 0 ? "Unread" : "Clear",
      tone: (unreadNotifications ?? 0) > 0 ? "warn" : "ok",
    },
  ];

  const businessCampaign =
    role === "business"
      ? {
          activeAthletes: Math.max(5, 2 * (activeDealsCount ?? 0) + 2),
          estimatedReach: 8900 + (myOpenListings ?? 0) * 1200,
          footTraffic: 22 + (activeDealsCount ?? 0) * 3,
          revenueEstimate: 640 + (activeDealsCount ?? 0) * 140,
          roiLow: 240 + (myOpenListings ?? 0) * 30,
          roiHigh: 720 + (activeDealsCount ?? 0) * 85,
        }
      : null;
  const momentumScore =
    role === "athlete"
      ? Math.max(35, Math.min(98, 52 + (activeDealsCount ?? 0) * 5 + (inboundMessagesWeek ?? 0) * 3))
      : Math.max(40, Math.min(98, 50 + (myOpenListings ?? 0) * 6 + (inboundMessagesWeek ?? 0) * 2));

  const athleteActiveDeals = ((spotlightDeals ?? []).length > 0
    ? (spotlightDeals ?? []).map((deal) => ({
        id: deal.id,
        title: deal.title,
        businessName: businessMap.get(deal.business_id) ?? "Business",
        location: deal.location ?? "Local",
        payout: `$${Number(deal.payout).toLocaleString()}`,
        href: `/marketplace#deal-${deal.id}`,
        status: deal.status === "accepted" ? "Accepted" : "Pending",
      }))
    : getAthleteHomeSpotlightWithFallback().map((deal) => ({
        id: deal.id,
        title: deal.title,
        businessName: deal.businessName,
        location: deal.location,
        payout: deal.payoutLabel,
        href: `/marketplace#deal-${deal.id}`,
        status: "Applied",
      }))).slice(0, 3);

  const athleteMessages = [
    "Alley Mac: Perfect post, looks great.",
    "Coffee Shop: Can you post the story today?",
    "Mezeh Grill: Deal confirmed. Thanks.",
  ];

  if (role === "athlete") {
    return (
      <AppShell role={role} userName={user.full_name} userEmail={user.email} proMember={proMember}>
        <div className="space-y-5 px-2 pb-6 pt-2 sm:px-3 md:px-4">
          <PremiumAthleteHome
            firstName={fn}
            totalEarnings={displayEarnings}
            earningsTrendPct={eTrendPct}
            activeDealsCount={activeDealsCount ?? 0}
            unreadMessages={unreadMessages ?? 0}
            profileStrength={pScore}
            activeDeals={athleteActiveDeals}
            messageItems={athleteMessages}
          />
          <ScrollReveal delayMs={64}>
            <DailyActionChecklist />
          </ScrollReveal>
          <ScrollReveal delayMs={66}>
            <AthleteRetentionSystem userId={user.id} />
          </ScrollReveal>
          <ScrollReveal delayMs={68}>
            <DailyMoneyLoop
              firstName={fn}
              earnToday={Math.max(
                0,
                Math.round(Number(displayEarnings) * 0.04) + (activeDealsCount ?? 0) * 45 + (unreadMessages ?? 0) * 8,
              )}
              activeDeals={activeDealsCount ?? 0}
              newOpp={Math.max(0, (openMarketCount ?? 0) + (activeDealsCount ?? 0) * 2 + 1)}
              unreadMessages={unreadMessages ?? 0}
            />
          </ScrollReveal>
          <ScrollReveal delayMs={70}>
            <GrowthLoopPanel role={role} userId={user.id} profileEarningsTotal={user.earnings_total} />
          </ScrollReveal>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role={role} userName={user.full_name} userEmail={user.email} proMember={proMember}>
      {role === "business" && businessCampaign ? (
        <ScrollReveal>
          <BusinessCampaignPerformance
            activeAthletes={businessCampaign.activeAthletes}
            estimatedReach={businessCampaign.estimatedReach}
            footTraffic={businessCampaign.footTraffic}
            revenueEstimate={businessCampaign.revenueEstimate}
            roiLow={businessCampaign.roiLow}
            roiHigh={businessCampaign.roiHigh}
          />
        </ScrollReveal>
      ) : null}
      {role === "business" ? (
        <ScrollReveal delayMs={6}>
          <BusinessQuickActions />
        </ScrollReveal>
      ) : null}
      <ScrollReveal>
        <TodaySection
          greetingName={fn}
          focus={todayFocus}
          subline={todaySub}
          profilePercent={pScore}
          statusLine={statusLine}
          actions={todayActions}
          openOpportunities={openMarketCount ?? 0}
          dealsPending={activeDealsCount ?? 0}
          messageNudge={inboundMessagesWeek ?? 0}
          nextBestAction={nextBestAction}
          momentumScore={momentumScore}
        />
      </ScrollReveal>
      {role === "athlete" ? (
        <ScrollReveal delayMs={4}>
          <section className="grid gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} style={{ animationDelay: `${i * 55}ms` }} className="stagger-fade">
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  helper={stat.helper}
                  trendLabel={stat.trendLabel}
                  icon={stat.icon}
                  accentClass={stat.accentClass}
                />
              </div>
            ))}
          </section>
        </ScrollReveal>
      ) : null}

      {role === "athlete" && alleyMacDisplay ? (
        <ScrollReveal delayMs={8}>
          <div className="ui-surface px-4 py-5 sm:px-6 sm:py-6">
            <HomeFeaturedAlleyMacSection deal={alleyMacDisplay} userId={user.id} userFullName={user.full_name} />
          </div>
        </ScrollReveal>
      ) : null}

      {role === "business" ? (
        <ScrollReveal delayMs={40}>
          <BusinessStatCards stats={businessStats} />
        </ScrollReveal>
      ) : null}
      {role === "business" ? (
        <ScrollReveal delayMs={44}>
          <BusinessTopAthletes />
        </ScrollReveal>
      ) : null}

      <ScrollReveal delayMs={50}>
        <Panel
          tint={role === "athlete" ? "marketplace" : undefined}
          title={role === "athlete" ? "Featured opportunities" : "Top athletes to invite"}
          description={
            role === "athlete"
              ? hasAthleteDbSpotlight
                ? "Live open roles in the market — act while brands are still booking. Your Alley Mac featured deal is above."
                : "More local picks below the featured Alley Mac card — tap through to open each deal."
              : "Recruit with momentum: prioritize athletes with tight audiences that match your locations."
          }
          action={
            <Link href="/marketplace" className="btn-secondary">
              Open marketplace
            </Link>
          }
        >
          {(spotlightDeals ?? []).length > 0 ? (
            <div className="space-y-4">
              {role === "athlete" && (spotlightDeals ?? []).length > 0 ? (
                <p className="text-sm font-medium text-[#F5E0A8]/95">
                  {openMarketCount ?? 0} open roles in the market — act while brands are still booking.
                </p>
              ) : null}
              {(spotlightDeals ?? []).map((deal, index) => {
                const businessName = businessMap.get(deal.business_id);
                return (
                  <SpotlightDealCard
                    key={deal.id}
                    id={deal.id}
                    index={index}
                    title={deal.title}
                    businessName={businessName ?? "Business"}
                    location={deal.location}
                    sport={deal.sport}
                    payout={String(deal.payout)}
                  />
                );
              })}
            </div>
          ) : role === "athlete" ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#F5E0A8]/95">
                {openMarketCount ?? 0} open roles in the market — gym and coffee demos below. Tap a card for the full
                deal and message thread.
              </p>
              {getAthleteHomeSpotlightWithFallback().map((deal, index) => (
                <SpotlightDealCard
                  key={deal.id}
                  id={deal.id}
                  index={index}
                  title={deal.title}
                  businessName={deal.businessName}
                  location={deal.location}
                  sport={deal.category}
                  payout={deal.payoutLabel}
                  detailHref={`/marketplace#deal-${deal.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center sm:py-14">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5B942]/25 to-[#4A90E2]/20 ring-1 ring-white/10">
                <Sparkles className="h-6 w-6 text-amber-100" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-100">You are one move away from fresh deals</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                List a short, high-trust offer with a clear payout — that is the unlock for athlete matches in your market.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Link href="/profile" className="btn-secondary">
                  Complete profile
                </Link>
                <Link href="/marketplace" className="btn-primary">
                  Browse marketplace
                </Link>
              </div>
            </div>
          )}
        </Panel>
      </ScrollReveal>

      <div className="ui-surface px-4 py-3.5 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Weekly pulse</p>
        <p className="mt-1 text-sm font-medium text-slate-300">
          {role === "athlete" ? (
            <>
              You gained <span className="text-[#F5B942]">+{Math.min(12, (openMarketCount ?? 0) + 2)}</span> net-new
              opportunities in view, and your profile is trending{" "}
              <span className="font-semibold text-emerald-400/95">+{Math.max(3, 18 - pScore / 6)}%</span> vs a weak baseline
              for athletes who do not check in.
            </>
          ) : (
            <>
              Your pipeline has <span className="font-semibold text-slate-100">{activeDealsCount ?? 0}</span> live deals
              and <span className="font-semibold text-slate-100">{myOpenListings ?? 0}</span> open listings. Brands that
              message daily see faster athlete acceptance.
            </>
          )}
        </p>
      </div>

      <ScrollReveal delayMs={60}>
        <section className="grid gap-5 sm:gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
          <Panel
            id={role === "business" ? "business-analytics" : undefined}
            title={role === "athlete" ? "Earnings lift (this week)" : "Campaign revenue trend"}
            description="A fast visual of momentum — the slope matters more than any single day."
            action={
              <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-500">
                This week · <span className="ml-1 text-emerald-400/90">+18% vs prior</span>
              </span>
            }
          >
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <ChartSpline className="h-4 w-4 text-[#27AE60]/80" />
                  <span className="text-sm font-medium text-slate-200">Performance</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400/90">Climbing</span>
              </div>
              <div className="h-44 rounded-xl bg-gradient-to-br from-[#F5B942]/[0.12] via-[var(--surface)] to-[#27AE60]/[0.08] p-4 ring-1 ring-white/6">
                <div className="flex h-full items-end gap-2 sm:gap-3">
                  {[30, 38, 35, 49, 58, 62, 70].map((point, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-md bg-gradient-to-t from-slate-800 to-slate-600 transition-all duration-500"
                      style={{ height: `${point}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            title={role === "athlete" ? "Where the money is clustering" : "Live opportunity feed"}
            description={
              role === "athlete"
                ? "These are the categories where athletes in your position are getting paid the fastest right now — bias your outreach here first."
                : "Signals you can act on in the next hour — nudges, matches, and campaign motion."
            }
          >
            <div className="space-y-3">
              {(role === "athlete"
                ? ["Fitness & gym", "Coffee & local", "Social promo", "Local growth"]
                : [
                    "Hey — I can bring 80+ people to your event this Friday. I will post on IG + TikTok.",
                    "New athlete match available — 12.4K followers",
                    "Your deal is trending — 12 athletes viewed it",
                    "DJ night promo @ Nut house — Payout: $500 — Austin, TX",
                  ]
              ).map((item, index) => (
                <div
                  key={item}
                  className="ui-card-interactive flex items-center justify-between gap-3 rounded-xl border-white/8 bg-white/[0.04] px-3 py-3.5 sm:px-4"
                >
                  <p className="min-w-0 text-sm font-medium text-slate-300">{item}</p>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-100">
                    {Math.max(0, 42 - index * 7)}% · up
                  </p>
                </div>
              ))}
              <div className="mt-1 rounded-xl bg-gradient-to-r from-[#1a1508] via-[#2a2010] to-[#F5B942]/25 p-4 text-amber-50 shadow-md ring-1 ring-[#F5B942]/25">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5B942]/80">Daily play</p>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-100/95">
                  {proMember
                    ? "Short-form event promos are converting 1.8x this week — if you are not testing one, you are leaving money on the table."
                    : "Pro unlocks daily market plays, tighter benchmarks, and faster comp intel — worth it if you treat NIL like a business."}
                </p>
                <Link
                  href="/investing"
                  className="mt-3 inline-flex text-xs font-bold text-[#F5E6B3] underline-offset-2 hover:underline"
                >
                  {proMember ? "Open investing hub" : "See what Pro includes"}
                </Link>
              </div>
            </div>
          </Panel>
        </section>
      </ScrollReveal>

      {role === "athlete" ? (
        <ScrollReveal delayMs={62}>
          <section className="rounded-[var(--radius-xl)] border border-[#F5B942]/25 bg-[#F5B942]/[0.08] p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5B942]/85">Core loop tracker</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Deals accepted</p>
                <p className="text-xl font-bold text-slate-100">{activeDealsCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Earnings this week</p>
                <p className="text-xl font-bold text-emerald-300">
                  ${Math.max(75, Math.round(displayEarnings * 0.15)).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Invested amount</p>
                <p className="text-xl font-bold text-sky-200">
                  ${Math.max(30, Math.round(displayEarnings * 0.35)).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">Deals → Messages → Paid → Invest → Repeat</p>
          </section>
        </ScrollReveal>
      ) : null}

      {role === "athlete" ? (
        <ScrollReveal delayMs={64}>
          <DailyActionChecklist />
        </ScrollReveal>
      ) : null}
      {role === "athlete" ? (
        <ScrollReveal delayMs={66}>
          <AthleteRetentionSystem userId={user.id} />
        </ScrollReveal>
      ) : null}

      {role === "athlete" ? (
        <ScrollReveal delayMs={68}>
          <DailyMoneyLoop
            firstName={fn}
            earnToday={Math.max(
              0,
              Math.round(Number(displayEarnings) * 0.04) + (activeDealsCount ?? 0) * 45 + (unreadMessages ?? 0) * 8,
            )}
            activeDeals={activeDealsCount ?? 0}
            newOpp={Math.max(0, (openMarketCount ?? 0) + (activeDealsCount ?? 0) * 2 + 1)}
            unreadMessages={unreadMessages ?? 0}
          />
        </ScrollReveal>
      ) : null}

      <ScrollReveal delayMs={70}>
        <GrowthLoopPanel
          role={role}
          userId={user.id}
          profileEarningsTotal={role === "athlete" ? user.earnings_total : 0}
        />
      </ScrollReveal>

      {role === "business" ? <BusinessGrowthTools proMember={proMember} /> : null}

      <ScrollReveal delayMs={30}>
        <Panel
          title="Recent activity"
          description="Every signal in one line — if it moved, it is here."
          action={
            <Link href="/notifications" className="btn-secondary">
              View all activity
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
            {(
              role === "business"
                ? [
                    "New athlete match available — 12.4K followers",
                    "Your deal is trending — 12 athletes viewed it",
                    "Verification complete — your business profile is trusted",
                  ]
                : [
                    "Iron Haven Gym — new message about your Wednesday shoot",
                    "$75 payout pending — Daily Grind Coffee (morning story)",
                    "Welcome to oppurtunity — your dashboard is live",
                  ]
            ).map((item) => (
              <article
                key={item}
                className="ui-card-interactive rounded-xl border-white/8 bg-white/[0.04] p-4 sm:p-5"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <TrendingUp className="h-4 w-4 shrink-0 text-[#F2994A]/80" />
                  <p className="text-sm font-semibold leading-snug">{item}</p>
                </div>
                <p className="mt-2 text-xs text-slate-500">Just now</p>
              </article>
            ))}
          </div>
        </Panel>
      </ScrollReveal>

      {role === "business" ? (
        <ScrollReveal>
          <section className="rounded-[var(--radius-xl)] border border-[#F5B942]/25 bg-gradient-to-r from-[#1a1508]/90 via-[var(--surface-elevated)] to-[#0a0a0a] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5B942]/75">Done-for-you growth</p>
            <h3 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-slate-50 sm:text-3xl">We help you win</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              We do not just connect you with athletes. We help you grow your brand, increase revenue, and scale your
              business.
            </p>
            <Link href="/billing" className="btn-primary mt-5 inline-flex">
              Unlock full system
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </ScrollReveal>
      ) : null}
    </AppShell>
  );
}
