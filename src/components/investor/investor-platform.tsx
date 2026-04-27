"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Lock, Sparkles, TrendingUp, UserCircle2, Wallet } from "lucide-react";
import { getGrowthState } from "@/lib/growth-loop";

const WATCHLIST = [
  { symbol: "AAPL", name: "Apple", change: 1.2 },
  { symbol: "NVDA", name: "Nvidia", change: 2.8 },
  { symbol: "TSLA", name: "Tesla", change: -0.5 },
  { symbol: "MSFT", name: "Microsoft", change: 0.9 },
  { symbol: "SPY", name: "S&P 500 ETF", change: 0.6 },
  { symbol: "QQQ", name: "Nasdaq ETF", change: 1.1 },
  { symbol: "BTC", name: "Bitcoin", change: 2.4 },
  { symbol: "ETH", name: "Ethereum", change: 1.7 },
] as const;

const EDU_CARDS = [
  "NIL income basics",
  "Investing your first $500",
  "Understanding ETFs",
  "Taxes athletes forget",
  "Building long-term wealth",
] as const;

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function InvestorPlatform({ proMember }: { proMember: boolean }) {
  const growth = useMemo(() => getGrowthState(), []);
  const dealIncome = Math.max(500, growth.weeklyEarnings);
  const projected12m = Math.round(dealIncome * 1.3);

  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="rounded-[var(--radius-xl)] border border-[#27AE60]/30 bg-gradient-to-br from-[#101910] via-[var(--surface)] to-[#0b0f0b] p-5 shadow-[var(--shadow-lg)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F5B942]/80">Investor platform</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-50 sm:text-4xl">Your Money Engine</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Athlete income into long-term wealth — educational planning examples, not guaranteed results.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Net worth", value: "$7,850", tone: "text-slate-100" },
            { label: "Portfolio value", value: "$5,000", tone: "text-[#F5E6B3]" },
            { label: "Weekly % change", value: "+1.8%", tone: "text-emerald-300" },
            { label: "Net growth", value: "+$420", tone: "text-emerald-300" },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">{k.label}</p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${k.tone}`}>{k.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <article className="rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Portfolio overview</p>
          <h2 className="mt-1 text-xl font-bold text-slate-100">Oppurtunity Growth Portfolio</h2>
          <p className="mt-1 text-sm text-slate-400">
            Target strategy: balanced aggressive growth with long-term compounding.
          </p>
          <div className="mt-4 space-y-2.5">
            {[
              "Core · SPY 28% + QQQ 22%",
              "Aggressive · NVDA 12% + AAPL 10% + MSFT 10%",
              "Alternative · BTC 8% + ETH 5%",
              "Stability · Cash reserve 5%",
            ].map((row) => (
              <div key={row} className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                {row}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#F5B942]/25 bg-[#F5B942]/[0.08] p-3 text-sm text-slate-200">
            Total: <span className="font-bold text-[#F5E6B3]">$5,000</span> · Weekly:{" "}
            <span className="font-bold text-emerald-300">+1.8%</span> · Monthly projection:{" "}
            <span className="font-bold text-slate-100">+6–10%</span>
            <p className="mt-1 text-xs text-slate-500">Illustrative examples only, not guaranteed returns.</p>
          </div>
          <p className="mt-2 text-xs text-slate-500">Educational example only. Not financial advice.</p>
        </article>

        <article className="rounded-[var(--radius-xl)] border border-[#4A90E2]/30 bg-[#4A90E2]/[0.08] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Today&apos;s Market Play</p>
          <h2 className="mt-1 text-lg font-bold text-slate-100">Markets are watching tech earnings this week</h2>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Why it matters</p>
          <p className="text-sm text-slate-300">Large tech companies can influence ETFs like SPY and QQQ.</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Suggested action</p>
          <p className="text-sm text-slate-300">
            Track your watchlist and learn how earnings impact portfolio movement.
          </p>
        </article>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-emerald-500/25 bg-emerald-500/[0.08] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Oppurtunity Fund (Early Concept)</p>
        <h2 className="mt-1 text-xl font-bold text-slate-100">Foundation for an athlete-focused investment fund</h2>
        <p className="mt-2 text-sm text-slate-300">
          This platform is the foundation: athletes learn capital discipline, track income signals, then eventually
          manage capital in a more advanced ecosystem.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {["Learn", "Track", "Manage capital"].map((phase) => (
            <div key={phase} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-slate-100">
              {phase}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Income → investing connection</p>
        <h2 className="mt-1 text-xl font-bold text-slate-100">Deal income to compounding plan</h2>
        <p className="mt-2 text-sm text-slate-300">
          {fmt(dealIncome)} earned from deals → invested → projected {fmt(projected12m)} in 12 months.
        </p>
        <p className="text-xs text-slate-500">Educational planning example only, not investment advice.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            { horizon: "12 months", amount: "$6,000 contributed", projected: "$6,500–$6,900" },
            { horizon: "24 months", amount: "$12,000 contributed", projected: "$13,200–$14,800" },
            { horizon: "36 months", amount: "$18,000 contributed", projected: "$20,100–$23,500" },
          ].map((s) => (
            <div key={s.horizon} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{s.horizon}</p>
              <p className="mt-1 text-sm text-slate-300">{s.amount}</p>
              <p className="text-sm font-semibold text-emerald-300">{s.projected}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { title: "Safe Mode", sub: "Higher reserve, lower volatility exposure." },
            { title: "Growth Mode", sub: "Balanced growth with controlled risk." },
            { title: "Aggressive Mode", sub: "Higher upside with higher drawdown risk." },
          ].map((o) => (
            <div key={o.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="font-bold text-slate-100">{o.title}</p>
              <p className="text-xs text-slate-400">{o.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-[#27AE60]/30 bg-[#27AE60]/[0.08] p-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Auto invest mode</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Invest 20%", "Invest 50%", "Custom %"].map((mode) => (
              <button
                key={mode}
                type="button"
                className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-300/50"
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              { label: "Earned", value: "$500", tone: "text-slate-100" },
              { label: "Invested", value: "$200", tone: "text-emerald-300" },
              { label: "Growth", value: "+$18", tone: "text-sky-200" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                <p className="text-[0.65rem] uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className={`text-sm font-bold ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Watchlist</p>
          <div className="mt-3 space-y-2">
            {WATCHLIST.map((a) => (
              <div key={a.symbol} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-100">
                  {a.name} <span className="text-slate-500">({a.symbol})</span>
                </p>
                <p className={`text-sm font-bold tabular-nums ${a.change >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {a.change >= 0 ? "+" : ""}
                  {a.change.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Built by Matt Maxey</p>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-3">
              <UserCircle2 className="h-10 w-10 text-[#F5B942]/85" />
              <div>
                <p className="font-bold text-slate-100">Matt Maxey</p>
                <p className="text-xs text-slate-400">Founder — Oppurtunity</p>
                <p className="text-xs text-[#F5E6B3]">Building athlete-first wealth system</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Why I built this</p>
          <p className="mt-1 text-sm text-slate-300">
            Athletes should have a premium system for earning, keeping, and growing money from day one.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
            <li>Roadmap: SIE → Series 7 → Series 65 → CFA → MBA</li>
          </ul>
          <p className="mt-3 text-sm font-medium text-[#F5E6B3]">
            Help athletes not just make money — but keep and grow it.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Long-term goal: launch an athlete-focused investment platform and fund.
          </p>
          <div className="mt-4 space-y-2">
            {EDU_CARDS.map((c) => (
              <div key={c} className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                {c}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#4A90E2]/30 bg-[#4A90E2]/[0.08] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-200">Start here path</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {["First $100", "First $500", "First $1,000"].map((step) => (
                <div key={step} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs font-semibold text-slate-200">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-violet-500/25 bg-violet-500/[0.08] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Professional Investment Layer</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Portfolio breakdown",
            "Market signals",
            "Athlete wealth strategies",
            "Income-to-investing playbooks",
            "Weekly investor briefing",
          ].map((c) => (
            <div
              key={c}
              className={[
                "relative rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm",
                proMember ? "text-slate-200" : "text-slate-400",
              ].join(" ")}
            >
              {!proMember ? <Lock className="absolute right-2 top-2 h-4 w-4 text-violet-200" /> : null}
              <p className={!proMember ? "blur-[1px]" : ""}>{c}</p>
            </div>
          ))}
        </div>
        {!proMember ? (
          <Link href="/billing" className="btn-primary mt-4 inline-flex items-center gap-1.5">
            Unlock Pro
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-sky-500/25 bg-sky-500/[0.08] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Advisory Network (Coming Soon)</p>
        <p className="mt-2 text-sm text-slate-300">
          This layer will include insights from finance professionals to support athlete-focused planning frameworks.
        </p>
      </section>
      <section className="rounded-[var(--radius-xl)] border border-[#F5B942]/25 bg-[#F5B942]/[0.08] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5E6B3]">Future Fund Vision</p>
        <p className="mt-2 text-sm text-slate-300">
          The long-term system connects earnings, auto-invest rules, and compounding data into an athlete-first fund workflow.
        </p>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-amber-400/25 bg-gradient-to-r from-[#1a1508] to-[#0c0c10] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#F5B942]" />
          <p className="text-sm font-bold text-[#F5E6B3]">Pro content + income engine connection</p>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Oppurtunity links earning opportunities to investing education so athletes can build durable wealth habits.
        </p>
      </section>

      <footer className="rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-slate-500 sm:p-5">
        Oppurtunity is not a registered investment advisor, broker-dealer, or financial planner. All investing
        content is for educational purposes only and should not be considered financial, legal, or tax advice.
        Investing involves risk, including loss of principal. Users should consult a licensed professional before
        making financial decisions.
      </footer>
    </div>
  );
}

