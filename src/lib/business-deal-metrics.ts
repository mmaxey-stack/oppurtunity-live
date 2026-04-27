/**
 * UI-only, deterministic "live" campaign metrics (seeded from deal key + payout).
 */

export type BusinessLiveMetrics = {
  views: number;
  accepts: number;
  footTraffic: number;
  hoursLeft: number;
  roiLow: number;
  roiHigh: number;
};

function hash32(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export function getBusinessLiveMetricsForDeal(
  key: string,
  payoutSort: number,
  isOwnListing: boolean,
): BusinessLiveMetrics {
  const h = hash32(key);
  const p = Math.max(25, payoutSort);
  const mult = isOwnListing ? 1.15 : 0.75;
  const views = Math.floor((18 + (h % 90)) * mult);
  const accepts = Math.max(0, Math.min(18, Math.floor((2 + (h % 9)) * (isOwnListing ? 1.1 : 0.65))));
  const footTraffic = Math.floor((8 + (h % 32)) * mult);
  const hoursLeft = 6 + (h % 40);
  const baseRoi = p * (2.2 + (h % 5) * 0.12);
  const spread = p * 0.85 + (h % 7) * 8;
  return {
    views,
    accepts,
    footTraffic,
    hoursLeft,
    roiLow: Math.floor(baseRoi * 0.4),
    roiHigh: Math.floor(baseRoi * 0.4 + spread),
  };
}
