"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, Rocket, Share2, Trophy } from "lucide-react";
import { getBadges, getGrowthState, getMomentumScore, getUnlockedTier, registerReferral, tierLabel } from "@/lib/growth-loop";

export function GrowthLoopPanel({ role }: { role: "athlete" | "business" }) {
  const [rev, setRev] = useState(0);
  const growth = useMemo(() => {
    void rev;
    return getGrowthState();
  }, [rev]);
  const momentum = getMomentumScore(growth);
  const unlocked = getUnlockedTier(growth);
  const badges = getBadges(growth);

  const leaderboard =
    role === "athlete"
      ? [
          { label: "Weekly earnings rank", value: "#7" },
          { label: "Deals completed rank", value: "#11" },
        ]
      : [
          { label: "Top campaign ROI rank", value: "#5" },
          { label: "Fastest fill rate rank", value: "#9" },
        ];

  return (
    <section className="rounded-[var(--radius-xl)] border border-violet-500/25 bg-gradient-to-br from-violet-950/35 via-[var(--surface)] to-[#0b0b10] p-5 shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200/80">Growth loop</p>
          <h3 className="mt-1 text-xl font-bold text-slate-100">
            {role === "athlete" ? "Invite & earn" : "Marketplace growth engine"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {role === "athlete"
              ? "Referrals + fast replies unlock premium and NIL deal ladders."
              : "More active athletes in your network = faster deal volume and campaign fill."}
          </p>
        </div>
        <span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200">
          Momentum {momentum}/100
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Referrals</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{growth.referralCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Unlocked tier</p>
          <p className="mt-1 text-sm font-bold text-[#F5E6B3]">{tierLabel(unlocked)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Weekly earnings</p>
          <p className="mt-1 text-2xl font-bold text-emerald-200">${growth.weeklyEarnings.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Lifetime</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">${growth.lifetimeEarnings.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            registerReferral(1);
            setRev((v) => v + 1);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/45 bg-violet-500/10 px-3 py-2 text-sm font-bold text-violet-200"
        >
          <Share2 className="h-4 w-4" />
          Invite teammate
        </button>
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-200">
          <Rocket className="h-4 w-4 text-[#F5B942]" />
          Unlock better deals
        </Link>
      </div>

      <div className="mt-3 rounded-xl border border-[#F5B942]/25 bg-[#F5B942]/[0.08] p-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[#F5B942]/85">Phase 2: affiliate / NIL layer</p>
        <p className="mt-1 text-xs text-slate-300">
          Passive income deals (Amazon, fintech, creator affiliate campaigns) will track commissions and payout timelines here.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {leaderboard.map((row) => (
          <div key={row.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs">
            <p className="text-slate-500">{row.label}</p>
            <p className="font-bold text-slate-100">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {badges.length ? (
          badges.map((b) => (
            <span key={b} className="inline-flex items-center gap-1 rounded-full border border-[#27AE60]/35 bg-[#27AE60]/10 px-2.5 py-1 text-xs font-bold text-emerald-200">
              <Award className="h-3.5 w-3.5" />
              {b}
            </span>
          ))
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-slate-400">
            <Trophy className="h-3.5 w-3.5" />
            Complete 2 deals to unlock badges
          </span>
        )}
      </div>
    </section>
  );
}

