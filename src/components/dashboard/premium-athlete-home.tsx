import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, MapPin, MessageCircleMore, TrendingUp } from "lucide-react";

type PremiumAthleteHomeProps = {
  firstName: string;
  totalEarnings: number;
  earningsTrendPct: string;
  activeDealsCount: number;
  unreadMessages: number;
  profileStrength: number;
  activeDeals: Array<{
    id: string;
    title: string;
    businessName: string;
    location: string;
    payout: string;
    href: string;
    status: string;
  }>;
  messageItems: string[];
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PremiumAthleteHome({
  firstName,
  totalEarnings,
  earningsTrendPct,
  activeDealsCount,
  unreadMessages,
  profileStrength,
  activeDeals,
  messageItems,
}: PremiumAthleteHomeProps) {
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 6 : today - 1;
  const bars = [42, 56, 48, 62, 78, 45, 52];

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="ui-surface overflow-hidden border-[#F5C451]/35 bg-gradient-to-br from-[#130f05]/80 via-[#0a1018] to-[#06110a] px-5 py-5 sm:px-7 sm:py-7">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#F5C451]/30 bg-[#F5C451]/12 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#F5C451]">
              <Flame className="h-3.5 w-3.5" />
              HOT DEAL TODAY
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">Alley Mac - BOGO Mac Bowls</h1>
              <p className="max-w-xl text-sm text-slate-300 sm:text-base">
                Welcome back, {firstName}. Promote this deal and earn per redemption while the campaign is still hot.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/deal/alley-mac" className="btn-gold">
                Promote This Deal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-sm text-slate-300">
                Code: <span className="font-semibold text-[#F5C451]">BOGO</span>
              </p>
              <p className="inline-flex items-center gap-1 text-sm text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                Kent, OH
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/30 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)]">
            <Image
              src="/deals/alley-mac-summer-game-day-2026.png"
              alt="Alley Mac hot deal"
              width={1200}
              height={700}
              className="h-full min-h-[220px] w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-white">Active Deals</h2>
          <Link href="/marketplace" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F5C451]">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activeDeals.map((deal, index) => (
            <Link
              key={deal.id}
              href={deal.href}
              className="ui-card-interactive rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.8)] hover:scale-[1.02] hover:border-[#F5C451]/40"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <p className="text-[0.63rem] font-semibold uppercase tracking-[0.18em] text-[#22C55E]">{deal.status}</p>
              <h3 className="mt-1 text-base font-semibold text-slate-100">{deal.businessName}</h3>
              <p className="text-sm text-slate-400">{deal.title}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">{deal.location}</span>
                <span className="font-semibold text-[#F5C451]">{deal.payout}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="ui-surface px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Messages</h3>
            <Link href="/messages" className="text-xs font-semibold uppercase tracking-[0.17em] text-slate-400">
              Open inbox
            </Link>
          </div>
          <div className="space-y-2.5">
            {messageItems.map((item) => (
              <div key={item} className="ui-card-interactive flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                <MessageCircleMore className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ui-surface px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Earnings This Week</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              {earningsTrendPct}
            </span>
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-white">${Math.round(totalEarnings).toLocaleString()}</p>
          <div className="mt-4 flex h-36 items-end gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3">
            {bars.map((height, idx) => (
              <div key={DAY_LABELS[idx]} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div
                  className={[
                    "w-full rounded-md bg-gradient-to-t transition-all duration-500",
                    idx === currentDayIndex ? "from-[#F5C451] to-amber-200 shadow-[0_0_20px_-8px_rgba(245,196,81,0.9)]" : "from-slate-700 to-slate-500",
                  ].join(" ")}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[0.64rem] font-semibold uppercase tracking-wider text-slate-500">{DAY_LABELS[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ui-surface px-4 py-4 sm:px-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recommended Deals</h3>
          <span className="text-xs text-slate-500">Profile strength {profileStrength}%</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activeDeals.slice().reverse().map((deal) => (
            <Link
              key={`rec-${deal.id}`}
              href={deal.href}
              className="ui-card-interactive rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-white/[0.015] px-3 py-3 hover:scale-[1.02] hover:border-emerald-400/45"
            >
              <p className="text-sm font-semibold text-slate-100">{deal.businessName}</p>
              <p className="text-sm text-slate-400">{deal.title}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Earn up to {deal.payout}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="ui-surface px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Active Deals</p>
          <p className="mt-1 text-2xl font-bold text-white">{activeDealsCount}</p>
        </div>
        <div className="ui-surface px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Unread Messages</p>
          <p className="mt-1 text-2xl font-bold text-white">{unreadMessages}</p>
        </div>
        <div className="ui-surface px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Conversion Focus</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">High</p>
        </div>
      </section>
    </div>
  );
}
