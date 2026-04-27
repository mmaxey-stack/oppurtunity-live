import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/cards";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";
import { NotificationsFeed } from "./notifications-feed";

export default async function NotificationsPage() {
  const { supabase, user } = await requireCurrentUser();
  const role = user.role;
  const proMember = isProMember(user);
  const { data: items } = await supabase
    .from("notifications")
    .select("id, user_id, title, detail, created_at, read, type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell role={role} userName={user.full_name} userEmail={user.email} proMember={proMember}>
      <Panel
        tint="notifications"
        title="Notifications"
        description="Act on deal matches, messages, and payouts — all your momentum in one place."
      >
        <NotificationsFeed
          userId={user.id}
          initialItems={items ?? []}
          greetingName={user.full_name}
          role={role}
        />
      </Panel>
    </AppShell>
  );
}
