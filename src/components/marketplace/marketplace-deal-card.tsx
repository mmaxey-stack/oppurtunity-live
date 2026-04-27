"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { acceptDealAction } from "@/app/actions";
import type { DisplayDeal, UrgencyTag } from "@/lib/types-marketplace";
import { addAcceptedMockDeal, isMockDealAccepted } from "@/lib/oppurtunity-activity";
import {
  AtSign,
  Bookmark,
  CheckCircle2,
  Clock,
  Eye,
  Flame,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type { DealTier } from "@/lib/types-marketplace";
import { getBusinessLiveMetricsForDeal } from "@/lib/business-deal-metrics";
import { registerReferral, incrementAcceptedDeal } from "@/lib/growth-loop";
import { MarketplacePremiumAlleyMacCard } from "@/components/marketplace/marketplace-premium-alley-mac-card";

const SAVED_KEY = "oppurtunity-marketplace-saved";

function loadSaved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function persistSaved(ids: Set<string>) {
  localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
}

function igUrl(handle: string | null) {
  if (!handle) return "#";
  const h = handle.replace(/^@/, "").trim();
  return `https://www.instagram.com/${h}/`;
}

function telUrl(phone: string | null) {
  if (!phone) return "#";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length >= 8) return `tel:+${digits}`;
  return `tel:${phone}`;
}

const tagStyle: Record<
  UrgencyTag,
  { label: string; class: string; icon?: "fire" | "clock" | "trend" | "zap" | "star" }
> = {
  HOT: { label: "Hot", class: "border-rose-500/30 bg-rose-500/10 text-rose-200", icon: "fire" },
  NEW: { label: "New", class: "border-[#4A90E2]/35 bg-[#4A90E2]/12 text-sky-200" },
  ENDING_SOON: { label: "Ending soon", class: "border-[#F2994A]/35 bg-[#F2994A]/10 text-orange-200", icon: "clock" },
  TRENDING: { label: "Trending", class: "border-violet-500/30 bg-violet-500/10 text-violet-200", icon: "trend" },
  EASY: { label: "Easy", class: "border-[#27AE60]/35 bg-[#27AE60]/10 text-emerald-200", icon: "zap" },
  OPEN: { label: "Open", class: "border-white/12 bg-white/[0.06] text-slate-300" },
  HIGH_MATCH: { label: "High match", class: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200", icon: "star" },
};

const tierUi: Record<DealTier, string> = {
  entry: "border-[#F5B942]/35 bg-[#F5B942]/[0.08] text-[#F5E6B3]",
  mid: "border-[#4A90E2]/35 bg-[#4A90E2]/[0.1] text-sky-200",
  high: "border-[#9B51E0]/35 bg-[#9B51E0]/[0.1] text-violet-200",
};

function businessInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function TagPill({ tag }: { tag: UrgencyTag }) {
  const t = tagStyle[tag] ?? { label: tag, class: "border-white/12 bg-white/[0.06]" };
  const icon =
    t.icon === "fire" ? (
      <Flame className="h-3 w-3" />
    ) : t.icon === "clock" ? (
      <Timer className="h-3 w-3" />
    ) : t.icon === "trend" ? (
      <TrendingUp className="h-3 w-3" />
    ) : t.icon === "zap" ? (
      <Zap className="h-3 w-3" />
    ) : t.icon === "star" ? (
      <Star className="h-3 w-3" />
    ) : null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${t.class}`}
    >
      {icon}
      {t.label}
    </span>
  );
}

export function MarketplaceDealCard({
  deal,
  role,
  userId,
  viewerBusinessId,
}: {
  deal: DisplayDeal;
  role: "athlete" | "business";
  /** For mock accept + connected notifications (athlete). */
  userId?: string;
  /** When set, show “your campaign” live metrics for owned DB listings. */
  viewerBusinessId?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [mockAccepted, setMockAccepted] = useState(false);
  const [acceptFlash, setAcceptFlash] = useState(false);

  useEffect(() => {
    setSaved(loadSaved().has(deal.key));
  }, [deal.key]);

  useEffect(() => {
    if (!deal.isMock) return;
    setMockAccepted(isMockDealAccepted(deal.key));
  }, [deal.isMock, deal.key]);

  function toggleSave() {
    const s = loadSaved();
    if (s.has(deal.key)) s.delete(deal.key);
    else s.add(deal.key);
    persistSaved(s);
    setSaved(s.has(deal.key));
  }

  const canAccept = !deal.isMock && deal.status === "open" && !deal.athleteId;
  const isOwnListing =
    role === "business" &&
    Boolean(viewerBusinessId && deal.ownerBusinessId && deal.ownerBusinessId === viewerBusinessId);
  const live =
    role === "business"
      ? getBusinessLiveMetricsForDeal(deal.key, deal.payoutSort, isOwnListing)
      : null;
  const ig = deal.instagram ? igUrl(deal.instagram) : null;
  const phone = deal.phone ? telUrl(deal.phone) : null;
  const showContact = deal.phone || deal.instagram || deal.website;

  const applyMessagesHref =
    deal.isMock && deal.messageThreadId
      ? `/messages?thread=${encodeURIComponent(deal.messageThreadId)}&apply=1`
      : null;
  const messageOnlyHref =
    deal.isMock && deal.messageThreadId
      ? `/messages?thread=${encodeURIComponent(deal.messageThreadId)}`
      : null;

  function onAcceptMock() {
    if (!userId || !deal.isMock) return;
    addAcceptedMockDeal(deal.key, userId, deal.title, deal.businessName, deal.messageThreadId);
    incrementAcceptedDeal(deal.payoutSort);
    setMockAccepted(true);
    setAcceptFlash(true);
    window.setTimeout(() => setAcceptFlash(false), 5000);
  }

  function onInviteTeammate() {
    registerReferral(1);
    if (typeof window === "undefined") return;
    const txt = `I just unlocked a new deal on Oppurtunity (${deal.title} · ${deal.payoutLabel}). Join my network and stack higher-paying campaigns with me.`;
    void navigator.clipboard?.writeText(txt);
  }

  if (deal.premiumSpotlight?.variant === "alley-mac") {
    return <MarketplacePremiumAlleyMacCard deal={deal} role={role} userId={userId} />;
  }

  return (
    <article
      id={`deal-${deal.key}`}
      className="group relative scroll-mt-24 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[var(--surface-elevated)] via-[var(--surface)] to-[#0a0c10] p-6 shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#F5B942]/30 hover:shadow-[var(--shadow-lg)] sm:p-7 lg:p-8"
    >
      {acceptFlash && deal.isMock ? (
        <p
          className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-[#27AE60]/35 bg-[#27AE60]/12 px-2 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-emerald-200"
          role="status"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Deal accepted — see Active deals
        </p>
      ) : null}
      {acceptFlash && role === "athlete" ? (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md border border-[#4A90E2]/35 bg-[#4A90E2]/[0.1] px-2.5 py-1.5 text-[0.72rem] text-sky-200">
          <span className="font-bold uppercase tracking-wide">Viral boost:</span>
          Invite teammates to unlock higher-paying deal tiers.
          <button
            type="button"
            onClick={onInviteTeammate}
            className="rounded-full border border-[#4A90E2]/45 bg-[#4A90E2]/[0.16] px-2 py-0.5 font-bold"
          >
            Invite & earn
          </button>
        </div>
      ) : null}
      {deal.isMock ? (
        <p className="mb-2 inline-flex items-center gap-1 rounded-md border border-[#F5B942]/35 bg-[#F5B942]/[0.1] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-[#F5E6B3]">
          <Sparkles className="h-3 w-3" />
          {mockAccepted || isMockDealAccepted(deal.key) ? "In your network" : "High-quality example"}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#F5B942]/30 bg-gradient-to-br from-[#F5B942]/25 to-[#1a1508] text-sm font-extrabold tracking-tight text-[#F5E6B3] shadow-sm ring-1 ring-[#F5B942]/20"
              aria-hidden
            >
              {businessInitials(deal.businessName)}
            </div>
            <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {deal.tags.map((t, i) => (
              <TagPill key={`${deal.key}-${t}-${i}`} tag={t} />
            ))}
            <span className="inline-flex max-w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-slate-400">
              {deal.category}
            </span>
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${tierUi[deal.tier]}`}
            >
              {deal.payoutSort >= 500
                ? "NIL brand"
                : deal.payoutSort >= 200
                  ? "Premium"
                  : deal.payoutSort >= 75
                    ? "Growth"
                    : "Entry"}
            </span>
            <span className="inline-flex rounded-md border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-300">
              {deal.payoutSort >= 120 ? "Paid" : deal.payoutSort >= 60 ? "Hybrid" : "Exposure"}
            </span>
          </div>
          {deal.fomo ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {deal.fomo.slotsLeft != null ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F5B942]/25 bg-[#F5B942]/[0.06] px-2 py-0.5 text-[0.65rem] font-semibold text-[#F5E0A8]">
                  <Users className="h-3 w-3 opacity-80" />
                  Only {deal.fomo.slotsLeft} athletes selected
                </span>
              ) : null}
              {deal.fomo.expiresInHours != null ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F2994A]/30 bg-[#F2994A]/[0.08] px-2 py-0.5 text-[0.65rem] font-semibold text-orange-200/95">
                  <Clock className="h-3 w-3 opacity-80" />
                  Expires in {deal.fomo.expiresInHours}h
                </span>
              ) : null}
              {deal.fomo.viewingCount != null ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.65rem] font-medium text-slate-400">
                  <Eye className="h-3 w-3 opacity-70" />
                  {deal.fomo.viewingCount} people viewing
                </span>
              ) : null}
            </div>
          ) : null}
          <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-50 sm:text-2xl">{deal.title}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-300">{deal.businessName}</p>
          <p className="text-sm text-slate-500">{deal.location}</p>
            </div>
          </div>
        </div>
        <div className="shrink-0 rounded-2xl border border-[#F5B942]/30 bg-gradient-to-br from-[#1a1508] to-[#0a0a0a] px-5 py-3.5 text-left shadow-sm ring-1 ring-[#F5B942]/15 sm:min-w-[8rem] sm:text-right">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#F5B942]/80">Payout</p>
          <p className="text-3xl font-extrabold tabular-nums text-[#F5E6B3] sm:text-4xl">{deal.payoutLabel}</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">{deal.description}</p>

      {role === "business" && live ? (
        <div className="mt-4 space-y-2">
          {isOwnListing ? (
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#F5B942]/90">Your campaign (live)</p>
          ) : (
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Live deal status (est.)</p>
          )}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-slate-200">
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              {live.views} views
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#27AE60]/30 bg-[#27AE60]/[0.08] px-2.5 py-1 text-xs font-semibold text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {live.accepts} accepted
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#4A90E2]/30 bg-[#4A90E2]/[0.1] px-2.5 py-1 text-xs font-semibold text-sky-200">
              <Users className="h-3.5 w-3.5" />
              {live.footTraffic} in-store
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#F2994A]/30 bg-[#F2994A]/[0.08] px-2.5 py-1 text-xs font-semibold text-orange-200">
              <Clock className="h-3.5 w-3.5" />
              {live.hoursLeft}h left
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Estimated return:{" "}
            <span className="font-bold text-[#F5E6B3]">
              ${live.roiLow.toLocaleString()}–${live.roiHigh.toLocaleString()}
            </span>{" "}
            based on activity (model).
          </p>
        </div>
      ) : null}

      {deal.timeline ? (
        <div className="mt-3 rounded-xl border border-[#F5B942]/25 bg-[#F5B942]/[0.06] p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#F5B942]/80">Timeline</p>
          <p className="mt-1 text-sm font-medium text-slate-200">{deal.timeline}</p>
        </div>
      ) : null}

      <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Requirements</p>
        <p className="mt-1 text-sm text-slate-300">{deal.requirements}</p>
      </div>

      <div className="mt-3 rounded-xl border border-[#27AE60]/30 bg-[#27AE60]/[0.08] p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-300/90">Why this matches you</p>
        <ul className="mt-1.5 space-y-0.5 text-sm text-emerald-100/90">
          {deal.matchReasons.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-[#27AE60]" aria-hidden>
                ✓
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      {showContact ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {phone && deal.phone ? (
            <a
              href={phone}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-slate-200 transition-all hover:border-[#F5B942]/40 hover:bg-[#F5B942]/[0.08]"
            >
              <Phone className="h-4 w-4 text-[#F5B942]/90" />
              {deal.phone}
            </a>
          ) : null}
          {ig && deal.instagram ? (
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-slate-200 transition-all hover:border-[#F5B942]/40 hover:bg-[#F5B942]/[0.08]"
            >
              <AtSign className="h-4 w-4 text-[#F5B942]/90" />
              {deal.instagram}
            </a>
          ) : null}
          {deal.website ? (
            <a
              href={deal.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#F5B942] underline-offset-2 hover:underline"
            >
              Website
            </a>
          ) : null}
        </div>
      ) : role === "athlete" && !deal.isMock ? (
        <p className="mt-3 text-sm text-slate-500">Contact details unlock after you accept and start a thread with the business.</p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
        {role === "athlete" ? (
          !deal.isMock && deal.realId ? (
            <form action={acceptDealAction} className="inline">
              <input type="hidden" name="dealId" value={deal.realId} />
              <button
                type="submit"
                disabled={!canAccept}
                className="btn-primary min-w-[8.5rem] shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {canAccept ? "Apply now" : "Locked"}
              </button>
            </form>
          ) : deal.isMock && userId ? (
            <>
              <button
                type="button"
                onClick={onAcceptMock}
                disabled={mockAccepted || isMockDealAccepted(deal.key)}
                className="btn-primary min-w-[9.5rem] shadow-sm ring-1 ring-amber-400/30 transition-all hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mockAccepted || isMockDealAccepted(deal.key) ? "Accepted" : "Accept deal"}
              </button>
              {messageOnlyHref ? (
                <Link
                  href={messageOnlyHref}
                  className="inline-flex min-w-[9.5rem] items-center justify-center gap-1.5 rounded-full border border-[#4A90E2]/35 bg-[#4A90E2]/[0.12] px-4 py-2.5 text-sm font-bold text-sky-200 shadow-sm transition-all hover:border-[#4A90E2]/50 active:scale-[0.98]"
                >
                  <MessageCircle className="h-4 w-4 text-sky-300" />
                  Message business
                </Link>
              ) : null}
            </>
          ) : deal.isMock && applyMessagesHref ? (
            <Link
              href={applyMessagesHref}
              className="btn-primary min-w-[8.5rem] shadow-sm ring-1 ring-amber-400/30 transition-all hover:shadow-md active:scale-[0.98]"
            >
              Apply now
            </Link>
          ) : deal.isMock && ig ? (
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary min-w-[8.5rem] shadow-sm ring-1 ring-amber-400/25 transition-all hover:shadow-md active:scale-[0.98]"
            >
              Apply now
            </a>
          ) : null
        ) : !deal.isMock && deal.status === "open" ? (
          <button type="button" className="btn-primary transition-all active:scale-[0.98]">
            Invite athlete
          </button>
        ) : deal.isMock ? (
          <a href="#post-deal" className="btn-gold min-w-[9rem] text-sm transition-all active:scale-[0.98]">
            Post a similar deal
          </a>
        ) : (
          <span className="text-sm text-slate-500">This listing is no longer open.</span>
        )}

        <button
          type="button"
          onClick={toggleSave}
          className={`inline-flex min-w-[6.5rem] items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
            saved
              ? "border-[#F5B942]/50 bg-[#F5B942]/[0.15] text-[#F5E6B3]"
              : "border-white/12 bg-white/[0.04] text-slate-300 hover:border-[#F5B942]/35"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-[#F5B942]" : ""}`} />
          {saved ? "Saved" : "Save"}
        </button>

        {role === "athlete" ? (
          <Link
            href="/profile"
            className="text-sm font-semibold text-[#E5D3B3] underline-offset-2 transition-colors hover:underline"
          >
            Sharpen profile
          </Link>
        ) : null}
        {role === "athlete" ? (
          <button
            type="button"
            onClick={onInviteTeammate}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-200 transition-all hover:border-violet-400/55"
          >
            Invite & earn
          </button>
        ) : null}
      </div>
    </article>
  );
}
