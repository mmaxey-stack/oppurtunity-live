import { AppShell } from "@/components/app-shell";
import { PANEL_TINT } from "@/components/cards";
import { InvestorPlatform } from "@/components/investor/investor-platform";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";

export default async function InvestorPage() {
  const { user } = await requireCurrentUser();
  const proMember = isProMember(user);

  return (
    <AppShell role="investor" userName={user.full_name} userEmail={user.email} proMember={proMember}>
      <div
        className={[
          "ui-surface p-5 sm:p-6 md:p-8 transition-shadow duration-300",
          PANEL_TINT.investing,
        ].join(" ")}
      >
        <InvestorPlatform proMember={proMember} />
      </div>
    </AppShell>
  );
}

