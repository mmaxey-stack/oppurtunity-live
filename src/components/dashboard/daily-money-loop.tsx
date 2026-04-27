"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  CircleDollarSign,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AnimatedInteger } from "@/components/dashboard/animated-integer";

function useCountUpMoney(target: number, durationMs = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    function frame(now: number) {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 2.4);
      setV(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [target, durationMs]);
  return v;
}

export function DailyMoneyLoop({
  firstName,
  isMattDemo,
}: {
  firstName: string;
  /** When email matches Matt — show “live” demo stats from spec */
  isMattDemo?: boolean;
}) {
  const earnToday = isMattDemo ? 500 : 320;
  const activeDeals = isMattDemo ? 2 : 1;
  const newOpp = isMattDemo ? 5 : 3;
  const unreadMsg = isMattDemo ? 3 : 2;
  const money = useCountUpMoney(earnToday);

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-br from-[var(--surface-elevated)] via-[#F5B942]/[0.05] to-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-6 md:p-7"
      aria-label="Your daily money loop"
      style={{
        backgroundImage:
          "radial-gradient(720px 320px at 12% 0%, rgba(245, 185, 66, 0.12) 0%, transparent 52%), radial-gradient(560px 280px at 98% 100%, rgba(74, 144, 226, 0.1) 0%, transparent 48%)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#F5B942]/85">
            <Sparkles className="h-3.5 w-3.5 text-[#F5B942]" />
            Athlete Wealth OS
          </p>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
            Your daily money loop
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Deals → Messages → Earnings → Growth. Hey {firstName} — here&apos;s what&apos;s moving for you today.
          </p>
        </div>
        <div className="hidden items-center gap-1 rounded-full border border-[#F5B942]/30 bg-[#F5B942]/[0.08] px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#F5E6B3] shadow-sm sm:flex">
          <Zap className="h-3 w-3 text-[#F5B942]" />
          Live
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
        <span className="rounded-full border border-[#F5B942]/25 bg-[#F5B942]/[0.08] px-2.5 py-1 text-[#F5E0A8]">Deals</span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="rounded-full border border-[#4A90E2]/30 bg-[#4A90E2]/[0.1] px-2.5 py-1 text-sky-200/95">Messages</span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="rounded-full border border-[#27AE60]/30 bg-[#27AE60]/[0.1] px-2.5 py-1 text-emerald-200/95">Earnings</span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="rounded-full border border-[#9B51E0]/30 bg-[#9B51E0]/[0.1] px-2.5 py-1 text-violet-200/90">Growth</span>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Earnings today",
            value: <span className="text-[#F5E6B3]">${money.toLocaleString()}</span>,
            icon: CircleDollarSign,
            foot: "From active + pending collabs (demo)",
          },
          {
            label: "Active deals",
            value: <AnimatedInteger value={activeDeals} className="tabular-nums" />,
            icon: Briefcase,
            foot: "In flight — keep threads warm",
          },
          {
            label: "New opportunities",
            value: <AnimatedInteger value={newOpp} className="tabular-nums" />,
            icon: Sparkles,
            foot: "In your marketplace match list",
          },
          {
            label: "Messages",
            value: (
              <span>
                <AnimatedInteger value={unreadMsg} className="tabular-nums" />{" "}
                <span className="text-sm font-semibold text-slate-500">unread</span>
              </span>
            ),
            icon: MessageCircle,
            foot: "Brands waiting on you",
          },
        ].map((row) => (
          <div
            key={row.label}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 shadow-sm ring-1 ring-white/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">{row.label}</p>
              <row.icon className="h-4 w-4 text-[#F5B942]/85 transition-transform group-hover:scale-110" />
            </div>
            <p className="mt-1.5 text-2xl font-extrabold tabular-nums tracking-tight text-slate-50 sm:text-3xl">
              {row.value}
            </p>
            <p className="mt-1 text-[0.7rem] font-medium text-slate-500">{row.foot}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/marketplace#deal-mock-nut-house"
          className="btn-primary text-sm transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Accept deal
        </Link>
        <Link
          href="/messages"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#4A90E2]/35 bg-[#4A90E2]/[0.12] px-3.5 py-2.5 text-sm font-bold text-sky-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <MessageCircle className="h-4 w-4" />
          Reply to messages
        </Link>
        <Link
          href="/marketplace"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#F5B942]/35 bg-[#F5B942]/[0.1] px-3.5 py-2.5 text-sm font-bold text-[#F5E6B3] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          Explore deals
        </Link>
        <Link
          href="/investing#portfolio-brief"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#27AE60]/40 bg-[#27AE60]/[0.1] px-3.5 py-2.5 text-sm font-bold text-emerald-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <TrendingUp className="h-4 w-4" />
          View earnings
        </Link>
      </div>
    </section>
  );
}
