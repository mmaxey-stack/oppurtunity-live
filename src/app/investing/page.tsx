import { AppShell } from "@/components/app-shell";
import { PANEL_TINT } from "@/components/cards";
import { InvestingExperience } from "@/components/investing/investing-experience";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";

export default async function InvestingPage() {
  const { user } = await requireCurrentUser();
  const proMember = isProMember(user);

  return (
    <AppShell role={user.role} userName={user.full_name} userEmail={user.email} proMember={proMember}>
      <div
        className={[
          "ui-surface p-5 sm:p-6 md:p-8 transition-shadow duration-300",
          PANEL_TINT.investing,
        ].join(" ")}
      >
        <InvestingExperience proMember={proMember} />
      </div>
    </AppShell>
  );
}
