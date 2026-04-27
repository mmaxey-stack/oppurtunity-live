import Link from "next/link";
import { BarChart3, MessageCircle, Plus, Zap } from "lucide-react";

const base =
  "group inline-flex min-h-[2.75rem] flex-1 min-w-[10rem] items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] sm:min-w-0";

export function BusinessQuickActions() {
  return (
    <section
      className="rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-4 sm:p-5"
      aria-label="Quick actions"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Quick actions</p>
      <h2 className="mt-1.5 text-lg font-bold text-slate-100 sm:text-xl">Move the needle</h2>
      <div className="mt-4 flex flex-wrap gap-2.5 sm:gap-3">
        <Link
          href="/marketplace#post-deal"
          className={`${base} border-[#F5B942]/40 bg-gradient-to-r from-[#1a1508] to-[#0d0d0d] text-[#F5E6B3] ring-1 ring-[#F5B942]/25 hover:border-[#F5B942]/60 hover:ring-[#F5B942]/40`}
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Post new deal
        </Link>
        <Link
          href="/messages"
          className={`${base} border-[#4A90E2]/35 bg-[#4A90E2]/[0.1] text-sky-200 hover:border-[#4A90E2]/50 hover:bg-[#4A90E2]/[0.16]`}
        >
          <MessageCircle className="h-4 w-4" />
          Message athletes
        </Link>
        <Link
          href="/marketplace#featured"
          className={`${base} border-rose-500/30 bg-rose-500/[0.08] text-rose-100 hover:border-rose-400/45 hover:bg-rose-500/[0.12]`}
        >
          <Zap className="h-4 w-4 text-rose-200" />
          Boost current campaign
        </Link>
        <Link
          href="/#business-analytics"
          className={`${base} border-white/12 bg-white/[0.04] text-slate-200 hover:border-white/20 hover:bg-white/[0.07]`}
        >
          <BarChart3 className="h-4 w-4 text-[#F5B942]/80" />
          View analytics
        </Link>
      </div>
    </section>
  );
}
