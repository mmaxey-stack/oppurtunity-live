import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/cards";
import { SettingsExperience } from "@/components/settings/settings-experience";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";
import { mergeAppSettingsFromDb } from "@/lib/user-settings";

export default async function SettingsPage() {
  const { user } = await requireCurrentUser();
  const proMember = isProMember(user);

  return (
    <AppShell role={user.role} userName={user.full_name} userEmail={user.email} proMember={proMember}>
      <Panel
        tint="settings"
        title="Settings"
        description="Notifications, deal fit, and investing style — tune how Oppurtunity works for you."
      >
        <SettingsExperience initialFromServer={mergeAppSettingsFromDb(user.settings)} />
      </Panel>
    </AppShell>
  );
}
