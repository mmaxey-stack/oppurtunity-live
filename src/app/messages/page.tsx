import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/cards";
import { MessagesClient } from "@/components/messages/messages-client";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";
import type { UserRole } from "@/lib/types";

export default async function MessagesPage() {
  const { supabase, user } = await requireCurrentUser();
  const role = user.role as UserRole;
  const proMember = isProMember(user);

  const { data: peers } = await supabase
    .from("users")
    .select("id, full_name, role")
    .neq("id", user.id)
    .eq("role", role === "athlete" ? "business" : "athlete")
    .order("full_name", { ascending: true });

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, body, created_at, deal_id, read_by_receiver")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const dealIds = Array.from(
    new Set((messages ?? []).map((m) => m.deal_id).filter((id): id is string => Boolean(id))),
  );
  const { data: dealRows } =
    dealIds.length > 0
      ? await supabase
          .from("deals")
          .select("id, title, business_id, athlete_id, business_name, payout, status, summary")
          .in("id", dealIds)
      : { data: [] as { id: string; title: string; business_id: string; athlete_id: string | null; business_name: string | null; payout: number; status: string; summary: string }[] };

  const businessIds = Array.from(new Set((dealRows ?? []).map((d) => d.business_id)));
  const { data: bizUsers } =
    businessIds.length > 0
      ? await supabase.from("users").select("id, full_name").in("id", businessIds)
      : { data: [] as { id: string; full_name: string }[] };

  const businessName: Record<string, string> = Object.fromEntries(
    (bizUsers ?? []).map((u) => [u.id, u.full_name]),
  );
  const dealMeta: Record<
    string,
    { title: string; businessName: string; businessId: string; athleteId: string | null }
  > = {};
  for (const d of dealRows ?? []) {
    const bn = d.business_name?.trim() || businessName[d.business_id] || "Business";
    dealMeta[d.id] = { title: d.title, businessName: bn, businessId: d.business_id, athleteId: d.athlete_id };
  }

  const senderIds = Array.from(new Set((messages ?? []).map((message) => message.sender_id)));
  const { data: senders } = await supabase
    .from("users")
    .select("id, full_name")
    .in("id", senderIds.length ? senderIds : ["00000000-0000-0000-0000-000000000000"]);
  const senderMap = new Map((senders ?? []).map((sender) => [sender.id, sender.full_name]));

  return (
    <AppShell role={role} userName={user.full_name} userEmail={user.email} proMember={proMember}>
      <Panel
        tint="messages"
        title="Messages"
        description="Close deals in-thread: align deliverables, lock payouts, and keep every opportunity moving."
      >
        <div className="mb-4 grid gap-2 rounded-2xl border border-[#4A90E2]/30 bg-[#4A90E2]/[0.08] p-3 sm:grid-cols-3">
          <p className="text-xs font-semibold text-sky-200">Next action: reply to your warmest thread</p>
          <p className="text-xs text-slate-300">Live: 12 people viewing active deals</p>
          <p className="text-xs text-slate-300">Last activity 2 min ago</p>
        </div>
        <Suspense
          fallback={
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 text-sm text-slate-500">
              Loading messages…
            </div>
          }
        >
          <MessagesClient
            userId={user.id}
            userName={user.full_name}
            userEmail={user.email}
            role={role}
            peers={peers ?? []}
            messages={messages ?? []}
            dealMeta={dealMeta}
            senderNameById={Object.fromEntries(senderMap)}
          />
        </Suspense>
      </Panel>
    </AppShell>
  );
}
