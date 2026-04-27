"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { MOCK_MARKETPLACE_DEALS } from "@/lib/marketplace-mock-deals";
import type { DealTier, DisplayDeal, UrgencyTag } from "@/lib/types-marketplace";
import { ACTIVITY_EVENT, getAcceptedMockDealKeys } from "@/lib/oppurtunity-activity";
import { mapDbToDisplay, mapMockToDisplay, type DbDealRow } from "@/components/marketplace/map-deals";
import { MarketplaceDealCard } from "@/components/marketplace/marketplace-deal-card";
import { getGrowthState, getMomentumScore, getUnlockedTier, tierLabel, type DealLadderTier } from "@/lib/growth-loop";
import { ALLEY_MAC_DEAL_KEY } from "@/lib/marketplace-premium-types";

function uniqueCategories(deals: DisplayDeal[]) {
  return Array.from(new Set(deals.map((d) => d.category))).sort();
}

const TIER_SECTION: Record<DealLadderTier, { title: string; sub: string }> = {
  entry: { title: "Entry", sub: "$25–$75 · quick local collabs" },
  growth: { title: "Growth", sub: "$75–$200 · stronger campaign briefs" },
  premium: { title: "Premium", sub: "$200–$500 · proven performance campaigns" },
  nil: { title: "NIL brand deals", sub: "$500+ · flagship brand partnerships" },
};

const TIER_ORDER: DealLadderTier[] = ["entry", "growth", "premium", "nil"];

function ladderTierForDeal(d: DisplayDeal): DealLadderTier {
  if (d.payoutSort >= 500) return "nil";
  if (d.payoutSort >= 200) return "premium";
  if (d.payoutSort >= 75) return "growth";
  return "entry";
}

function tierRank(t: DealLadderTier) {
  if (t === "entry") return 0;
  if (t === "growth") return 1;
  if (t === "premium") return 2;
  return 3;
}

function filterDeals(
  deals: DisplayDeal[],
  opts: {
    category: string;
    minPayout: number;
    maxPayout: number;
    location: string;
    highPaying: boolean;
    easyTasks: boolean;
  },
) {
  return deals.filter((d) => {
    if (opts.category && opts.category !== "all" && d.category !== opts.category) return false;
    if (d.payoutSort < opts.minPayout) return false;
    if (opts.maxPayout > 0 && d.payoutSort > opts.maxPayout) return false;
    if (opts.location.trim()) {
      if (!d.location.toLowerCase().includes(opts.location.trim().toLowerCase())) return false;
    }
    if (opts.highPaying && d.payoutSort < 400) return false;
    if (opts.easyTasks && !d.easyTask && !d.tags.includes("EASY" as UrgencyTag)) return false;
    return true;
  });
}

export function MarketplaceExperience({
  role,
  dbDeals,
  activeDbDeals = [],
  businessNameById,
  userId,
  viewerBusinessId,
}: {
  role: "athlete" | "business";
  dbDeals: DbDealRow[];
  activeDbDeals?: DbDealRow[];
  businessNameById: Record<string, string>;
  userId?: string;
  viewerBusinessId?: string;
}) {
  const all: DisplayDeal[] = useMemo(() => {
    const fromDb = dbDeals.map((d) => mapDbToDisplay(d, businessNameById[d.business_id] ?? "Business"));
    const fromMock = MOCK_MARKETPLACE_DEALS.map((m) => mapMockToDisplay(m));
    return [...fromDb, ...fromMock];
  }, [dbDeals, businessNameById]);

  const alleyMacDeal = useMemo(() => all.find((d) => d.key === ALLEY_MAC_DEAL_KEY), [all]);

  const dealsForBrowse = useMemo(() => all.filter((d) => d.key !== ALLEY_MAC_DEAL_KEY), [all]);

  const activeRealDeals: DisplayDeal[] = useMemo(
    () =>
      (activeDbDeals ?? []).map((d) => mapDbToDisplay(d, businessNameById[d.business_id] ?? "Business")),
    [activeDbDeals, businessNameById],
  );

  const [category, setCategory] = useState("all");
  const [minPayout, setMinPayout] = useState(0);
  const [maxPayout, setMaxPayout] = useState(0);
  const [location, setLocation] = useState("");
  const [highPaying, setHighPaying] = useState(false);
  const [easyTasks, setEasyTasks] = useState(false);
  const [acceptRev, setAcceptRev] = useState(0);

  useEffect(() => {
    const on = () => setAcceptRev((v) => v + 1);
    if (typeof window === "undefined") return;
    window.addEventListener(ACTIVITY_EVENT, on);
    return () => window.removeEventListener(ACTIVITY_EVENT, on);
  }, []);

  const categories = useMemo(() => {
    return ["all", ...uniqueCategories(all)];
  }, [all]);

  const filtered = useMemo(
    () =>
      filterDeals(dealsForBrowse, {
        category,
        minPayout,
        maxPayout,
        location,
        highPaying,
        easyTasks,
      }),
    [dealsForBrowse, category, minPayout, maxPayout, location, highPaying, easyTasks],
  );

  const acceptedKeySet = useMemo(() => {
    void acceptRev;
    if (role !== "athlete" || !userId) return new Set<string>();
    return new Set(getAcceptedMockDealKeys());
  }, [acceptRev, role, userId]);

  const activeMockDeals = useMemo(
    () => all.filter((d) => d.isMock && acceptedKeySet.has(d.key)),
    [all, acceptedKeySet],
  );

  const browseList = useMemo(
    () => (role === "athlete" && userId ? filtered.filter((d) => !(d.isMock && acceptedKeySet.has(d.key))) : filtered),
    [filtered, role, userId, acceptedKeySet],
  );

  const growth = useMemo(() => getGrowthState(), [acceptRev]);
  const unlockedTier = useMemo(() => getUnlockedTier(growth), [growth]);
  const momentum = useMemo(() => getMomentumScore(growth), [growth]);

  const browseUnlocked = useMemo(() => {
    if (role !== "athlete") return browseList;
    const maxRank = tierRank(unlockedTier);
    return browseList.filter((d) => tierRank(ladderTierForDeal(d)) <= maxRank);
  }, [browseList, role, unlockedTier]);

  const featured: DisplayDeal | null = useMemo(() => {
    const hot = dealsForBrowse.find((d) => d.tags.includes("HOT" as UrgencyTag));
    if (hot) return hot;
    return dealsForBrowse[0] ?? null;
  }, [dealsForBrowse]);

  const browseByTier = useMemo(() => {
    const m: Record<DealLadderTier, DisplayDeal[]> = { entry: [], growth: [], premium: [], nil: [] };
    for (const d of browseUnlocked) {
      m[ladderTierForDeal(d)].push(d);
    }
    return TIER_ORDER.map((tier) => ({ tier, deals: m[tier] })).filter((g) => g.deals.length > 0);
  }, [browseUnlocked]);

  return (
    <div className="space-y-6">
      {featured && featured.key !== ALLEY_MAC_DEAL_KEY ? (
        <div
          id="featured"
          className="overflow-hidden rounded-[var(--radius-xl)] border border-amber-300/50 bg-gradient-to-r from-amber-950/95 via-[#141108] to-[#0a0a0a] p-1 shadow-[var(--shadow-lg)]"
        >
          <div className="flex flex-col gap-4 rounded-[calc(var(--radius-xl)-2px)] border border-amber-400/20 bg-gradient-to-br from-amber-100/20 to-transparent p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200/90">Featured this week</p>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">{featured.title}</h2>
              <p className="mt-1 text-sm text-amber-100/85">
                {featured.businessName} — {featured.location} · {featured.payoutLabel}
              </p>
            </div>
            <a
              href={`#deal-${featured.key}`}
              className="btn-gold inline-flex w-full shrink-0 justify-center sm:w-auto"
            >
              Jump to deal
            </a>
          </div>
        </div>
      ) : null}

      {alleyMacDeal ? (
        <div className="flex justify-center">
          <MarketplaceDealCard
            deal={alleyMacDeal}
            role={role}
            userId={userId}
            viewerBusinessId={viewerBusinessId}
          />
        </div>
      ) : null}

      <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-3">
        <p className="text-xs text-slate-300">👀 12 people viewing deals right now</p>
        <p className="text-xs text-slate-300">✅ 3 athletes just accepted campaigns</p>
        <p className="text-xs text-slate-300">💰 Recent earnings: +$75 in last 15 min</p>
      </div>
      <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-400/10 to-transparent p-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">🔥 Trending deals</p>
        <p className="mt-1 text-sm text-slate-300">Highest activity right now — fast movers get priority responses.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-200">
            <SlidersHorizontal className="h-4 w-4 text-[#F5B942]/90" />
            Filters
          </span>
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setMinPayout(0);
              setMaxPayout(0);
              setLocation("");
              setHighPaying(false);
              setEasyTasks(false);
            }}
            className="ml-auto text-xs font-semibold text-[#F5B942] underline-offset-2 hover:underline"
          >
            Reset all
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="flex flex-col text-xs font-semibold text-slate-500">
            Category
            <select
              className="premium-input mt-1.5 w-full text-sm text-slate-200"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs font-semibold text-slate-500">
            Min payout
            <input
              type="number"
              min={0}
              className="premium-input mt-1.5 w-full text-sm"
              value={minPayout}
              onChange={(e) => setMinPayout(Number(e.target.value) || 0)}
            />
          </label>
          <label className="flex flex-col text-xs font-semibold text-slate-500">
            Max payout
            <input
              type="number"
              min={0}
              className="premium-input mt-1.5 w-full text-sm"
              value={maxPayout || ""}
              onChange={(e) => setMaxPayout(Number(e.target.value) || 0)}
              placeholder="No cap (0)"
            />
          </label>
          <label className="flex flex-col text-xs font-semibold text-slate-500 sm:col-span-2">
            Location (city, state, or online)
            <input
              className="premium-input mt-1.5 w-full text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Austin, Online…"
            />
          </label>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-xs font-semibold text-slate-500">Quick</span>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-sm font-medium text-slate-300 has-[:checked]:border-[#F5B942]/50 has-[:checked]:bg-[#F5B942]/[0.1]">
                <input type="checkbox" checked={highPaying} onChange={(e) => setHighPaying(e.target.checked)} />
                High paying ($400+)
              </label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-sm font-medium text-slate-300 has-[:checked]:border-[#F5B942]/50 has-[:checked]:bg-[#F5B942]/[0.1]">
                <input type="checkbox" checked={easyTasks} onChange={(e) => setEasyTasks(e.target.checked)} />
                Easy tasks
              </label>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Showing {browseUnlocked.length} of {all.length} opportunities</p>
      </div>

      {role === "athlete" ? (
        <div className="grid gap-2 rounded-2xl border border-[#9B51E0]/30 bg-[#9B51E0]/[0.08] p-3 sm:grid-cols-3">
          <p className="text-xs font-semibold text-violet-200">
            Momentum score: <span className="font-bold">{momentum}/100</span>
          </p>
          <p className="text-xs text-slate-200">
            Unlocked tier: <span className="font-bold text-[#F5E6B3]">{tierLabel(unlockedTier)}</span>
          </p>
          <p className="text-xs text-slate-300">Invite teammates + fast replies unlock higher-paying tiers.</p>
        </div>
      ) : null}

      {role === "athlete" && (activeMockDeals.length > 0 || activeRealDeals.length > 0) ? (
        <div
          id="active-deals"
          className="scroll-mt-24 space-y-3 rounded-2xl border border-[#27AE60]/30 bg-gradient-to-r from-[#27AE60]/[0.08] via-[var(--surface)] to-[#F5B942]/[0.06] p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300/90">Active deals</p>
              <p className="text-sm font-semibold text-slate-200">You&apos;re on the calendar — keep threads warm.</p>
            </div>
            <Link href="/messages" className="text-sm font-bold text-[#4A90E2] underline-offset-2 hover:underline">
              Open messages
            </Link>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {activeRealDeals.map((d) => (
              <li
                key={d.key}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-100">{d.businessName}</p>
                  <p className="truncate text-xs text-slate-500">{d.title}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-emerald-300 tabular-nums">{d.payoutLabel}</p>
                  <a href={`#deal-${d.key}`} className="text-xs font-semibold text-[#F5B942] hover:underline">
                    View
                  </a>
                </div>
              </li>
            ))}
            {activeMockDeals.map((d) => (
              <li
                key={d.key}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-100">{d.businessName}</p>
                  <p className="truncate text-xs text-slate-500">{d.title}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-emerald-300 tabular-nums">{d.payoutLabel}</p>
                  <a href={`#deal-${d.key}`} className="text-xs font-semibold text-[#F5B942] hover:underline">
                    View
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {browseUnlocked.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#F5B942]/30 bg-[#F5B942]/[0.04] px-4 py-12 text-center sm:px-6">
          <p className="text-sm font-semibold text-[#F5E6B3]">No deals match these filters</p>
          <p className="mt-1 max-w-md text-sm text-slate-400">Loosen payout or location, or clear quick filters to see the full list.</p>
          <p className="mt-4 text-sm font-medium text-slate-200">You are one step away from better matches</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Link href="/profile" className="btn-secondary text-sm">
              Complete your profile
            </Link>
            <button
              type="button"
              className="btn-primary text-sm"
              onClick={() => {
                setMinPayout(0);
                setMaxPayout(0);
                setLocation("");
                setCategory("all");
                setHighPaying(false);
                setEasyTasks(false);
              }}
            >
              Show everything
            </button>
            <a href="#post-deal" className="text-sm font-semibold text-[#F5B942] underline-offset-2 hover:underline">
              {role === "business" ? "Set your first location in a deal post" : "Set your home region in profile"}
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {browseByTier.map((group) => (
            <section key={group.tier} className="space-y-4">
              <div className="border-b border-white/8 pb-3">
                <h3 className="text-lg font-bold tracking-tight text-slate-100">{TIER_SECTION[group.tier].title}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{TIER_SECTION[group.tier].sub}</p>
              </div>
              <div className="space-y-4">
                {group.deals.map((deal, i) => (
                  <div
                    key={deal.key}
                    className="stagger-fade"
                    style={{ animationDelay: `${30 + (i % 6) * 40}ms` }}
                  >
                    <MarketplaceDealCard
                      deal={deal}
                      role={role}
                      userId={userId}
                      viewerBusinessId={viewerBusinessId}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {role === "athlete" && (dbDeals.length === 0 || browseUnlocked.length > 0) ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
            <Sparkles className="h-4 w-4 text-[#F5B942]/90" />
            Pro tip: businesses optimize for response speed. Apply and DM the same day you find a match.
          </span>
        </div>
      ) : null}
    </div>
  );
}
