"use client";

export type DealLadderTier = "entry" | "growth" | "premium" | "nil";

export type GrowthState = {
  referralCount: number;
  invitedTeammates: number;
  acceptedDeals: number;
  completedDeals: number;
  avgResponseMins: number;
  weeklyEarnings: number;
  lifetimeEarnings: number;
};

const GROWTH_KEY = "opp-growth-loop-v1";

const DEFAULT_STATE: GrowthState = {
  referralCount: 1,
  invitedTeammates: 2,
  acceptedDeals: 3,
  completedDeals: 2,
  avgResponseMins: 19,
  weeklyEarnings: 225,
  lifetimeEarnings: 1200,
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getGrowthState(): GrowthState {
  if (!canUseStorage()) return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(GROWTH_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<GrowthState>) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function setGrowthState(next: GrowthState) {
  if (!canUseStorage()) return;
  localStorage.setItem(GROWTH_KEY, JSON.stringify(next));
}

export function updateGrowthState(patch: Partial<GrowthState>) {
  const cur = getGrowthState();
  const next = { ...cur, ...patch };
  setGrowthState(next);
  return next;
}

export function incrementAcceptedDeal(payout: number) {
  const cur = getGrowthState();
  const next = {
    ...cur,
    acceptedDeals: cur.acceptedDeals + 1,
    weeklyEarnings: cur.weeklyEarnings + Math.max(25, Math.round(payout * 0.4)),
    lifetimeEarnings: cur.lifetimeEarnings + Math.max(25, Math.round(payout * 0.55)),
  };
  setGrowthState(next);
  return next;
}

export function registerReferral(count = 1) {
  const cur = getGrowthState();
  const next = {
    ...cur,
    referralCount: cur.referralCount + count,
    invitedTeammates: cur.invitedTeammates + count,
  };
  setGrowthState(next);
  return next;
}

export function getMomentumScore(state = getGrowthState()): number {
  const responseScore = Math.max(0, 35 - Math.min(30, Math.round(state.avgResponseMins / 2)));
  const dealScore = Math.min(30, state.acceptedDeals * 3 + state.completedDeals * 2);
  const activityScore = Math.min(20, state.invitedTeammates * 2 + state.referralCount * 3);
  const earningsScore = Math.min(15, Math.round(state.weeklyEarnings / 40));
  return Math.max(10, Math.min(100, responseScore + dealScore + activityScore + earningsScore));
}

export function getUnlockedTier(state = getGrowthState()): DealLadderTier {
  const momentum = getMomentumScore(state);
  if (momentum >= 80 && state.referralCount >= 5) return "nil";
  if (momentum >= 62 && state.completedDeals >= 3) return "premium";
  if (momentum >= 42) return "growth";
  return "entry";
}

export function tierLabel(tier: DealLadderTier): string {
  if (tier === "entry") return "Entry";
  if (tier === "growth") return "Growth";
  if (tier === "premium") return "Premium";
  return "NIL brand deals";
}

export function getBadges(state = getGrowthState()): string[] {
  const badges: string[] = [];
  if (state.completedDeals >= 2) badges.push("Verified athlete");
  if (state.referralCount >= 3) badges.push("Network builder");
  if (getMomentumScore(state) >= 70) badges.push("Top performer");
  return badges;
}

