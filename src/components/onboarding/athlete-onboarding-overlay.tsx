"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, AtSign, MapPin, ShieldCheck, Sparkles, User } from "lucide-react";
import { MOCK_MARKETPLACE_DEALS } from "@/lib/marketplace-mock-deals";
import {
  getOnboardingProfile,
  isOnboardingComplete,
  setOnboardingProfile,
  type OnboardingProfile,
} from "@/lib/onboarding-retention";

const TOTAL_STEPS = 7;

export function AthleteOnboardingOverlay() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<OnboardingProfile>(() => getOnboardingProfile());
  const [open, setOpen] = useState(() => !isOnboardingComplete());

  const firstDeals = useMemo(() => MOCK_MARKETPLACE_DEALS.slice(0, 4), []);
  const progress = Math.round((step / TOTAL_STEPS) * 100);

  if (!open) return null;

  const canContinueProfile = profile.sportRole.trim().length > 1 && profile.location.trim().length > 1;
  const canContinueGoal = Boolean(profile.goal);
  const canContinueAction = profile.firstActionDone;

  function commit(next: Partial<OnboardingProfile>) {
    const merged = { ...profile, ...next };
    setProfile(merged);
    setOnboardingProfile(merged);
  }

  function finish() {
    setOnboardingProfile({ ...profile, firstActionDone: true });
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[var(--radius-xl)] border border-[#F5B942]/25 bg-[#0b0c10]/95 p-5 shadow-[var(--shadow-lg)] sm:p-7">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5B942]/80">Onboarding</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-[#F5B942] to-[#27AE60] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">Step {step} of {TOTAL_STEPS}</p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-100">Let&apos;s get you earning</h2>
            <p className="text-sm text-slate-400">Takes 60 seconds to unlock your first opportunities.</p>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100">Profile setup</h2>
            <p className="text-sm text-slate-500">This helps businesses find and select you.</p>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={profile.sportRole}
                onChange={(e) => commit({ sportRole: e.target.value })}
                placeholder="Sport / Role (WR, QB, Creator...)"
                className="premium-input w-full py-2.5 pl-10 text-sm"
              />
            </div>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={profile.location}
                onChange={(e) => commit({ location: e.target.value })}
                placeholder="Location (City / School)"
                className="premium-input w-full py-2.5 pl-10 text-sm"
              />
            </div>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={profile.audience}
                onChange={(e) => commit({ audience: e.target.value })}
                placeholder="Followers / audience (optional)"
                className="premium-input w-full py-2.5 pl-10 text-sm"
              />
            </div>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={profile.instagram}
                onChange={(e) => commit({ instagram: e.target.value })}
                placeholder="Instagram (optional)"
                className="premium-input w-full py-2.5 pl-10 text-sm"
              />
            </div>
            <button className="btn-primary" disabled={!canContinueProfile} onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100">What do you want to do?</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["quick_money", "💰 Make quick money"],
                ["long_term_income", "📈 Grow long-term income"],
                ["brand_deals", "🤝 Build brand deals"],
                ["learn_investing", "🧠 Learn investing"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => commit({ goal: id as OnboardingProfile["goal"] })}
                  className={[
                    "rounded-xl border px-3 py-2.5 text-left text-sm transition",
                    profile.goal === id
                      ? "border-[#F5B942]/50 bg-[#F5B942]/[0.12] text-[#F5E6B3]"
                      : "border-white/10 bg-white/[0.04] text-slate-300",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="btn-primary" disabled={!canContinueGoal} onClick={() => setStep(4)}>
              Continue
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100">First opportunities</h2>
            <div className="space-y-2">
              {firstDeals.map((d) => (
                <div key={d.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-100">{d.title}</p>
                    <p className="text-sm font-extrabold text-[#F5E6B3]">{d.payoutLabel}</p>
                  </div>
                  <p className="text-xs text-slate-500">{d.location}</p>
                  <p className="mt-1 text-xs text-slate-400">{d.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[0.65rem]">
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-amber-100">Only 4 athletes selected</span>
                    <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 text-orange-100">Expires in 18h</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-slate-300">12 people viewing</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setStep(5)}>
              Continue
            </button>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100">Take your first action</h2>
            <p className="text-sm text-slate-500">Pick one to unlock momentum.</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary text-sm" onClick={() => commit({ firstActionDone: true })}>View deal</button>
              <button className="btn-secondary text-sm" onClick={() => commit({ firstActionDone: true })}>Message business</button>
              <button className="btn-secondary text-sm" onClick={() => commit({ firstActionDone: true })}>Save deal</button>
            </div>
            <button className="btn-primary" disabled={!canContinueAction} onClick={() => setStep(6)}>
              Continue
            </button>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100">You&apos;re in — this is how you make money</h2>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
              Deals <ArrowRight className="inline h-3.5 w-3.5" /> Messages <ArrowRight className="inline h-3.5 w-3.5" /> Paid
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/marketplace" className="btn-secondary text-sm">Browse more deals</Link>
              <Link href="/messages" className="btn-secondary text-sm">Go to messages</Link>
              <button className="btn-primary text-sm" onClick={() => setStep(7)}>Continue</button>
            </div>
          </div>
        ) : null}

        {step === 7 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100">Once you earn, we help you grow it</h2>
            <p className="text-sm text-slate-400">Track your money and learn how to invest it.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/investor" className="btn-secondary text-sm">Explore investing</Link>
              <button className="btn-primary text-sm" onClick={finish}>Finish onboarding</button>
            </div>
            <p className="text-xs text-slate-500 inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Educational only, not financial advice.</p>
          </div>
        ) : null}

        <p className="mt-4 text-xs text-slate-500 inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#F5B942]/80" />
          Premium onboarding layer — existing app flows stay unchanged.
        </p>
      </div>
    </div>
  );
}

