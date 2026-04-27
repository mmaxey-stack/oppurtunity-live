"use client";

import Link from "next/link";
import { ArrowRight, Bell, Briefcase, CreditCard, LineChart, MessageCircle, UserRound } from "lucide-react";

const LINKS: { href: string; label: string; sub: string; icon: typeof Briefcase }[] = [
  { href: "/marketplace", label: "Marketplace", sub: "Browse & accept deals", icon: Briefcase },
  { href: "/messages", label: "Messages", sub: "Threads with brands", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", sub: "Alerts & daily briefing", icon: Bell },
  { href: "/investing", label: "Investing", sub: "Grow what you earn", icon: LineChart },
  { href: "/billing", label: "Billing", sub: "Upgrade & plans", icon: CreditCard },
  { href: "/profile", label: "Profile", sub: "Your athlete story", icon: UserRound },
];

export function PlatformLoop() {
  return (
    <section
      className="rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-br from-[var(--surface-elevated)] via-[#F5B942]/[0.04] to-[var(--surface)] p-4 shadow-sm sm:p-5"
      aria-label="Platform loop"
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500">Your loop</p>
      <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-50 sm:text-xl">Deals → messages → money</h2>
      <p className="mt-0.5 text-sm text-slate-400">Everything connects — move in one flow, every day.</p>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3.5 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F5B942]/35 hover:shadow-md active:scale-[0.99]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F5B942]/30 bg-[#F5B942]/[0.08] text-[#F5E6B3] transition-transform group-hover:scale-105">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-100">{item.label}</span>
                <span className="block text-xs text-slate-500">{item.sub}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#F5B942]/80 transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
