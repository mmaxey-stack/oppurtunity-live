"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { acceptDealAction } from "@/app/actions";
import type { DisplayDeal } from "@/lib/types-marketplace";
import { addAcceptedMockDeal, isMockDealAccepted } from "@/lib/oppurtunity-activity";
import { incrementAcceptedDeal, registerReferral } from "@/lib/growth-loop";
import {
  Bookmark,
  CheckCircle2,
  MessageCircle,
  Phone,
  Sparkles,
  X,
} from "lucide-react";

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

function telUrl(phone: string | null) {
  if (!phone) return "#";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length >= 8) return `tel:+${digits}`;
  return `tel:${phone}`;
}

function useCountdown(endsAt: string) {
  const [label, setLabel] = useState("");

  const tick = useCallback(() => {
    const end = new Date(endsAt).getTime();
    const now = Date.now();
    const ms = Math.max(0, end - now);
    if (ms === 0) {
      setLabel("Offer ended");
      return;
    }
    const d = Math.floor(ms / 86_400_000);
    const h = Math.floor((ms % 86_400_000) / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    if (d >= 1) setLabel(`Ends in ${d} day${d === 1 ? "" : "s"} ${h}h`);
    else if (h >= 1) setLabel(`Ends in ${h}h ${m}m`);
    else setLabel(`Ends in ${m} min`);
  }, [endsAt]);

  useEffect(() => {
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [tick]);

  return label;
}

export function MarketplacePremiumAlleyMacCard({
  deal,
  role,
  userId,
}: {
  deal: DisplayDeal;
  role: "athlete" | "business";
  userId?: string;
}) {
  const premium = deal.premiumSpotlight;
  if (!premium || premium.variant !== "alley-mac") return null;

  const [saved, setSaved] = useState(false);
  const [mockAccepted, setMockAccepted] = useState(false);
  const [acceptFlash, setAcceptFlash] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemEntered, setRedeemEntered] = useState(false);

  const countdown = useCountdown(premium.endsAt);

  useEffect(() => {
    setSaved(loadSaved().has(deal.key));
  }, [deal.key]);

  useEffect(() => {
    if (!deal.isMock) return;
    setMockAccepted(isMockDealAccepted(deal.key));
  }, [deal.isMock, deal.key]);

  useEffect(() => {
    if (!showRedeem) return;
    setRedeemEntered(false);
    const id = requestAnimationFrame(() => setRedeemEntered(true));
    return () => cancelAnimationFrame(id);
  }, [showRedeem]);

  useEffect(() => {
    if (!showRedeem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowRedeem(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showRedeem]);

  function toggleSave() {
    const s = loadSaved();
    if (s.has(deal.key)) s.delete(deal.key);
    else s.add(deal.key);
    persistSaved(s);
    setSaved(s.has(deal.key));
  }

  const canAccept = !deal.isMock && deal.status === "open" && !deal.athleteId;
  const phone = deal.phone ? telUrl(deal.phone) : null;
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
    const txt = `Alley Mac BOGO on Oppurtunity — code ${premium.code} or say Matthew sent you. Kent, OH.`;
    void navigator.clipboard?.writeText(txt);
  }

  const accepted = mockAccepted || isMockDealAccepted(deal.key);

  const urgencyText =
    premium.urgencyBar ?? "🔥 23 Kent students used this deal today";
  const socialText = premium.socialProof ?? "Used by 47+ students this week";
  const redemptionText =
    premium.redemptionLine ?? "Say ‘Matthew sent me’ OR show this screen";

  function openRedeem() {
    setShowRedeem(true);
  }

  return (
    <>
      <article
        id={`deal-${deal.key}`}
        className="group relative scroll-mt-24 w-full max-w-2xl overflow-hidden rounded-[1.35rem] border border-[#F5B942]/35 bg-gradient-to-b from-[#141108] via-[var(--surface)] to-[#07080c] shadow-[0_0_0_1px_rgba(245,185,66,0.12),0_28px_64px_-28px_rgba(0,0,0,0.65)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#F5B942]/50 hover:shadow-[0_0_48px_-12px_rgba(245,185,66,0.35)]"
      >
        <div className="relative overflow-hidden rounded-t-[1.35rem] border-b border-emerald-500/30 bg-gradient-to-r from-[#0a1810] via-[#0f2218] to-[#0a1810] px-3 py-2.5 sm:px-4 sm:py-3">
          <div
            className="pointer-events-none absolute inset-0 motion-safe:animate-[pulse_2.8s_ease-in-out_infinite] bg-emerald-400/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 motion-safe:opacity-80 motion-safe:animate-[pulse_2.8s_ease-in-out_infinite] shadow-[inset_0_0_24px_rgba(52,211,153,0.2)]"
            aria-hidden
          />
          <p
            className="relative z-10 text-center text-[0.7rem] font-bold leading-snug text-emerald-100 sm:text-sm sm:tracking-wide"
            style={{ textShadow: "0 0 14px rgba(52, 211, 153, 0.45)" }}
          >
            {urgencyText}
          </p>
        </div>

        <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#0a0a0c] sm:aspect-[16/10]">
          <Image
            src={premium.heroImage}
            alt="Alley Mac specialty mac bowl"
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/55 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#27AE60]/45 bg-[#27AE60]/20 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-emerald-100 shadow-sm backdrop-blur-sm">
              <span aria-hidden>🔥</span> Active Deal
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-100 backdrop-blur-sm">
              {deal.businessName}
            </span>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-28 pt-4 sm:px-7 sm:pb-6 sm:pt-5 md:pb-6">
          {acceptFlash && deal.isMock ? (
            <p
              className="flex items-center gap-1.5 rounded-lg border border-[#27AE60]/40 bg-[#27AE60]/15 px-3 py-2 text-sm font-semibold text-emerald-100 transition-opacity duration-300"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              You&apos;re in — use code {premium.code} or show this screen at the counter.
            </p>
          ) : null}

          <div>
            <h3 className="text-center text-[2rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-slate-50 sm:text-5xl sm:leading-[0.95]">
              {premium.headline}
            </h3>
            <p className="mt-3 text-center text-base font-semibold text-[#F5E6B3] sm:text-lg">{premium.subtext}</p>
            <p className="mt-3 text-center text-[0.95rem] font-medium leading-snug text-slate-200 sm:text-base">
              {redemptionText}
            </p>
            <p className="mt-2 text-center text-sm font-bold text-emerald-300 sm:text-base">{countdown}</p>
          </div>

          <div
            className="rounded-2xl border border-emerald-400/50 bg-[#0f1f16] p-4 text-center shadow-[0_0_28px_-6px_rgba(52,211,153,0.45),inset_0_1px_0_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/20 transition-shadow duration-300 hover:shadow-[0_0_36px_-4px_rgba(52,211,153,0.55)]"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-emerald-200/95">
              Use this code in store
            </p>
            <p className="mt-3 font-mono text-4xl font-black tracking-[0.14em] text-white sm:text-6xl">{premium.code}</p>
            <p className="mt-2 text-sm font-medium leading-snug text-emerald-100/90">{premium.codeDescription}</p>
          </div>

          <div className="rounded-2xl border border-[#F5B942]/25 bg-white/[0.04] px-4 py-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">Promoted by</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-100">{premium.promoterName}</p>
                <p className="text-sm font-semibold text-[#F5B942]/90">{premium.promoterTag}</p>
                <p className="mt-2 text-sm font-semibold text-emerald-300/95">{socialText}</p>
              </div>
              <Sparkles className="h-8 w-8 shrink-0 text-[#F5B942]/70" aria-hidden />
            </div>
          </div>

          <p className="text-center text-sm font-medium leading-snug text-slate-400">{deal.description}</p>

          <button
            type="button"
            onClick={openRedeem}
            className="hidden w-full rounded-2xl bg-gradient-to-r from-[#b8860b] via-[#F5B942] to-[#c9a227] px-6 py-4 text-base font-extrabold uppercase tracking-wide text-slate-950 shadow-[0_0_32px_-8px_rgba(245,185,66,0.65)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] md:flex md:items-center md:justify-center"
          >
            Use this deal now
          </button>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
            {role === "athlete" ? (
              !deal.isMock && deal.realId ? (
                <form action={acceptDealAction} className="inline w-full sm:w-auto">
                  <input type="hidden" name="dealId" value={deal.realId} />
                  <button
                    type="submit"
                    disabled={!canAccept}
                    className="btn-primary w-full py-3 transition-all active:scale-[0.98] disabled:opacity-50 sm:w-auto"
                  >
                    {canAccept ? "Apply now" : "Locked"}
                  </button>
                </form>
              ) : deal.isMock && userId ? (
                <>
                  <button
                    type="button"
                    onClick={onAcceptMock}
                    disabled={accepted}
                    className="btn-primary w-full py-3 transition-all active:scale-[0.98] disabled:opacity-50 sm:w-auto"
                  >
                    {accepted ? "Accepted" : "Accept deal"}
                  </button>
                  {messageOnlyHref ? (
                    <Link
                      href={messageOnlyHref}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#4A90E2]/40 bg-[#4A90E2]/15 py-3 text-sm font-bold text-sky-200 transition-all hover:border-[#4A90E2]/55 active:scale-[0.98] sm:w-auto sm:px-6"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message business
                    </Link>
                  ) : null}
                </>
              ) : null
            ) : deal.isMock ? (
              <a
                href="#post-deal"
                className="btn-gold inline-flex w-full justify-center py-3 text-center text-sm transition-all active:scale-[0.98] sm:w-auto sm:px-6"
              >
                Post a similar deal
              </a>
            ) : null}

            {phone && deal.phone ? (
              <a
                href={phone}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.06] py-3 text-sm font-semibold text-slate-200 transition-all hover:border-[#F5B942]/35 sm:w-auto sm:px-5"
              >
                <Phone className="h-4 w-4 text-[#F5B942]" />
                {deal.phone}
              </a>
            ) : null}

            <button
              type="button"
              onClick={toggleSave}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full border py-3 text-sm font-semibold transition-all active:scale-[0.98] sm:w-auto sm:px-5 ${
                saved
                  ? "border-[#F5B942]/50 bg-[#F5B942]/15 text-[#F5E6B3]"
                  : "border-white/12 bg-white/[0.04] text-slate-300 hover:border-[#F5B942]/35"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-[#F5B942]" : ""}`} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>

          {role === "athlete" ? (
            <button
              type="button"
              onClick={onInviteTeammate}
              className="w-full rounded-xl border border-violet-500/35 bg-violet-500/10 py-2.5 text-xs font-semibold text-violet-200 transition-all hover:border-violet-400/50"
            >
              Share invite text (copies to clipboard)
            </button>
          ) : null}
        </div>
      </article>

      {showRedeem ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alley-mac-redeem-title"
          onClick={() => setShowRedeem(false)}
        >
          <div
            className={[
              "relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#F5B942]/40 bg-gradient-to-b from-[#1a1508] to-[#0a0b0e] p-6 shadow-[0_0_60px_-12px_rgba(245,185,66,0.45)] transition-all duration-300 ease-out sm:p-8",
              redeemEntered ? "scale-100 opacity-100" : "scale-95 opacity-0",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowRedeem(false)}
              className="absolute right-3 top-3 rounded-full border border-white/15 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <p id="alley-mac-redeem-title" className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#F5B942]/85">
              Redeem at Alley Mac
            </p>
            <p className="mt-4 text-center text-xl font-bold leading-snug text-slate-50 sm:text-2xl">
              {redemptionText}
            </p>
            <div className="mt-6 rounded-xl border border-emerald-400/45 bg-[#0f1f16] py-5 text-center shadow-[0_0_28px_-8px_rgba(52,211,153,0.4)] ring-1 ring-emerald-400/25">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-200">Use this code in store</p>
              <p className="mt-2 font-mono text-5xl font-black tracking-[0.15em] text-white">{premium.code}</p>
              <p className="mt-3 px-2 text-sm font-medium text-emerald-100/95">{premium.codeDescription}</p>
            </div>
            <p className="mt-4 text-center text-sm text-slate-400">
              {deal.businessName} · {deal.location}
            </p>
            <p className="mt-2 text-center text-xs text-slate-500">{countdown}</p>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-[85] border-t border-white/10 bg-gradient-to-t from-[#050608] via-[#07080c]/98 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md md:hidden">
        <div className="mx-auto w-full max-w-2xl">
          <button
            type="button"
            onClick={openRedeem}
            className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] via-[#F5B942] to-[#c9a227] px-4 py-4 text-sm font-extrabold uppercase tracking-wide text-slate-950 shadow-[0_0_28px_-6px_rgba(245,185,66,0.7)] transition-transform active:scale-[0.98]"
          >
            Use this deal now
          </button>
        </div>
      </div>
    </>
  );
}
