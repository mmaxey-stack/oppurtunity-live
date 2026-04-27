import type { DealMessageStatus } from "@/lib/types-messages-mock";

export type MockThreadMessage = {
  id: string;
  from: "business" | "user";
  body: string;
  createdAt: string;
};

export type MockInboxThread = {
  id: string;
  /** If set, thread is shown in business inbox as a conversation with this athlete. */
  athleteName?: string;
  businessName: string;
  dealTitle: string;
  payout: string;
  payoutAmount: number;
  requirements: string;
  phone: string;
  instagram: string;
  website?: string;
  initialStatus: DealMessageStatus;
  messages: MockThreadMessage[];
};

export const MOCK_MESSAGE_THREADS: MockInboxThread[] = [
  {
    id: "mock-thread-alley-mac",
    businessName: "Alley Mac",
    dealTitle: "Alley Mac — BOGO specialty mac bowls",
    payout: "BOGO",
    payoutAmount: 85,
    requirements: "Code SUMMER or say Matthew sent me — in-store specialty bowls",
    phone: "(330) 548-9215",
    instagram: "@alleymackent",
    website: "https://alleymackent.com",
    initialStatus: "Accepted",
    messages: [
      {
        id: "am-1",
        from: "business",
        body: "Matt — thanks for locking this in with Oppurtunity. We’re ready to honor BOGO specialty bowls for your people. Code SUMMER at the register or they can say you sent them.",
        createdAt: "2026-04-26T15:00:00Z",
      },
      {
        id: "am-2",
        from: "user",
        body: "Confirmed — I accepted the Alley Mac deal on my Oppurtunity account. Excited to send the crew your way.",
        createdAt: "2026-04-26T15:08:00Z",
      },
      {
        id: "am-3",
        from: "business",
        body: "Love it. Show the staff the deal screen or the code and we’ll make it smooth at the counter.",
        createdAt: "2026-04-26T15:10:00Z",
      },
    ],
  },
  {
    id: "mock-thread-nut-house",
    businessName: "Nut House",
    dealTitle: "Nightlife promo @ Nut House",
    payout: "$500",
    payoutAmount: 500,
    requirements: "50+ guests, stories + reel, tag @nuthouseatx",
    phone: "(512) 555-9821",
    instagram: "@nuthouseatx",
    website: "https://nuthouse.example.com",
    initialStatus: "Pending",
    messages: [
      {
        id: "nut-1",
        from: "business",
        body: "Hey Matt, we’d love to get you in this weekend.",
        createdAt: "2026-04-22T16:00:00Z",
      },
      {
        id: "nut-2",
        from: "business",
        body: "Can you confirm attendance?",
        createdAt: "2026-04-22T16:05:00Z",
      },
      {
        id: "nut-3",
        from: "business",
        body: "Payment will be sent after event.",
        createdAt: "2026-04-22T16:10:00Z",
      },
    ],
  },
  {
    id: "mock-thread-north-thread",
    businessName: "North Thread Co.",
    dealTitle: "Spring drop — studio + street",
    payout: "$95",
    payoutAmount: 95,
    requirements: "Carousel + reel — tag @norththreadco",
    phone: "(216) 555-4480",
    instagram: "@norththreadco",
    initialStatus: "Pending",
    messages: [
      {
        id: "nt-1",
        from: "business",
        body: "Matt — your fits are clean. We want the spring drop on you before Friday if possible.",
        createdAt: "2026-04-22T18:30:00Z",
      },
      {
        id: "nt-2",
        from: "business",
        body: "We’ll overnight the box + a shot list. Quick question: film or photo heavy for you this week?",
        createdAt: "2026-04-22T18:35:00Z",
      },
    ],
  },
  {
    id: "mock-thread-prime-hydration",
    businessName: "Prime Hydration Gym",
    dealTitle: "Gym content sprint",
    payout: "$300",
    payoutAmount: 300,
    requirements: "Workout clip + tag @primehydrationgym",
    phone: "(216) 555-1142",
    instagram: "@primehydrationgym",
    initialStatus: "Pending",
    messages: [
      {
        id: "ph-1",
        from: "business",
        body: "Post by Friday and tag us.",
        createdAt: "2026-04-22T14:00:00Z",
      },
      {
        id: "ph-2",
        from: "business",
        body: "We’ll boost your content.",
        createdAt: "2026-04-22T14:04:00Z",
      },
    ],
  },
  {
    id: "mock-thread-campus-drip",
    businessName: "Campus Drip",
    dealTitle: "Campus fit check",
    payout: "$75",
    payoutAmount: 75,
    requirements: "Outfit post + tag @campusdrip",
    phone: "(440) 555-0202",
    instagram: "@campusdrip",
    initialStatus: "Pending",
    messages: [
      { id: "cd-1", from: "business", body: "Pick any 3 outfits.", createdAt: "2026-04-21T18:00:00Z" },
      { id: "cd-2", from: "business", body: "We’ll feature you.", createdAt: "2026-04-21T18:06:00Z" },
    ],
  },
  {
    id: "mock-thread-cle-coffee",
    businessName: "CLE Coffee Co.",
    dealTitle: "Coffee shop morning rush",
    payout: "$50",
    payoutAmount: 50,
    requirements: "1 IG story — @clecoffee",
    phone: "(216) 555-0101",
    instagram: "@clecoffee",
    initialStatus: "Pending",
    messages: [
      {
        id: "cc-1",
        from: "business",
        body: "Hey Matt — can you story between 7–9am this week? We’ll comp your drink.",
        createdAt: "2026-04-20T12:00:00Z",
      },
    ],
  },
  {
    id: "mock-thread-smoothie-bar",
    businessName: "Blend & Go",
    dealTitle: "Post-workout smoothie pair",
    payout: "$100",
    payoutAmount: 100,
    requirements: "2 posts, tag @blendgo.akron",
    phone: "(330) 555-8844",
    instagram: "@blendgo.akron",
    initialStatus: "Pending",
    messages: [
      {
        id: "sg-1",
        from: "business",
        body: "Loving your training content — want to run a two-part smoothie arc with us?",
        createdAt: "2026-04-19T20:00:00Z",
      },
    ],
  },
  {
    id: "mock-thread-elite-cuts",
    businessName: "Elite Cuts",
    dealTitle: "Barbershop line-out",
    payout: "$125",
    payoutAmount: 125,
    requirements: "Reel + referral code",
    phone: "(216) 555-3030",
    instagram: "@elitecuts",
    initialStatus: "Pending",
    messages: [
      { id: "ec-1", from: "business", body: "We’ll send a code + shot list today — 60s max.", createdAt: "2026-04-19T15:00:00Z" },
    ],
  },
  {
    id: "mock-thread-local-event",
    businessName: "Summit City Nights",
    dealTitle: "Local event — fill the room",
    payout: "$200",
    payoutAmount: 200,
    requirements: "2 hype posts + 20+ through the door",
    phone: "(440) 555-6622",
    instagram: "@summitcitynights",
    website: "https://summitcity.example.com",
    initialStatus: "Pending",
    messages: [
      { id: "le-1", from: "business", body: "Event night is penciled — you down to push the RSVP list?", createdAt: "2026-04-18T17:00:00Z" },
    ],
  },
  {
    id: "mock-thread-sports-bar",
    businessName: "The Post Sports Bar",
    dealTitle: "Game day bar takeover",
    payout: "$400",
    payoutAmount: 400,
    requirements: "Appearance + 2 stories + 1 post",
    phone: "(330) 555-7712",
    instagram: "@thepostakron",
    initialStatus: "Pending",
    messages: [
      {
        id: "sb-1",
        from: "business",
        body: "Matt — big game block next week. Can you anchor our pre-game crowd?",
        createdAt: "2026-04-18T20:00:00Z",
      },
    ],
  },
  {
    id: "mock-thread-fuel-perform",
    businessName: "Fuel Perform",
    dealTitle: "Short-form blitz",
    payout: "$600",
    payoutAmount: 600,
    requirements: "3 TikToks + link in bio",
    phone: "(800) 555-3301",
    instagram: "@fuelperform",
    website: "https://fuelperform.example.com",
    initialStatus: "Pending",
    messages: [
      {
        id: "ff-1",
        from: "business",
        body: "We’re looking for 3 high-retention clips. Ship roughs by EOW and we fast-track the $600.",
        createdAt: "2026-04-22T10:00:00Z",
      },
    ],
  },
];
