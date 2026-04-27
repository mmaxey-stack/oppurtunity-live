import type { MockInboxThread } from "@/lib/messages-mock-data";

/** Inbox order for the business view (highest signal first). */
export const MOCK_BUSINESS_THREAD_ORDER = [
  "mock-biz-thread-elite-cuts",
  "mock-biz-thread-cle-coffee",
  "mock-biz-thread-nut-house",
] as const;

/**
 * Realistic B↔athlete mock threads (business is always `from: "business"`; athlete replies are `from: "user"`).
 * Perspective is flipped in the client when `role === "business"`.
 */
export const MOCK_BUSINESS_INBOX: MockInboxThread[] = [
  {
    id: "mock-biz-thread-elite-cuts",
    businessName: "Elite Cuts Barbershop",
    athleteName: "Matt Maxey",
    dealTitle: "Game-day cut + story + tag",
    payout: "$50 + service",
    payoutAmount: 50,
    requirements: "In-shop before/after, tag @elitecuts, post within 48h",
    phone: "(216) 555-0142",
    instagram: "@elitecutsbshop",
    initialStatus: "In Progress",
    messages: [
      {
        id: "ec-1",
        from: "business",
        body: "Hey Matt — we’d love to get you in this week. If you can post a quick before/after + tag us, we’ll cover your cut + $50. Let me know what day works.",
        createdAt: "2026-04-23T14:10:00Z",
      },
      {
        id: "ec-2",
        from: "user",
        body: "I’m free Thursday morning. I’ll bring a teammate too.",
        createdAt: "2026-04-23T14:22:00Z",
      },
      {
        id: "ec-3",
        from: "business",
        body: "Love it — 10am work? I’ll have both chairs blocked under your name. Drop your IG handle in here when you go live.",
        createdAt: "2026-04-23T14:28:00Z",
      },
    ],
  },
  {
    id: "mock-biz-thread-cle-coffee",
    businessName: "CLE Coffee Co.",
    athleteName: "Jake Wilson",
    dealTitle: "Morning rush story push",
    payout: "$25 + product",
    payoutAmount: 25,
    requirements: "Story between 7–10am, tag the shop + mention deal",
    phone: "(216) 555-0901",
    instagram: "@clecoffeeco",
    initialStatus: "Accepted",
    messages: [
      {
        id: "cc-1",
        from: "business",
        body: "We’re pushing a morning rush campaign. If you can post a story between 7–10am we’ll pay $25 + free drinks for your group.",
        createdAt: "2026-04-22T12:00:00Z",
      },
      {
        id: "cc-2",
        from: "user",
        body: "Locked. I can hit 7:15am and tag the corner shot on Euclid. Send the drink menu.",
        createdAt: "2026-04-22T12:08:00Z",
      },
    ],
  },
  {
    id: "mock-biz-thread-nut-house",
    businessName: "Nut House",
    athleteName: "Chris Lane",
    dealTitle: "Friday pack-out crowd",
    payout: "$100",
    payoutAmount: 100,
    requirements: "Bring 10+ people, tracked at the door, story highlight",
    phone: "(512) 555-9821",
    instagram: "@nuthouseatx",
    initialStatus: "Pending",
    messages: [
      {
        id: "nh-1",
        from: "business",
        body: "We need athletes to help pack Friday night. $100 if you bring 10+ people. We’ll track at the door — tell me your headcount by Thursday midnight.",
        createdAt: "2026-04-23T10:00:00Z",
      },
      {
        id: "nh-2",
        from: "user",
        body: "I can bring 12 — mix of my roster + friends. I’ll need a 10pm go-live window to story it.",
        createdAt: "2026-04-23T10:12:00Z",
      },
      {
        id: "nh-3",
        from: "business",
        body: "10pm works — we’ll comp your cover + put you in the list with +12 at the door.",
        createdAt: "2026-04-23T10:18:00Z",
      },
    ],
  },
];
