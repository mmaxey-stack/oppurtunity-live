"use client";

import Link from "next/link";
import { ArrowRight, Flame, TrendingUp } from "lucide-react";
import { getGrowthState, getMomentumScore, getUnlockedTier, tierLabel } from "@/lib/growth-loop";

export function AthleteRetentionSystem() {
  const growth = getGrowthState();
  const momentum = getMomentumScore(growth);
  const tier = getUnlockedTier(growth);
  const tone = momentum >= 70 ? "Rising 🔥" : momentum >= 45 ? "Neutral" : "Dropping";

  return (
    <section className="space-y-5">
      <div className="rounded-[var(--radius-xl)] border border-[#4A90E2]/30 bg-[#4A90E2]/[0.08] p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Your momentum today</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {[
            { label: "Earnings today", value: `$${Math.max(50, Math.round(growth.weeklyEarnings / 5))}`, tone: "text-emerald-300" },
            { label: "New deals", value: "3", tone: "text-slate-100" },
            { label: "Messages", value: "2", tone: "text-sky-200" },
            { label: "Watchlist", value: "+1.2%", tone: "text-emerald-300" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">{k.label}</p>
              <p className={`mt-0.5 text-xl font-bold ${k.tone}`}>{k.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/marketplace" className="btn-secondary text-sm">View deals</Link>
          <Link href="/messages" className="btn-secondary text-sm">Reply to messages</Link>
          <Link href="/investor" className="btn-secondary text-sm">Check investing</Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Daily deal drops</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-amber-100">🔥 New today · Campus promo ($75)</li>
            <li className="rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-orange-100">⏳ Expiring soon · Event push ($120)</li>
            <li className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-emerald-100">💰 High payout · Weekend activation ($220)</li>
          </ul>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-violet-500/30 bg-violet-500/[0.08] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Momentum + progression</p>
          <p className="mt-2 text-sm text-slate-200">
            Momentum: <span className="font-bold">{tone}</span> · Score {momentum}/100
          </p>
          <p className="text-sm text-slate-300">
            Unlocked: <span className="font-bold text-[#F5E6B3]">{tierLabel(tier)}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-[#27AE60]/35 bg-[#27AE60]/10 px-2.5 py-1 text-emerald-200">Verified Athlete</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-slate-300">Priority selection</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-slate-300">Higher-paying deals</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Daily streak</p>
              <p className="text-sm font-bold text-slate-100">{Math.max(2, growth.acceptedDeals)} days</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">Weekly earnings goal</p>
              <p className="text-sm font-bold text-emerald-300">${Math.max(300, growth.weeklyEarnings)} / $500</p>
            </div>
            <div className="rounded-lg border border-[#F5B942]/30 bg-[#F5B942]/[0.08] px-2.5 py-2">
              <p className="text-[0.65rem] uppercase tracking-wide text-[#F5B942]/80">Next level unlock</p>
              <p className="text-sm font-bold text-[#F5E6B3]">Complete 3 deals → unlock higher pay</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">This week you made moves</p>
          <p className="mt-2 text-sm text-slate-300">
            {growth.acceptedDeals} deals interacted · potential earnings ${Math.max(150, growth.weeklyEarnings).toLocaleString()} · progress level {tierLabel(tier)}.
          </p>
          <button className="btn-secondary mt-3 text-sm">Keep momentum going</button>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[#F5B942]/25 bg-[#F5B942]/[0.08] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5B942]/85">Income → invest loop</p>
          <p className="mt-2 text-sm text-slate-200">
            ${Math.max(200, Math.round(growth.weeklyEarnings * 0.6))} earned this week → what happens if you invest it?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-secondary text-sm">Save it</button>
            <Link href="/investor" className="btn-secondary text-sm">Invest it</Link>
            <button className="btn-secondary text-sm">Split it</button>
          </div>
          <Link href="/investor" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#F5B942]">
            Open investor platform
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

