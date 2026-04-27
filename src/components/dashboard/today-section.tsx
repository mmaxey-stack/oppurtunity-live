"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Flashlight, Radio, Target } from "lucide-react";

export type TodayAction = {
  id: string;
  label: string;
  href: string;
  kind: "primary" | "default";
};

export type NextBestAction = {
  label: string;
  href: string;
  hint: string;
};

export function TodaySection({
  greetingName,
  focus,
  subline,
  profilePercent,
  statusLine,
  actions,
  openOpportunities,
  dealsPending,
  messageNudge,
  nextBestAction,
  momentumScore,
}: {
  greetingName: string;
  focus: string;
  subline: string;
  profilePercent: number;
  statusLine: { label: string; value: string; tone: "ok" | "warn" }[];
  actions: TodayAction[];
  openOpportunities: number;
  dealsPending: number;
  messageNudge: number;
  nextBestAction: NextBestAction;
  momentumScore: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[#F5B942]/20 bg-gradient-to-br from-[var(--surface-elevated)] via-[#F5B942]/[0.04] to-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-6 md:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#F5B942]/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-[#4A90E2]/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F5B942]/80">
              <Radio className="h-3.5 w-3.5 text-[#F5B942]" />
              Today&apos;s focus
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-50 sm:text-3xl">
              Hey {greetingName} — {focus}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{subline}</p>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:max-w-xs sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">This week at a glance</p>
            <ul className="space-y-1.5 text-sm text-slate-300">
              <li className="flex items-center justify-between gap-2 sm:justify-end">
                <span className="text-slate-500">Open opportunities</span>
                <span className="font-semibold text-slate-100">{openOpportunities}</span>
              </li>
              <li className="flex items-center justify-between gap-2 sm:justify-end">
                <span className="text-slate-500">Deals in motion</span>
                <span className="font-semibold text-slate-100">{dealsPending}</span>
              </li>
              <li className="flex items-center justify-between gap-2 sm:justify-end">
                <span className="text-slate-500">Inbox to check</span>
                <span className="font-semibold text-[#4A90E2]">{messageNudge > 0 ? messageNudge : "—"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {actions.map((a, i) => (
            <Link
              key={a.id}
              href={a.href}
              className={[
                "group flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-3.5 text-sm font-semibold transition-all duration-200",
                a.kind === "primary"
                  ? "border-[#F5B942]/40 bg-[#F5B942]/[0.1] text-[#F5E6B3] shadow-sm hover:border-[#F5B942]/55 hover:shadow-md hover:-translate-y-0.5"
                  : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-[#F5B942]/30 hover:bg-white/[0.07] hover:-translate-y-0.5",
                "stagger-fade",
              ].join(" ")}
              style={{ animationDelay: `${80 + i * 70}ms` }}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                {a.kind === "primary" ? (
                  <Target className="h-4 w-4 shrink-0 text-[#F5B942]" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-500" />
                )}
                <span className="min-w-0 break-words">{a.label}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-[#F2994A]/30 bg-[#F2994A]/[0.08] p-4 shadow-sm">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#F2994A]/85">Next best action</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-100">{nextBestAction.label}</p>
              <p className="text-xs text-slate-500">{nextBestAction.hint}</p>
            </div>
            <Link href={nextBestAction.href} className="btn-primary text-sm">
              Do this now
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
          <div className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Profile strength</p>
              <p className="text-sm font-bold text-slate-100">{profilePercent}%</p>
            </div>
            <div
              className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-slate-800/90"
              role="progressbar"
              aria-valuenow={profilePercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E5D3B3]/80 to-[#F5B942] transition-all duration-700"
                style={{ width: `${profilePercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Stronger profiles get matched to better deals.</p>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2.5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            {statusLine.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-slate-500">{row.label}</span>
                <span
                  className={
                    row.tone === "warn" ? "font-semibold text-[#F2994A]" : "font-semibold text-slate-100"
                  }
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#9B51E0]/30 bg-[#9B51E0]/[0.08] px-3 py-2 text-xs text-violet-200">
            <Flashlight className="h-3.5 w-3.5 text-violet-300" />
            Momentum score: <span className="font-bold">{momentumScore}/100</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
            <Radio className="h-3.5 w-3.5 text-[#4A90E2]" />
            Last activity 2 min ago · live feed running
          </div>
        </div>
      </div>
    </section>
  );
}
