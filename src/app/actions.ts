"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/auth";
import type { AppSettingsState } from "@/lib/user-settings";

async function createNotification(
  userId: string,
  title: string,
  detail: string,
  type: "deal" | "message" | "payout" = "deal",
) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    detail,
    read: false,
    type,
  });
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth");
}

export async function createDealAction(formData: FormData) {
  const { supabase, user } = await requireCurrentUser();
  if (user.role !== "business") return;

  const title = String(formData.get("title") ?? "");
  const payout = Number(formData.get("payout") ?? 0);
  const sport = String(formData.get("sport") ?? "");
  const location = String(formData.get("location") ?? "");
  const summary = String(formData.get("summary") ?? "");

  if (!title || !payout || !sport || !location || !summary) return;

  await supabase.from("deals").insert({
    title,
    payout,
    sport,
    location,
    summary,
    business_id: user.id,
    status: "open",
    business_name: user.full_name,
    description: summary,
    requirements:
      "Message after accepting to align on deliverables, posting dates, and usage rights.",
  });

  revalidatePath("/marketplace");
  revalidatePath("/");
}

export async function acceptDealAction(formData: FormData) {
  const { supabase, user } = await requireCurrentUser();
  if (user.role !== "athlete") return;

  const dealId = String(formData.get("dealId") ?? "");
  if (!dealId) return;

  const { data: deal } = await supabase
    .from("deals")
    .select("id, title, business_id, athlete_id, status")
    .eq("id", dealId)
    .single<{
      id: string;
      title: string;
      business_id: string;
      athlete_id: string | null;
      status: "open" | "accepted" | "completed";
    }>();

  if (!deal || deal.status !== "open" || deal.athlete_id) return;

  const { error: appErr } = await supabase.from("deal_applications").insert({
    user_id: user.id,
    deal_id: dealId,
    status: "accepted",
  });
  if (appErr) {
    console.error("deal_applications insert", appErr);
    return;
  }

  const { error: updErr } = await supabase
    .from("deals")
    .update({ status: "accepted", athlete_id: user.id })
    .eq("id", dealId)
    .is("athlete_id", null);

  if (updErr) {
    console.error("deal update", updErr);
    return;
  }

  await createNotification(
    user.id,
    "Deal accepted",
    `You accepted "${deal.title}". Message the business to lock deliverables.`,
    "deal",
  );
  await createNotification(
    deal.business_id,
    "Deal accepted",
    `${user.full_name} accepted "${deal.title}".`,
    "deal",
  );

  await supabase.from("messages").insert({
    sender_id: user.id,
    receiver_id: deal.business_id,
    body: `Accepted: I'm ready to coordinate on "${deal.title}" — let's align on deliverables and timeline.`,
    deal_id: dealId,
    read_by_receiver: false,
  });

  revalidatePath("/marketplace");
  revalidatePath("/");
  revalidatePath("/notifications");
  revalidatePath("/messages");
}

export async function sendMessageAction(formData: FormData) {
  const { supabase, user } = await requireCurrentUser();
  const receiverId = String(formData.get("receiverId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const dealIdRaw = String(formData.get("dealId") ?? "").trim();
  if (!receiverId || !body) return;

  const insert: {
    sender_id: string;
    receiver_id: string;
    body: string;
    deal_id?: string;
    read_by_receiver: boolean;
  } = {
    sender_id: user.id,
    receiver_id: receiverId,
    body,
    read_by_receiver: false,
  };
  if (dealIdRaw) insert.deal_id = dealIdRaw;

  await supabase.from("messages").insert(insert);

  await createNotification(
    receiverId,
    "New message",
    `${user.full_name}: ${body.slice(0, 80)}${body.length > 80 ? "…" : ""}`,
    "message",
  );

  revalidatePath("/messages");
  revalidatePath("/notifications");
}

export async function markMessagesReadForDealAction(dealId: string) {
  const { supabase, user } = await requireCurrentUser();
  if (!dealId) return;
  await supabase
    .from("messages")
    .update({ read_by_receiver: true })
    .eq("deal_id", dealId)
    .eq("receiver_id", user.id)
    .eq("read_by_receiver", false);
  revalidatePath("/messages");
}

export async function markMessagesReadForPeerAction(peerId: string) {
  const { supabase, user } = await requireCurrentUser();
  if (!peerId) return;
  await supabase
    .from("messages")
    .update({ read_by_receiver: true })
    .eq("receiver_id", user.id)
    .eq("sender_id", peerId)
    .is("deal_id", null)
    .eq("read_by_receiver", false);
  revalidatePath("/messages");
}

export async function markNotificationReadAction(notificationId: string) {
  const { supabase, user } = await requireCurrentUser();
  await supabase.from("notifications").update({ read: true }).eq("id", notificationId).eq("user_id", user.id);
  revalidatePath("/notifications");
  revalidatePath("/");
}

export async function completeDealAction(formData: FormData) {
  const { supabase, user } = await requireCurrentUser();
  const dealId = String(formData.get("dealId") ?? "");
  if (!dealId) return;

  const { data: deal } = await supabase
    .from("deals")
    .select("id, business_id, athlete_id, title, payout, status")
    .eq("id", dealId)
    .single<{
      id: string;
      business_id: string;
      athlete_id: string | null;
      title: string;
      payout: number;
      status: string;
    }>();

  if (!deal || !deal.athlete_id) return;
  if (deal.status === "completed") return;
  if (deal.business_id !== user.id && deal.athlete_id !== user.id) return;

  const { error: dErr } = await supabase.from("deals").update({ status: "completed" }).eq("id", dealId);
  if (dErr) {
    console.error("complete deal", dErr);
    return;
  }

  const amount = Number(deal.payout);
  const { error: pErr } = await supabase.from("payouts").insert({
    user_id: deal.athlete_id,
    deal_id: dealId,
    amount,
    status: "pending",
  });
  if (pErr) console.error("payout insert", pErr);

  if (deal.athlete_id) {
    await createNotification(deal.athlete_id, "Payout pending", `Your payout for "${deal.title}" is processing.`, "payout");
  }
  if (deal.business_id) {
    await createNotification(
      deal.business_id,
      "Deal completed",
      `"${deal.title}" is marked complete. Athlete payout is pending.`,
      "payout",
    );
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/messages");
  revalidatePath("/notifications");
}

export async function markPayoutPaidAction(formData: FormData) {
  const { supabase, user } = await requireCurrentUser();
  if (user.role !== "business") return;
  const payoutId = String(formData.get("payoutId") ?? "");
  if (!payoutId) return;

  const { data: p } = await supabase
    .from("payouts")
    .select("id, user_id, deal_id, amount, status")
    .eq("id", payoutId)
    .single();
  if (!p || p.status === "paid") return;

  const { data: deal } = await supabase
    .from("deals")
    .select("business_id, athlete_id, title")
    .eq("id", p.deal_id)
    .single();
  if (!deal || deal.business_id !== user.id) return;

  const amount = Number(p.amount);
  await supabase.from("payouts").update({ status: "paid" }).eq("id", payoutId);

  const { data: athleteRow } = await supabase
    .from("users")
    .select("earnings_total")
    .eq("id", p.user_id)
    .single();
  const prev = athleteRow?.earnings_total != null ? Number(athleteRow.earnings_total) : 0;
  await supabase
    .from("users")
    .update({ earnings_total: prev + amount })
    .eq("id", p.user_id);

  if (deal.athlete_id) {
    await createNotification(
      deal.athlete_id,
      "Payout sent",
      `$${amount.toLocaleString()} for "${deal.title}" is marked paid.`,
      "payout",
    );
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/notifications");
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, user } = await requireCurrentUser();
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) return;

  const { count: dealN } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("athlete_id", user.id)
    .in("status", ["accepted", "completed"]);

  const { count: msgN } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  let strength = 35;
  if (fullName.length > 2) strength += 20;
  if (user.email) strength += 10;
  if ((dealN ?? 0) > 0) strength += 20;
  if ((msgN ?? 0) > 0) strength += 15;
  strength = Math.min(100, strength);

  await supabase
    .from("users")
    .update({ full_name: fullName, profile_strength: strength })
    .eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/");
}

export async function saveUserSettingsAction(settings: AppSettingsState) {
  const { supabase, user } = await requireCurrentUser();
  await supabase.from("users").update({ settings: settings as unknown as Record<string, unknown> }).eq("id", user.id);
  revalidatePath("/settings");
}
