export type UserRole = "athlete" | "business" | "investor";

export type SubscriptionPlan = "free" | "basic" | "pro" | "elite";

export interface AppUser {
  id: string;
  full_name: string;
  role: UserRole;
  email: string;
  created_at: string;
  profile_strength: number;
  earnings_total: number;
  subscription_plan: SubscriptionPlan;
  settings: Record<string, unknown>;
}

export interface Deal {
  id: string;
  title: string;
  business_id: string;
  businessName: string;
  athlete_id: string | null;
  payout: number;
  sport: string;
  location: string;
  summary: string;
  created_at: string;
  status: "open" | "accepted" | "completed";
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  senderName: string;
  preview: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  detail: string;
  created_at: string;
  read: boolean;
  type?: "deal" | "message" | "payout";
}

export interface Plan {
  id: "basic" | "pro" | "onboarding" | "elite";
  name: string;
  priceLabel: string;
  description: string;
  stripePriceEnv: string;
}
