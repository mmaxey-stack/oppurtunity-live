"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/actions";
import type { UserRole } from "@/lib/types";
import { Share2, TrendingUp, UserRound, Sparkles, ArrowUpRight, Target, Percent, Pencil, ShieldCheck } from "lucide-react";

const REACH_KEY = "oppurtunity-profile-reach";
const PROFILE_EXT_KEY = "opp-profile-ext-v1";
const FALLBACK_STATS = { deals: 4, earnings: 1200, responseRate: 92 };

type Reach = { instagram: string; tiktok: string; followers: string };
type ProfileExt = { bio: string; sports: string; location: string };

function loadReach(): Reach {
  if (typeof window === "undefined") return { instagram: "", tiktok: "", followers: "24.5k" };
  try {
    const raw = localStorage.getItem(REACH_KEY);
    if (!raw) return { instagram: "", tiktok: "", followers: "24.5k" };
    return { ...{ instagram: "", tiktok: "", followers: "24.5k" }, ...JSON.parse(raw) };
  } catch {
    return { instagram: "", tiktok: "", followers: "24.5k" };
  }
}

function loadExt(): ProfileExt {
  const d: ProfileExt = { bio: "", sports: "", location: "" };
  if (typeof window === "undefined") return d;
  try {
    const raw = localStorage.getItem(PROFILE_EXT_KEY);
    if (!raw) return d;
    return { ...d, ...JSON.parse(raw) };
  } catch {
    return d;
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

function profileStrength(
  name: string,
  reach: Reach,
  ext: ProfileExt,
): { pct: number; parts: { label: string; score: number }[] } {
  const hasIg = Boolean(reach.instagram?.trim());
  const hasTt = Boolean(reach.tiktok?.trim());
  const completed = name.trim().length >= 2 ? 25 : 8;
  const socialCapped = Math.min(25, (hasIg ? 12 : 0) + (hasTt ? 12 : 0) + (hasIg && hasTt ? 1 : 0));
  const bioBoost = ext.bio.trim().length > 20 ? 8 : 0;
  const locBoost = ext.location.trim().length > 2 ? 4 : 0;
  const sportBoost = ext.sports.trim().length > 2 ? 6 : 0;
  const activity = 17;
  const dealHist = 15;
  const total = Math.min(100, completed + socialCapped + activity + dealHist + bioBoost + locBoost + sportBoost);
  return {
    pct: total,
    parts: [
      { label: "Profile completed", score: completed },
      { label: "Connected socials", score: socialCapped },
      { label: "Activity level", score: activity },
      { label: "Deal history", score: dealHist },
    ],
  };
}

export function ProfileExperience({
  fullName: initialName,
  email,
  role,
  proMember,
  serverStats,
  profileStrengthFromServer,
}: {
  fullName: string;
  email: string;
  role: UserRole;
  proMember: boolean;
  serverStats?: { earnings: number; deals: number; responseRate: number };
  profileStrengthFromServer?: number;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [reach, setReach] = useState<Reach>({ instagram: "", tiktok: "", followers: "24.5k" });
  const [ext, setExt] = useState<ProfileExt>({ bio: "", sports: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(initialName);
  }, [initialName]);

  useEffect(() => {
    const r0 = loadReach();
    setReach(r0);
    setExt(loadExt());
    if (typeof window !== "undefined" && email.toLowerCase() === "mpmaxey@icloud.com") {
      if (!r0.instagram?.trim() && !r0.tiktok?.trim()) {
        const nr = { instagram: "@mattmaxey", tiktok: "@mattmaxey", followers: "18.2k" };
        setReach(nr);
        localStorage.setItem(REACH_KEY, JSON.stringify(nr));
      }
      const e0 = loadExt();
      if (!e0.bio && !e0.sports && !e0.location) {
        const next = {
          bio: "D1 track & field — short-form for brands that want real training energy, not a studio ad read.",
          sports: "Track & field · 100m / 200m",
          location: "Cleveland, OH",
        };
        setExt(next);
        localStorage.setItem(PROFILE_EXT_KEY, JSON.stringify(next));
      }
    }
  }, [email]);

  const saveReach = useCallback((r: Reach) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(REACH_KEY, JSON.stringify(r));
  }, []);

  const saveExt = useCallback((e: ProfileExt) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROFILE_EXT_KEY, JSON.stringify(e));
  }, []);

  const { pct, parts } = useMemo(() => profileStrength(fullName, reach, ext), [fullName, reach, ext]);
  const stats = serverStats ?? FALLBACK_STATS;
  const showPct =
    profileStrengthFromServer != null
      ? profileStrengthFromServer
      : email.toLowerCase() === "mpmaxey@icloud.com"
        ? 82
        : pct;

  const tier = proMember ? "Pro Athlete" : "Starter Tier";
  const isAthlete = role === "athlete";

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = fullName.trim();
    if (!name) {
      setError("Name is required.");
      return;
    }
    const fd = new FormData();
    fd.set("fullName", name);
    setSaving(true);
    try {
      await updateProfileAction(fd);
      saveReach(reach);
      saveExt(ext);
      setToast(true);
      window.setTimeout(() => setToast(false), 3200);
      router.refresh();
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 sm:space-y-10 md:space-y-12">
      {toast ? (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-200/80 bg-emerald-50/95 px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg"
          role="status"
        >
          Changes saved successfully
        </div>
      ) : null}
      {copiedToast ? (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#F5B942]/40 bg-[#1a1508] px-4 py-2.5 text-sm font-semibold text-[#F5E6B3] shadow-lg"
          role="status"
        >
          Profile link copied
        </div>
      ) : null}

      {/* Identity */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[#E5D3B3]/25 bg-gradient-to-br from-[var(--surface-elevated)] via-[#E5D3B3]/[0.04] to-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-7 md:p-8"
        style={{
          backgroundImage: "radial-gradient(600px 280px at 100% 0%, rgba(229, 211, 179, 0.1) 0%, transparent 50%)",
        }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#E5D3B3]/30 bg-gradient-to-br from-[#E5D3B3]/20 to-[#0a0a0a] text-2xl font-bold tracking-tight text-[#E5D3B3] shadow-sm ring-1 ring-white/8 sm:h-24 sm:w-24 sm:text-3xl">
            {initials(fullName || "Athlete")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">{fullName || "Your name"}</h2>
              {isAthlete ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-[#27AE60]/35 bg-[#27AE60]/[0.1] px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-emerald-200"
                  title="Identity verified for payouts"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : null}
              <span
                className={[
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
                  proMember
                    ? "border-[#F5B942]/50 bg-[#F5B942]/[0.12] text-[#F5E6B3]"
                    : "border-white/10 bg-white/[0.05] text-slate-300",
                ].join(" ")}
              >
                {tier}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium capitalize text-[#E5D3B3]/90">
              {role === "athlete" ? "Athlete" : "Business"}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              {isAthlete
                ? "Your profile determines the deals you attract."
                : "Your business profile helps athletes trust your campaigns and respond faster."}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">{email}</p>
            {isAthlete ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="#account-identity"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-bold text-slate-200 shadow-sm transition hover:border-[#E5D3B3]/30"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit profile
                </a>
                {!proMember ? (
                  <Link
                    href="/billing"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#F5B942]/50 bg-gradient-to-b from-[#2a2010] to-[#1a1508] px-3 py-2 text-sm font-bold text-[#F5E6B3] shadow-sm transition hover:shadow-md"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Upgrade to Pro
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={async () => {
                    if (typeof window === "undefined") return;
                    const url = window.location.href;
                    try {
                      await navigator.clipboard.writeText(url);
                      setCopiedToast(true);
                      window.setTimeout(() => setCopiedToast(false), 2200);
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5D3B3]/30 bg-white/[0.04] px-3 py-2 text-sm font-bold text-[#E5D3B3] shadow-sm transition hover:bg-white/[0.08]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share profile
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {isAthlete ? (
        <section className="ui-surface p-5 sm:p-6 md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Money + reputation</p>
          <h3 className="ui-heading-section mt-2 !text-base sm:!text-lg">Your athlete money profile</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs font-medium text-slate-500">Earnings (tracked)</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[#F5E6B3]">${stats.earnings.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs font-medium text-slate-500">Past deals completed</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-100">{stats.deals}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs font-medium text-slate-500">Response rate</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-sky-200/95">{stats.responseRate}%</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs font-medium text-slate-500">Followers</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-100">{reach.followers || "24.5k"}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-xs font-medium text-slate-500">Avg turnout</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-100">{Math.max(8, Math.round(stats.deals * 2.6))}</p>
            </div>
            <div className="rounded-2xl border border-[#27AE60]/35 bg-[#27AE60]/[0.08] p-4">
              <p className="text-xs font-medium text-emerald-200">Conversion score</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-100">
                {Math.max(62, Math.min(98, Math.round(stats.responseRate * 0.8 + stats.deals)))} / 100
              </p>
            </div>
            <div className="rounded-2xl border border-[#9B51E0]/35 bg-[#9B51E0]/[0.08] p-4 sm:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium text-violet-200">Athlete value score</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-violet-100">
                {Math.max(68, Math.min(99, Math.round(stats.responseRate * 0.45 + stats.deals * 2.5 + 40)))} / 100
              </p>
              <p className="mt-1 text-xs text-slate-300">Weighted by followers, engagement, deals completed, and response speed.</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-[#F5B942]/20 bg-gradient-to-r from-[#1a1508]/80 to-transparent p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#F5B942]/80">Athlete tier</p>
            <p className="mt-1 text-sm text-slate-300">
              You’re <span className="font-semibold text-[#F5E6B3]">Verified</span>{" "}
              <span className="text-slate-500">(2+ deals closed).</span>{" "}
              <span className="text-slate-400">Next:</span> <span className="font-semibold text-slate-200">Elite</span>{" "}
              <span className="text-slate-500">— high-trust intros + top market placement.</span>
            </p>
            <ol className="mt-3 flex flex-wrap gap-2 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
              {["Starter", "Rising", "Verified", "Elite"].map((t, i) => (
                <li
                  key={t}
                  className={[
                    "rounded-full border px-2.5 py-1",
                    i === 2
                      ? "border-[#F5B942]/50 bg-[#F5B942]/10 text-[#F5E6B3]"
                      : i < 2
                        ? "border-white/10 text-slate-500"
                        : "border-white/8 text-slate-600",
                  ].join(" ")}
                >
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        {/* Main column */}
        <form onSubmit={onSave} className="space-y-6 sm:space-y-7">
          {/* Profile strength */}
          <section className="ui-surface p-5 sm:p-6 md:p-7">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Profile strength</h3>
            <p className="ui-heading-section mt-1.5">How complete you look to partners</p>
            <p className="mt-1 text-sm text-slate-500">Stronger profiles get better deals.</p>
            <div className="mt-4">
              <div className="mb-1.5 flex items-end justify-between gap-2 text-sm">
                <span className="font-semibold text-slate-200">Overall</span>
                <span className="font-bold tabular-nums text-[#F5B942]">{showPct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E5D3B3] to-[#F5B942] transition-[width] duration-500 ease-out"
                  style={{ width: `${showPct}%` }}
                />
              </div>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {parts.map((p) => (
                <li
                  key={p.label}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-2 text-xs"
                >
                  <span className="text-slate-500">{p.label}</span>
                  <span className="font-semibold tabular-nums text-slate-200">{p.score}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Your reach */}
          {isAthlete ? (
            <section className="ui-surface p-5 sm:p-6 md:p-7">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Bio &amp; background</h3>
              <p className="ui-heading-section mt-1.5">Who you are</p>
              <p className="mt-1 text-sm text-slate-600">Short story businesses read before they DM you.</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={ext.bio}
                    onChange={(e) => setExt((x) => ({ ...x, bio: e.target.value }))}
                    className="premium-input min-h-[5rem] w-full px-4 py-2.5 text-sm"
                    placeholder="What you play, your audience, the kind of brands you like."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="sports">
                      Sports
                    </label>
                    <input
                      id="sports"
                      value={ext.sports}
                      onChange={(e) => setExt((x) => ({ ...x, sports: e.target.value }))}
                      className="premium-input w-full px-4 py-2.5 text-sm"
                      placeholder="e.g. Football — WR"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="location">
                      Location
                    </label>
                    <input
                      id="location"
                      value={ext.location}
                      onChange={(e) => setExt((x) => ({ ...x, location: e.target.value }))}
                      className="premium-input w-full px-4 py-2.5 text-sm"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="ui-surface p-5 sm:p-6 md:p-7" id="socials">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Your reach</h3>
            <p className="ui-heading-section mt-1.5">Socials &amp; visibility</p>
            <p className="mt-1 text-sm text-slate-600">Businesses use this to evaluate you.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="ig">
                  Instagram handle
                </label>
                <input
                  id="ig"
                  value={reach.instagram}
                  onChange={(e) => setReach((r) => ({ ...r, instagram: e.target.value }))}
                  placeholder="@yourname"
                  className="premium-input w-full px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="tt">
                  TikTok handle
                </label>
                <input
                  id="tt"
                  value={reach.tiktok}
                  onChange={(e) => setReach((r) => ({ ...r, tiktok: e.target.value }))}
                  placeholder="@yourname"
                  className="premium-input w-full px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="fol">
                  Followers (est.)
                </label>
                <input
                  id="fol"
                  value={reach.followers}
                  onChange={(e) => setReach((r) => ({ ...r, followers: e.target.value }))}
                  placeholder="e.g. 24.5k"
                  className="premium-input w-full px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Core account */}
          <section className="ui-surface p-5 sm:p-6 md:p-7" id="account-identity">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Account</h3>
            <p className="ui-heading-section mt-1.5">Identity</p>
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="premium-input w-full px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">Email</span>
                <input disabled value={email} readOnly className="w-full cursor-not-allowed rounded-xl border border-white/8 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-500" />
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-600">Role</span>
                <input
                  disabled
                  readOnly
                  value={role === "athlete" ? "Athlete" : "Business"}
                  className="w-full cursor-not-allowed rounded-xl border border-white/8 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary mt-6 min-w-[10rem] transition-transform duration-200 active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </section>
        </form>

        {/* Right column: snapshot + CTA */}
        <div className="space-y-6 sm:space-y-7">
          <section className="ui-surface p-5 sm:p-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Performance snapshot</h3>
            <p className="ui-heading-section mt-1.5">Deal momentum</p>
            <p className="mt-1 text-xs text-slate-500">Illustrative — your live stats grow as you use Oppurtunity.</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="flex items-center gap-2 text-slate-500">
                  <Target className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wide">Deals</span>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums text-slate-100">{stats.deals} completed</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="flex items-center gap-2 text-slate-500">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wide">Earnings</span>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums text-slate-100">
                  ${stats.earnings.toLocaleString("en-US")}
                </p>
                <p className="text-xs text-slate-500">
                  this week ${Math.max(75, Math.round(stats.earnings * 0.12)).toLocaleString()} · lifetime total
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="flex items-center gap-2 text-slate-500">
                  <Percent className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wide">Response rate</span>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-700">{stats.responseRate}%</p>
                <p className="text-xs text-slate-500">to new threads (demo)</p>
              </div>
              <div className="rounded-2xl border border-[#9B51E0]/35 bg-[#9B51E0]/[0.08] p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="flex items-center gap-2 text-violet-200">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">Momentum</span>
                </div>
                <p className="mt-2 text-xl font-bold text-violet-100">
                  Top {Math.max(12, 28 - Math.round(stats.responseRate / 7))}% this week
                </p>
                <p className="text-xs text-violet-200/80">3 deals completed this week streak</p>
              </div>
            </div>
          </section>

          {!proMember && isAthlete ? (
            <section className="overflow-hidden rounded-[var(--radius-xl)] border border-amber-200/50 bg-gradient-to-br from-amber-50/95 to-white p-5 text-center shadow-sm sm:p-6">
              <Sparkles className="mx-auto h-6 w-6 text-amber-600" />
              <p className="ui-heading-section mt-3">Want better deals?</p>
              <p className="mt-1.5 text-sm text-slate-600">Upgrade to attract higher-priority matches and Pro tools.</p>
              <Link
                href="/billing"
                className="btn-primary mt-4 inline-flex w-full max-w-xs justify-center gap-1.5 transition-transform duration-200 active:scale-[0.99] sm:w-auto"
              >
                Upgrade to Pro
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </section>
          ) : null}

          <div className="ui-surface flex items-center gap-3 p-4 sm:p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50">
              <UserRound className="h-5 w-5 text-amber-800" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">This is your system</p>
              <p className="text-xs text-slate-500">Identity, reach, and deals — in one place.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
