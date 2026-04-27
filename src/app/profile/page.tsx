import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/cards";
import { ProfileExperience } from "@/components/profile/profile-experience";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";

export default async function ProfilePage() {
  const { supabase, user } = await requireCurrentUser();
  const proMember = isProMember(user);

  const { count: dealCount } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("athlete_id", user.id)
    .in("status", ["accepted", "completed"]);

  return (
    <AppShell role={user.role} userName={user.full_name} userEmail={user.email} proMember={proMember}>
      <Panel
        tint="profile"
        title="Profile"
        description="Your athlete control center — identity, reach, and how partners see you."
      >
        <ProfileExperience
          fullName={user.full_name}
          email={user.email}
          role={user.role}
          proMember={proMember}
          profileStrengthFromServer={user.profile_strength}
          serverStats={
            user.role === "athlete"
              ? {
                  earnings: user.earnings_total,
                  deals: dealCount ?? 0,
                  responseRate: 92,
                }
              : undefined
          }
        />
      </Panel>
    </AppShell>
  );
}
