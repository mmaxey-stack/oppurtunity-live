/** UI-only premium spotlight layouts for select mock deals. */
export type PremiumDealSpotlight = {
  variant: "alley-mac";
  /** Public path under /public */
  heroImage: string;
  headline: string;
  subtext: string;
  /** Short code shown large (e.g. SUMMER) */
  code: string;
  /** Line under the code, e.g. BOGO explanation */
  codeDescription: string;
  promoterName: string;
  promoterTag: string;
  /** ISO 8601 instant for countdown */
  endsAt: string;
  /** e.g. “🔥 23 Kent students used this deal today” */
  urgencyBar?: string;
  /** e.g. “Used by 47+ students this week” */
  socialProof?: string;
  /** Short redemption line under headline */
  redemptionLine?: string;
};

export const ALLEY_MAC_DEAL_KEY = "mock-alley-mac-ksu";
