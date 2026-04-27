import type { DealTier, DisplayDeal, MockDealForMarketplace, UrgencyTag } from "@/lib/types-marketplace";

function tierFromPayout(payout: number): DealTier {
  if (payout < 100) return "entry";
  if (payout < 300) return "mid";
  return "high";
}

export type DbDealRow = {
  id: string;
  business_id: string;
  title: string;
  athlete_id: string | null;
  payout: number;
  sport: string;
  location: string;
  summary: string;
  status: "open" | "accepted" | "completed";
  created_at: string;
  business_name?: string | null;
  description?: string | null;
  requirements?: string | null;
  phone?: string | null;
  instagram?: string | null;
};

function matchCopy(): string[] {
  return [
    "Matches your sport and promo style",
    "High engagement potential on short-form",
    "Strong fit for your region",
  ];
}

function urgencyFromRow(createdAt: string): UrgencyTag[] {
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  const t: UrgencyTag[] = ["OPEN"];
  if (days < 5) t.unshift("NEW");
  return t;
}

export function mapMockToDisplay(m: MockDealForMarketplace): DisplayDeal {
  return {
    key: m.id,
    isMock: true,
    title: m.title,
    businessName: m.businessName,
    location: m.location,
    category: m.category,
    payoutLabel: m.payoutLabel,
    payoutSort: m.payout,
    description: m.description,
    requirements: m.requirements,
    phone: m.phone,
    instagram: m.instagram,
    website: m.website ?? null,
    tags: m.tags,
    easyTask: m.easyTask,
    matchReasons: m.matchReasons?.length ? m.matchReasons : matchCopy(),
    messageThreadId: m.messageThreadId,
    timeline: m.timeline ?? null,
    tier: m.tier,
    fomo: m.fomo,
    premiumSpotlight: m.premiumSpotlight,
  };
}

export function mapDbToDisplay(
  d: DbDealRow,
  businessName: string,
): DisplayDeal {
  const payoutN = Number(d.payout);
  const displayName = d.business_name?.trim() || businessName;
  const desc = (d.description ?? d.summary).trim();
  const req =
    d.requirements?.trim() ||
    "Message the business after you accept to lock deliverables, story dates, and usage rights.";
  return {
    key: `db-${d.id}`,
    isMock: false,
    ownerBusinessId: d.business_id,
    title: d.title,
    businessName: displayName,
    location: d.location,
    category: d.sport,
    payoutLabel: `$${payoutN.toLocaleString()}`,
    payoutSort: payoutN,
    description: desc,
    requirements: req,
    phone: d.phone ?? null,
    instagram: d.instagram ?? null,
    website: null,
    tags: urgencyFromRow(d.created_at),
    easyTask: d.summary.length < 140,
    matchReasons: matchCopy(),
    realId: d.id,
    status: d.status,
    athleteId: d.athlete_id,
    timeline: null,
    tier: tierFromPayout(payoutN),
  };
}
