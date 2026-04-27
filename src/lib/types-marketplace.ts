import type { PremiumDealSpotlight } from "@/lib/marketplace-premium-types";

export type UrgencyTag = "HOT" | "NEW" | "EASY" | "TRENDING" | "ENDING_SOON" | "OPEN" | "HIGH_MATCH";

/** UI-only campaign band (mock + inferred for DB rows). */
export type DealTier = "entry" | "mid" | "high";

export type DealFomo = {
  /** e.g. “Only 3 athletes selected” */
  slotsLeft?: number;
  /** hours until window closes */
  expiresInHours?: number;
  /** live viewer signal */
  viewingCount?: number;
};

export type MockDealForMarketplace = {
  id: string;
  title: string;
  businessName: string;
  location: string;
  category: string;
  payout: number;
  payoutLabel: string;
  description: string;
  requirements: string;
  phone: string;
  instagram: string;
  website?: string;
  tags: UrgencyTag[];
  easyTask: boolean;
  /** Override generic match copy (AI-style bullets). */
  matchReasons?: string[];
  /** Mock inbox thread id for “Apply” → messages */
  messageThreadId?: string;
  /** Human-readable window, e.g. "This week — event night Fri" */
  timeline?: string;
  tier: DealTier;
  fomo?: DealFomo;
  premiumSpotlight?: PremiumDealSpotlight;
};

export type DisplayDeal = {
  key: string;
  isMock: boolean;
  title: string;
  businessName: string;
  location: string;
  category: string;
  payoutLabel: string;
  payoutSort: number;
  description: string;
  requirements: string;
  phone: string | null;
  instagram: string | null;
  website: string | null;
  tags: UrgencyTag[];
  easyTask: boolean;
  matchReasons: string[];
  /** Real-time mock thread id (messages) */
  messageThreadId?: string;
  /** Campaign / deliverable window (mock + display) */
  timeline?: string | null;
  /** real Supabase deal id for accept form */
  realId?: string;
  /** For business viewer: which business owns this open listing (DB deals only) */
  ownerBusinessId?: string;
  status?: "open" | "accepted" | "completed";
  athleteId?: string | null;
  tier: DealTier;
  fomo?: DealFomo;
  premiumSpotlight?: PremiumDealSpotlight;
};
