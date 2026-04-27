"use client";

import { useMemo, useState } from "react";
import { Lock, Sparkles } from "lucide-react";

interface BusinessGrowthToolsProps {
  proMember: boolean;
}

const monetizationCards = [
  {
    title: "Custom Website Upgrade",
    detail: "Get a high-converting website built for your business",
    cta: "Upgrade Site",
  },
  {
    title: "Social Growth Playbook",
    detail: "TikTok + Instagram strategies, content ideas, viral hooks",
    cta: "Get Playbook",
  },
  {
    title: "Athlete Matching + Outreach",
    detail: "Connect with athletes ready to promote your business",
    cta: "Start Matching",
  },
  {
    title: "1-on-1 Strategy Calls",
    detail: "Work directly with Matt to scale your business",
    cta: "Book Strategy Call",
  },
  {
    title: "Weekly Growth Plays",
    detail: "Weekly ideas to turn athlete influence into revenue",
    cta: "Unlock Plays",
  },
];

export function BusinessGrowthTools({ proMember }: BusinessGrowthToolsProps) {
  const [form, setForm] = useState({
    businessName: "",
    instagram: "",
    website: "",
    location: "",
    industry: "",
    logo: "",
  });
  const [scoreReady, setScoreReady] = useState(false);
  const [planReady, setPlanReady] = useState(false);

  const growthScore = useMemo(() => {
    if (!scoreReady) return 0;
    return 62;
  }, [scoreReady]);

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="rounded-[var(--radius-xl)] border border-amber-400/25 bg-gradient-to-br from-[#141108] via-[#0c0d12] to-[#08090c] p-5 text-white shadow-[var(--shadow-lg)] sm:p-6 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">
          Unlock Athlete Growth System <span aria-hidden>🔒</span>
        </p>
        <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {monetizationCards.map((card) => (
            <article
              key={card.title}
              className="ui-card-interactive rounded-2xl border-amber-400/20 bg-white/[0.04] p-4 sm:p-5"
            >
              <h3 className="text-base font-semibold text-amber-50/95">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-200/90">{card.detail}</p>
              <button type="button" className="btn-gold mt-4 w-full text-xs sm:w-auto sm:px-3">
                {card.cta}
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.3fr_1fr]">
        <article className="ui-surface p-5 sm:p-6 md:p-7">
          <h3 className="ui-heading-section">Business Onboarding Snapshot</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add your business profile to improve athlete matching and conversion quality.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              placeholder="Business Name"
              value={form.businessName}
              onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))}
              className="premium-input w-full px-4 py-2.5 text-sm"
            />
            <input
              placeholder="Instagram Handle"
              value={form.instagram}
              onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))}
              className="premium-input w-full px-4 py-2.5 text-sm"
            />
            <input
              placeholder="Website URL"
              value={form.website}
              onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
              className="premium-input w-full px-4 py-2.5 text-sm"
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              className="premium-input w-full px-4 py-2.5 text-sm"
            />
            <input
              placeholder="Industry"
              value={form.industry}
              onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
              className="premium-input w-full px-4 py-2.5 text-sm"
            />
            <input
              placeholder="Upload Image / Logo URL"
              value={form.logo}
              onChange={(e) => setForm((prev) => ({ ...prev, logo: e.target.value }))}
              className="premium-input w-full px-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setScoreReady(true)}
            className="btn-primary mt-4"
          >
            Calculate Growth Score
          </button>
          {scoreReady ? (
            <div className="mt-4 rounded-xl border border-[#F5B942]/30 bg-[#F5B942]/[0.08] p-4">
              <p className="text-sm font-semibold text-[#F5E6B3]">Growth Score: {growthScore}/100</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                <li>- Missing athlete partnerships</li>
                <li>- Weak social presence</li>
                <li>- No optimized website</li>
              </ul>
              {!proMember ? (
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#8a6c2f]">
                  <Lock className="h-3.5 w-3.5" />
                  Full insights are available in Pro.
                </p>
              ) : null}
            </div>
          ) : null}
        </article>

        <article className="ui-surface p-5 sm:p-6 md:p-7">
          <h3 className="ui-heading-section">Growth Plan Generator</h3>
          <p className="mt-1 text-sm text-slate-500">
            Generate a 2-week action plan to turn athlete influence into measurable revenue.
          </p>
          <button
            type="button"
            onClick={() => setPlanReady(true)}
            className="btn-gold mt-4 w-full"
          >
            Generate My Growth Plan
          </button>

          {planReady ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-slate-100">Week 1</p>
              <ul className="mt-1 text-sm text-slate-400">
                <li>- Partner with 2 athletes</li>
                <li>- Run nightlife campaign</li>
              </ul>
              <p className="mt-3 text-sm font-semibold text-slate-100">Week 2</p>
              <ul className="mt-1 text-sm text-slate-400">
                <li>- Post 5 TikToks</li>
                <li>- Launch giveaway</li>
              </ul>
              <p className="mt-3 text-sm font-semibold text-[#F5E6B3]">$2,300 potential</p>
              {!proMember ? (
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#8a6c2f]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Full version and weekly updates are locked in Pro.
                </p>
              ) : null}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
