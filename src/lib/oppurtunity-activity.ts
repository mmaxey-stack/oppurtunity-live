/**
 * Client-only activity: local notifications, mock inbox counts, and cross-screen sync
 * (no server/API changes — used for UI realism and connected flows).
 */

export const ACTIVITY_EVENT = "oppurtunity-activity";

const LOCAL_NOTIF_KEY = "oppurtunity-local-notifications";
const NOTIF_SEED_KEY = "oppurtunity-notifs-seeded-v4";
const NOTIF_SEED_KEY_BUSINESS = "oppurtunity-notifs-seeded-business-v1";
const MOCK_INBOX_UNREAD_KEY = "oppurtunity-mock-inbox-unread";
const ACCEPTED_MOCK_DEALS_KEY = "opp-accepted-mock-deals";
const THREAD_EXTRAS_KEY = "opp-mock-thread-extras";

export type StoredThreadLine = {
  id: string;
  from: "business" | "user";
  body: string;
  createdAt: string;
};

export type LocalNotifKind = "deal_match" | "message" | "deal_accepted" | "deal_update" | "payment";

export type LocalNotification = {
  id: string;
  user_id: string;
  kind: LocalNotifKind;
  title: string;
  detail: string;
  created_at: string;
  read: boolean;
  href?: string;
  dealKey?: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function dispatchActivity() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT));
}

export function getLocalNotifications(): LocalNotification[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_NOTIF_KEY) ?? "[]") as LocalNotification[];
  } catch {
    return [];
  }
}

function setAllLocal(list: LocalNotification[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(list));
  dispatchActivity();
}

/** Surface count for AppShell badges (unread only). */
export function getLocalUnreadNotifCount(): number {
  return getLocalNotifications().filter((n) => !n.read).length;
}

export function setMockInboxUnreadCount(count: number) {
  if (!canUseStorage()) return;
  localStorage.setItem(MOCK_INBOX_UNREAD_KEY, String(Math.max(0, count)));
  dispatchActivity();
}

export function getMockInboxUnreadCount(): number {
  if (!canUseStorage()) return 0;
  return Number(localStorage.getItem(MOCK_INBOX_UNREAD_KEY) ?? "0") || 0;
}

export function getAcceptedMockDealKeys(): string[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(ACCEPTED_MOCK_DEALS_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function isMockDealAccepted(dealKey: string): boolean {
  return getAcceptedMockDealKeys().includes(dealKey);
}

export function getMockThreadExtras(): Record<string, StoredThreadLine[]> {
  if (!canUseStorage()) return {};
  try {
    return JSON.parse(localStorage.getItem(THREAD_EXTRAS_KEY) ?? "{}") as Record<string, StoredThreadLine[]>;
  } catch {
    return {};
  }
}

export function appendMockThreadLine(threadId: string, line: StoredThreadLine) {
  if (!canUseStorage()) return;
  const all = { ...getMockThreadExtras() };
  const cur = all[threadId] ?? [];
  if (cur.some((l) => l.id === line.id)) return;
  all[threadId] = [...cur, line];
  localStorage.setItem(THREAD_EXTRAS_KEY, JSON.stringify(all));
  dispatchActivity();
}

export function addLocalNotification(
  n: {
    id?: string;
    kind: LocalNotifKind;
    title: string;
    detail: string;
    href?: string;
    dealKey?: string;
    read?: boolean;
  },
  userIdForCompat: string,
) {
  if (!canUseStorage()) return;
  const list = getLocalNotifications();
  const item: LocalNotification = {
    id: n.id ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    user_id: userIdForCompat,
    kind: n.kind,
    title: n.title,
    detail: n.detail,
    created_at: new Date().toISOString(),
    read: n.read ?? false,
    href: n.href,
    dealKey: n.dealKey,
  };
  setAllLocal([item, ...list]);
}

export function addAcceptedMockDeal(
  dealKey: string,
  userId: string,
  title: string,
  businessName: string,
  messageThreadId?: string,
) {
  if (!canUseStorage()) return;
  const cur = new Set(getAcceptedMockDealKeys());
  if (cur.has(dealKey)) return;
  cur.add(dealKey);
  localStorage.setItem(ACCEPTED_MOCK_DEALS_KEY, JSON.stringify([...cur]));
  if (messageThreadId) {
    appendMockThreadLine(messageThreadId, {
      id: `accept-line-${dealKey}`,
      from: "business",
      body: `You’re in for “${title}.” This deal is now in your Active deals — coordinate timing here anytime.`,
      createdAt: new Date().toISOString(),
    });
  }
  addLocalNotification(
    {
      kind: "deal_accepted",
      title: "Deal accepted",
      detail: `You accepted ${title} with ${businessName} — it’s in your active deals.`,
      href: "/marketplace#active-deals",
    },
    userId,
  );
  dispatchActivity();
}

export function markLocalNotificationRead(id: string) {
  if (!canUseStorage()) return;
  const list = getLocalNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  setAllLocal(list);
}

/**
 * One-time sample notifications so the feed never feels empty on first visit.
 */
export function ensureSeedLocalNotifications(userId: string) {
  if (!canUseStorage() || localStorage.getItem(NOTIF_SEED_KEY)) return;

  const now = Date.now();
  const seed: LocalNotification[] = [
    {
      id: "seed-expiring-soon",
      user_id: userId,
      kind: "deal_update",
      title: "Deal expiring soon",
      detail: "🔥 Deal expires in 2h — lock your slot before it closes.",
      created_at: new Date(now - 0.2 * 3600_000).toISOString(),
      read: false,
      href: "/marketplace",
    },
    {
      id: "seed-selected",
      user_id: userId,
      kind: "deal_accepted",
      title: "You’ve been selected",
      detail: "💰 You’ve been selected for a $125 campaign — confirm in messages.",
      created_at: new Date(now - 0.3 * 3600_000).toISOString(),
      read: false,
      href: "/messages",
    },
    {
      id: "seed-near-you",
      user_id: userId,
      kind: "deal_match",
      title: "New deal near you",
      detail: "New local deal just dropped in your market — first movers get priority.",
      created_at: new Date(now - 0.35 * 3600_000).toISOString(),
      read: false,
      href: "/marketplace",
    },
    {
      id: "seed-profile-view",
      user_id: userId,
      kind: "deal_update",
      title: "Profile activity",
      detail: "Nut House viewed your profile",
      created_at: new Date(now - 0.4 * 3600_000).toISOString(),
      read: false,
      href: "/profile",
    },
    {
      id: "seed-deal-600",
      user_id: userId,
      kind: "deal_match",
      title: "New $600 deal",
      detail: "New $600 deal available — Fuel Perform supplement campaign",
      created_at: new Date(now - 1.1 * 3600_000).toISOString(),
      read: false,
      href: "/marketplace#deal-mock-fuel-perform",
      dealKey: "mock-fuel-perform",
    },
    {
      id: "seed-prime-msg",
      user_id: userId,
      kind: "message",
      title: "Message from Prime Gym",
      detail: "Prime Hydration Gym: “Post by Friday and tag us.”",
      created_at: new Date(now - 1.4 * 3600_000).toISOString(),
      read: false,
      href: "/messages?thread=mock-thread-prime-hydration",
    },
    {
      id: "seed-pro-insight",
      user_id: userId,
      kind: "deal_update",
      title: "Pro insight unlocked",
      detail: "Faster replies this week = higher match scores on new deals.",
      created_at: new Date(now - 2.2 * 3600_000).toISOString(),
      read: true,
      href: "/investing",
    },
    {
      id: "seed-deal-match",
      user_id: userId,
      kind: "deal_match",
      title: "New Deal Match",
      detail: "Nightlife collab @ Nut House — $500 (Austin)",
      created_at: new Date(now - 2.5 * 3600_000).toISOString(),
      read: false,
      href: "/marketplace#deal-mock-nut-house",
      dealKey: "mock-nut-house",
    },
    {
      id: "seed-new-msg",
      user_id: userId,
      kind: "message",
      title: "New message",
      detail: "Nut House sent you a message about this weekend’s event",
      created_at: new Date(now - 2.8 * 3600_000).toISOString(),
      read: false,
      href: "/messages?thread=mock-thread-nut-house",
    },
    {
      id: "seed-deal-upd",
      user_id: userId,
      kind: "deal_update",
      title: "Deal update",
      detail: "Reminder: night promo window closes Friday",
      created_at: new Date(now - 3.2 * 3600_000).toISOString(),
      read: true,
      href: "/messages?thread=mock-thread-nut-house",
    },
    {
      id: "seed-payment",
      user_id: userId,
      kind: "payment",
      title: "Payout pending",
      detail: "$500 payout pending from Nut House — confirm deliverables in thread",
      created_at: new Date(now - 26 * 3600_000).toISOString(),
      read: false,
      href: "/messages?thread=mock-thread-nut-house",
    },
    {
      id: "seed-accepted-dj",
      user_id: userId,
      kind: "deal_accepted",
      title: "You accepted DJ Night Promo",
      detail: "Nightlife collab @ Nut House is in your active deals — message the venue to lock time.",
      created_at: new Date(now - 4.1 * 3600_000).toISOString(),
      read: true,
      href: "/marketplace#active-deals",
    },
  ];

  const existing = new Set(getLocalNotifications().map((n) => n.id));
  const toAdd = seed.filter((n) => !existing.has(n.id));
  if (toAdd.length) {
    setAllLocal([...toAdd, ...getLocalNotifications()]);
  }
  localStorage.setItem(NOTIF_SEED_KEY, "1");
  dispatchActivity();
}

/**
 * One-time business-oriented sample notifications (first visit as a brand).
 */
export function ensureSeedBusinessLocalNotifications(userId: string) {
  if (!canUseStorage() || localStorage.getItem(NOTIF_SEED_KEY_BUSINESS)) return;

  const now = Date.now();
  const seed: LocalNotification[] = [
    {
      id: "seed-biz-accepts",
      user_id: userId,
      kind: "deal_accepted",
      title: "3 athletes accepted your deal",
      detail: "New partners are live — nudge them in messages to lock deliverables this week.",
      created_at: new Date(now - 0.3 * 3600_000).toISOString(),
      read: false,
      href: "/messages",
    },
    {
      id: "seed-biz-matt",
      user_id: userId,
      kind: "message",
      title: "Matt Maxey messaged you",
      detail: "“Thursday morning works — I’ll bring a teammate too.”",
      created_at: new Date(now - 0.8 * 3600_000).toISOString(),
      read: false,
      href: "/messages?thread=mock-biz-thread-elite-cuts",
    },
    {
      id: "seed-biz-trending",
      user_id: userId,
      kind: "deal_update",
      title: "Your deal is trending",
      detail: "Campaign views are up 12% vs yesterday — follow up in messages while interest is high.",
      created_at: new Date(now - 1.2 * 3600_000).toISOString(),
      read: true,
      href: "/marketplace#featured",
    },
    {
      id: "seed-biz-completed",
      user_id: userId,
      kind: "deal_update",
      title: "2 athletes completed a campaign",
      detail: "Proof of post is in thread — mark payouts when you verify deliverables.",
      created_at: new Date(now - 1.6 * 3600_000).toISOString(),
      read: false,
      href: "/messages",
    },
  ];

  const existing = new Set(getLocalNotifications().map((n) => n.id));
  const toAdd = seed.filter((n) => !existing.has(n.id));
  if (toAdd.length) {
    setAllLocal([...toAdd, ...getLocalNotifications()]);
  }
  localStorage.setItem(NOTIF_SEED_KEY_BUSINESS, "1");
  dispatchActivity();
}
