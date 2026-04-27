"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CircleDot,
  GraduationCap,
  Layers,
  LineChart,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { Panel } from "@/components/cards";

function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame: number;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

const WATCHLIST: {
  id: string;
  name: string;
  change: number;
  tag: "SAFE" | "GROWTH" | "TREND";
}[] = [
  { id: "1", name: "S&P ETF", change: 1.2, tag: "SAFE" },
  { id: "2", name: "Tech Basket", change: 1.2, tag: "TREND" },
  { id: "3", name: "Small Cap ETF", change: 1.2, tag: "GROWTH" },
];

const EDU = [
  {
    id: "edu-nil",
    title: "NIL tax basics",
    line: "Keep more of what you earn with clean records and better timing.",
  },
  {
    id: "edu-1k",
    title: "First $1K investing plan",
    line: "Start simple, stay consistent, and match risk to your NIL income rhythm.",
  },
  {
    id: "edu-cf",
    title: "Cash flow for athletes",
    line: "Smooth income spikes so you can invest and spend with less stress.",
  },
];

const tagClass: Record<(typeof WATCHLIST)[0]["tag"], string> = {
  SAFE: "border-white/10 bg-white/[0.04] text-slate-400",
  GROWTH: "border-[#27AE60]/30 bg-[#27AE60]/[0.08] text-emerald-200",
  TREND: "border-[#9B51E0]/30 bg-[#9B51E0]/[0.1] text-violet-200",
};

const WATCH_SAVED_KEY = "opp-invest-watch-saved";
const EDU_LEARNED_KEY = "opp-invest-edu-learned";

function loadIdSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function saveIdSet(key: string, s: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify([...s]));
}

export function InvestingExperience({ proMember }: { proMember: boolean }) {
  const portfolio = 2450;
  const counted = useCountUp(portfolio);
  const [watchSaved, setWatchSaved] = useState<Set<string>>(() => loadIdSet(WATCH_SAVED_KEY));
  const [eduDone, setEduDone] = useState<Set<string>>(() => loadIdSet(EDU_LEARNED_KEY));

  const portfolioStr = useMemo(() => formatUsd(counted), [counted]);
  const weekLine = useMemo(
    () => (
      <span className="font-medium text-slate-500">
        Total return shown above animates for feedback only — not a live brokerage balance.
      </span>
    ),
    [],
  );

  function toggleWatch(id: string) {
    setWatchSaved((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      saveIdSet(WATCH_SAVED_KEY, n);
      return n;
    });
  }

  function toggleEdu(id: string) {
    setEduDone((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      saveIdSet(EDU_LEARNED_KEY, n);
      return n;
    });
  }

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[#27AE60]/25 bg-gradient-to-br from-[var(--surface-elevated)] via-[#27AE60]/[0.06] to-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-7 md:p-8"
        style={{
          backgroundImage:
            "radial-gradient(900px 420px at 20% 0%, rgba(232, 215, 163, 0.45) 0%, transparent 55%), radial-gradient(700px 380px at 90% 100%, rgba(184, 146, 42, 0.12) 0%, transparent 50%)",
        }}
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#F5B942]/75">INVESTING OS</p>
        <h1 className="ui-heading-display mt-2 max-w-2xl text-balance">Investing</h1>
        <p className="mt-2 max-w-prose text-sm text-slate-400 sm:text-[0.95rem]">
          Track what you earn from deals, then grow it on purpose — education-first, not advice.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Portfolio</p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-[-0.03em] text-slate-100 sm:text-4xl md:text-5xl">
              {portfolioStr}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-400">
              <span>
                Weekly: <span className="font-bold text-emerald-400/95">+3.2%</span>
              </span>
              <span>
                Cash: <span className="font-bold tabular-nums text-slate-100">$500</span>
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed">{weekLine}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <a
              href="#watchlist"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:shadow-md active:scale-[0.99]"
            >
              <LineChart className="h-4 w-4 text-[#F5B942]/90" />
              View market signals
            </a>
            <a
              href="#education"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:shadow-md active:scale-[0.99]"
            >
              <BookOpen className="h-4 w-4 text-[#F5B942]/90" />
              Learn something new
            </a>
            <a
              href="#portfolio-brief"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:shadow-md active:scale-[0.99]"
            >
              <Wallet className="h-4 w-4 text-[#F5B942]/90" />
              Track your money
            </a>
          </div>
        </div>
      </section>

      {/* Featured + Daily Play */}
      <div id="portfolio-brief" className="grid scroll-mt-24 gap-6 sm:gap-7 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
        <article
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-amber-400/25 bg-gradient-to-br from-[#121108] via-[#0c0d10] to-[#060608] p-5 text-white shadow-[var(--shadow-lg)] transition-shadow duration-300 sm:p-7"
          style={{
            backgroundImage: "radial-gradient(800px 400px at 10% 0%, rgba(232, 215, 163, 0.12) 0%, transparent 50%)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">Featured investment pick</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-amber-50/95 sm:text-3xl">
            Creator Economy Infrastructure ETF
          </h2>
          <p className="mt-2 text-sm text-slate-200/90">
            Thesis: steady exposure to long-term digital commerce growth with diversified downside protection.
          </p>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
            <div className="rounded-xl border border-[#F5B942]/25 bg-[#F5B942]/[0.06] p-4 text-slate-100 shadow-sm ring-1 ring-white/5 transition-transform duration-200 hover:-translate-y-0.5">
              <p className="text-xs text-[#F5B942]/70">Risk level</p>
              <p className="text-lg font-semibold">Moderate</p>
            </div>
            <div className="rounded-xl border border-[#F5B942]/25 bg-[#F5B942]/[0.06] p-4 text-slate-100 shadow-sm ring-1 ring-white/5 transition-transform duration-200 hover:-translate-y-0.5">
              <p className="text-xs text-[#F5B942]/70">Time horizon</p>
              <p className="text-lg font-semibold">3-5 years</p>
            </div>
            <div className="rounded-xl border border-[#F5B942]/25 bg-[#F5B942]/[0.06] p-4 text-slate-100 shadow-sm ring-1 ring-white/5 transition-transform duration-200 hover:-translate-y-0.5 sm:col-span-1">
              <p className="text-xs text-[#F5B942]/70">Week return</p>
              <p className="text-lg font-semibold text-emerald-400/95">+0.6%</p>
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-[var(--radius-xl)] bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600/90" />
          <div className="pl-4 sm:pl-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#F5B942]/80">Daily play</p>
            <h2 className="ui-heading-section mt-2">Local ad spend is rising</h2>
            <p className="mt-2 text-sm font-medium text-slate-300">
              → More athlete collabs are getting funded. That matters because higher local marketing budgets usually mean
              more paid campaigns, faster sign-offs, and better odds your thread converts.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                Bias outreach to growth zip codes and game-day windows — that’s where spend is showing up first.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                Pair short-term deal income with a core index so deal-to-deal income doesn’t sit idle.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                Watch for brands repeating buys — that’s a signal to raise your ask next time.
              </li>
            </ul>
            <button
              type="button"
              className="btn-gold mt-5 w-full max-w-sm shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99] sm:w-auto"
            >
              Apply this idea
            </button>
          </div>
        </article>
      </div>

      <section className="grid gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        <div id="watchlist" className="scroll-mt-24">
          <Panel title="Watchlist" description="Curated assets and money signals to monitor this week.">
            <div className="space-y-2.5 sm:space-y-3">
              {WATCHLIST.map((row) => {
                const up = row.change >= 0;
                return (
                  <div
                    key={row.id}
                    className="ui-card-interactive group flex items-center justify-between gap-3 rounded-xl border-white/8 bg-white/[0.04] px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#27AE60]/35 hover:bg-white/[0.06] hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#F5B942]/30 bg-gradient-to-br from-[#1a1508] to-[#0c0d10] text-[#F5B942] shadow-sm">
                        <Layers className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200">{row.name}</p>
                        <p className="text-xs text-slate-500">on your radar</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                      <span
                        className={`inline-flex items-center gap-0.5 text-sm font-bold tabular-nums ${
                          up ? "text-emerald-400/95" : "text-red-400/90"
                        }`}
                      >
                        {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {up ? "+" : ""}
                        {row.change.toFixed(1)}%
                      </span>
                      <span
                        className={`hidden rounded-md border px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide sm:inline ${tagClass[row.tag]}`}
                      >
                        {row.tag}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleWatch(row.id)}
                        className={`rounded-lg border px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide transition ${
                          watchSaved.has(row.id)
                            ? "border-[#F5B942]/50 bg-[#F5B942]/15 text-[#F5E6B3]"
                            : "border-white/10 bg-white/[0.05] text-slate-300 hover:border-[#27AE60]/40"
                        }`}
                      >
                        {watchSaved.has(row.id) ? "Saved" : "Save to watchlist"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div id="education" className="scroll-mt-24">
          <Panel title="Education" description="Keep more of what you earn and compound smarter.">
            <div className="space-y-3 sm:space-y-4">
              {EDU.map((card) => (
                <div
                  key={card.id}
                  className="group rounded-[var(--radius-lg)] border border-white/10 bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#27AE60]/35 sm:p-5"
                >
                  <p className="text-sm font-semibold text-slate-100">{card.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{card.line}</p>
                  <button
                    type="button"
                    onClick={() => toggleEdu(card.id)}
                    className="btn-secondary mt-4 w-full text-sm font-semibold transition-transform duration-200 active:scale-[0.99] sm:w-auto"
                  >
                    {eduDone.has(card.id) ? "Learned" : "Mark learned"}
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div>
          <Panel title="Pro content" description="Premium research and deeper analysis.">
            {proMember ? (
              <div className="space-y-2.5 sm:space-y-3">
                <div className="ui-card-interactive rounded-xl border-white/8 bg-white/[0.04] p-4 transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 text-slate-200">
                    <TrendingUp className="h-4 w-4 text-[#F5B942]/90" />
                    <p className="text-sm font-semibold">Weekly macro briefing</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">How market cycles can impact sponsorship budgets.</p>
                </div>
                <div className="ui-card-interactive rounded-xl border-white/8 bg-white/[0.04] p-4 transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-[#F5B942]/90" />
                    <p className="text-sm font-semibold">Risk framework</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Position sizing for variable creator income.</p>
                </div>
              </div>
            ) : (
              <div
                className="relative overflow-hidden rounded-2xl p-[1px] shadow-[var(--shadow-md)]"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 215, 163, 0.95) 0%, rgba(184, 146, 42, 0.55) 40%, rgba(8, 9, 12, 0.35) 100%)",
                }}
              >
                <div className="relative overflow-hidden rounded-[1.05rem] bg-amber-50/95 px-5 py-6 text-center sm:px-6 sm:py-8">
                  <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_240px_at_50%_0%,rgba(255,255,255,0.65)0%,transparent_60%)]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 opacity-[0.12] blur-md"
                    aria-hidden
                  >
                    <p className="text-left text-sm leading-relaxed text-slate-800">
                      Weekly market plays, athlete-only frameworks, and deal-to-invest bridges. Upgrade to Pro for
                      the full research stack and private notes.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200/95 to-amber-600/50 shadow-lg ring-1 ring-amber-400/30">
                      <Lock className="h-5 w-5 text-amber-950" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-100">Unlock the Pro investing layer</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">Everything behind this card is live for Pro members — cleaner signal, less noise.</p>
                    <ul className="mx-auto mt-5 max-w-sm space-y-2.5 text-left text-sm text-slate-800">
                      <li className="flex gap-2.5">
                        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>Weekly market plays and what to do with them</span>
                      </li>
                      <li className="flex gap-2.5">
                        <Target className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>Athlete-specific strategies for volatile income</span>
                      </li>
                      <li className="flex gap-2.5">
                        <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>Deal-to-invest system so earnings compound on purpose</span>
                      </li>
                    </ul>
                    <Link
                      href="/billing"
                      className="btn-primary mt-6 inline-flex min-w-[10rem] justify-center px-6 text-base font-bold shadow-md transition-transform duration-200 hover:shadow-lg active:scale-[0.98]"
                    >
                      Unlock Pro
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </section>

      {/* Advanced (Pro) */}
      <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div
          className={proMember ? "" : "pointer-events-none select-none blur-[2.5px]"}
          aria-hidden={!proMember}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Advanced</p>
          <h2 className="ui-heading-section mt-1">Thesis lab &amp; factor tilts</h2>
          <p className="mt-2 max-w-prose text-sm text-slate-400">
            Deeper tilts, alternative data hooks, and scenario stress-tests for athletes with lumpy deal income. This
            section is for Pro members who want the full research layer.
          </p>
        </div>
        {!proMember ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0c10]/80 p-4 text-center backdrop-blur-sm">
            <p className="text-sm font-semibold text-slate-100">Unlock Pro for advanced investment workflows</p>
            <Link href="/billing" className="btn-primary text-sm font-bold">
              Unlock Pro
            </Link>
          </div>
        ) : null}
      </section>

      {/* Next moves */}
      <section
        className="rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-br from-[var(--surface-elevated)] to-[#1a1508]/40 p-5 sm:p-7"
        id="next-moves"
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500">What to do next</p>
        <h2 className="ui-heading-section mt-1">Next moves</h2>
        <p className="mt-1 max-w-prose text-sm text-slate-400">Small, intentional steps beat guessing the market.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            {
              title: "Review your watchlist",
              sub: "Trim noise, keep conviction.",
              href: "#watchlist",
              icon: TrendingUp,
            },
            {
              title: "Learn one concept",
              sub: "Fifteen minutes, one takeaway.",
              href: "#education",
              icon: GraduationCap,
            },
            {
              title: "Apply today’s play",
              sub: "Turn insight into a concrete action.",
              href: "#portfolio-brief",
              icon: Sparkles,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.title}
                href={card.href}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#27AE60]/35 hover:shadow-md active:scale-[0.99] sm:p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-900 ring-1 ring-amber-200/60 transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-100">{card.title}</p>
                <p className="mt-1 flex-1 text-sm text-slate-600">{card.sub}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                  Go
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <div
        className="rounded-[var(--radius-xl)] border border-amber-200/50 p-5 shadow-[var(--shadow-sm)] sm:p-6"
        style={{
          background: "linear-gradient(110deg, rgba(255, 251, 240, 0.95) 0%, rgba(245, 243, 238, 0.9) 45%, rgba(232, 215, 163, 0.2) 100%)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Investor-ready product layer</p>
        <p className="mt-2 text-lg font-semibold tracking-[-0.01em] text-slate-100 sm:text-xl">
          Oppurtunity Pro combines growth deals and athlete-focused financial education in one premium membership.
        </p>
        <p className="mt-1 text-sm text-slate-600">Educational only. Not financial advice or brokerage execution.</p>
      </div>
    </div>
  );
}
