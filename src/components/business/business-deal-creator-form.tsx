"use client";

import { useCallback, useMemo, useState } from "react";
import { createDealAction } from "@/app/actions";
import { CheckCircle2, ChevronRight, Wand2 } from "lucide-react";

type CampaignGoal = "foot_traffic" | "content" | "event" | "online_sales";

const GOALS: {
  id: CampaignGoal;
  label: string;
  sub: string;
}[] = [
  { id: "foot_traffic", label: "Bring people in", sub: "Door + register visits, track at check-in" },
  { id: "content", label: "Post content", sub: "Stories, reels, tags, and UGC" },
  { id: "event", label: "Promote an event", sub: "Time-boxed promos, RSVPs, night-of buzz" },
  { id: "online_sales", label: "Drive online sales", sub: "Codes, links, and sign-ups" },
];

function buildCopy(goal: CampaignGoal, location: string) {
  const place = location.trim() || "your market";
  const templates: Record<
    CampaignGoal,
    { title: string; payout: number; sport: string; summary: string; payoutRange: string; structure: string }
  > = {
    foot_traffic: {
      title: `Local visit campaign — ${place}`,
      payout: 120,
      sport: "Local growth",
      summary: `Drive qualified foot traffic to our location. Athletes post a 24h story with our tag + address, and mention the offer at the door. We verify visits during peak hours. Focus: ${place}.`,
      payoutRange: "$100–$150",
      structure: "1 story, 1 in-feed post, door mention + photo proof in thread.",
    },
    content: {
      title: `Content sprint — social proof (${place})`,
      payout: 200,
      sport: "Content",
      summary: `Create a reel + 2 story frames promoting our product/service with clear CTA. Tag our handle, use the approved hook line, and deliver B-roll for one reuse clip. Market: ${place}.`,
      payoutRange: "$150–$300",
      structure: "1 reel, 2 stories, 48h window, 1 round of light edits if needed.",
    },
    event: {
      title: `Event night promo — ${place}`,
      payout: 500,
      sport: "Events",
      summary: `Build hype for a single event window: 3 pre-event story posts, 1 day-of reminder, and 1 follow-up highlight. Athletes should push RSVPs or door traffic depending on the venue. ${place} focus.`,
      payoutRange: "$300–$600",
      structure: "Stagger 3+ posts across 4 days, pin location + time in thread.",
    },
    online_sales: {
      title: `Online offer push — code + link`,
      payout: 175,
      sport: "E-com",
      summary: `Push a time-bound code or landing link. Athletes test two hooks (relatable + proof) in stories, share swipe-up/link sticker where available, and report code uses in the thread. Region: ${place}.`,
      payoutRange: "$100–$250",
      structure: "2 story arcs + 1 static post; track redemptions in thread for 7 days.",
    },
  };
  return templates[goal];
}

export function BusinessDealCreatorForm() {
  const [goal, setGoal] = useState<CampaignGoal>("foot_traffic");
  const [location, setLocation] = useState("Cleveland, OH");

  const draft = useMemo(() => buildCopy(goal, location), [goal, location]);

  const [title, setTitle] = useState(() => buildCopy("foot_traffic", "Cleveland, OH").title);
  const [payout, setPayout] = useState(String(buildCopy("foot_traffic", "Cleveland, OH").payout));
  const [sport, setSport] = useState(buildCopy("foot_traffic", "Cleveland, OH").sport);
  const [summary, setSummary] = useState(buildCopy("foot_traffic", "Cleveland, OH").summary);

  const applyTemplate = useCallback((g: CampaignGoal, loc: string) => {
    const t = buildCopy(g, loc);
    setTitle(t.title);
    setPayout(String(t.payout));
    setSport(t.sport);
    setSummary(t.summary);
  }, []);

  return (
    <form
      id="post-deal"
      action={createDealAction}
      className="mb-6 space-y-4 rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.03] p-4 sm:p-6"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Smart deal creator</p>
        <h2 className="mt-1 text-lg font-bold text-slate-100 sm:text-xl">What do you want athletes to do?</h2>
        <p className="mt-1 text-sm text-slate-500">Choose a goal — we pre-fill a winning brief and payout you can adjust.</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {GOALS.map((g) => {
          const active = goal === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setGoal(g.id);
                applyTemplate(g.id, location);
              }}
              className={[
                "rounded-2xl border p-3.5 text-left transition-all duration-200",
                active
                  ? "border-[#F5B942]/50 bg-[#F5B942]/[0.1] ring-1 ring-[#F5B942]/35"
                  : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20",
              ].join(" ")}
            >
              <p className="text-sm font-bold text-slate-100">{g.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{g.sub}</p>
              {active ? <CheckCircle2 className="mt-2 h-4 w-4 text-[#F5B942]" /> : null}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#F5B942]/25 bg-[#F5B942]/[0.06] p-4 sm:p-5">
        <div className="flex items-start gap-2">
          <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B942]" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#F5B942]/85">Suggested payout & structure</p>
            <p className="mt-0.5 text-sm font-bold text-[#F5E6B3]">
              {draft.payoutRange} · {draft.structure}
            </p>
            <p className="mt-1 text-xs text-slate-500">Tweak any field before you post — your final numbers are what get saved.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Deal title
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="premium-input mt-1.5 w-full px-4 py-2.5 text-sm"
            required
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Payout (USD)
          <input
            name="payout"
            value={payout}
            onChange={(e) => setPayout(e.target.value)}
            type="number"
            min="1"
            className="premium-input mt-1.5 w-full px-4 py-2.5 text-sm"
            required
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Category
          <input
            name="sport"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className="premium-input mt-1.5 w-full px-4 py-2.5 text-sm"
            required
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Location (City, State or Online)
          <input
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => applyTemplate(goal, location)}
            className="premium-input mt-1.5 w-full px-4 py-2.5 text-sm"
            required
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 md:col-span-2">
          Campaign summary
          <textarea
            name="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="premium-input mt-1.5 min-h-[5.5rem] w-full px-4 py-2.5 text-sm"
            required
          />
        </label>
      </div>

      <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2 md:col-span-2">
        Post deal
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}
