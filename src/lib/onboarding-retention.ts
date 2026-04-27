"use client";

import { ACTIVITY_EVENT } from "@/lib/oppurtunity-activity";

const ONBOARDING_KEY = "opp-athlete-onboarding-v1";

export type OnboardingProfile = {
  sportRole: string;
  audience: string;
  location: string;
  instagram: string;
  goal: "quick_money" | "long_term_income" | "brand_deals" | "learn_investing" | null;
  firstActionDone: boolean;
};

const DEFAULT_PROFILE: OnboardingProfile = {
  sportRole: "",
  audience: "",
  location: "",
  instagram: "",
  goal: null,
  firstActionDone: false,
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getOnboardingProfile(): OnboardingProfile {
  if (!canUseStorage()) return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<OnboardingProfile>) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function setOnboardingProfile(profile: OnboardingProfile) {
  if (!canUseStorage()) return;
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(profile));
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT));
}

export function isOnboardingComplete() {
  const p = getOnboardingProfile();
  return Boolean(p.sportRole.trim() && p.location.trim() && p.goal && p.firstActionDone);
}

