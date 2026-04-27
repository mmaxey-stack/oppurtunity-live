import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/cards";
import { BillingExperience } from "@/components/billing/billing-experience";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";

type Search = { success?: string; canceled?: string; plan?: string };

export default async function BillingPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { user } = await requireCurrentUser();
  const role = user.role;
  const proMember = isProMember(user);
  const sp = await searchParams;
  const showSuccess = sp.success === "true";
  const showCanceled = sp.canceled === "true";
  const planFromUrl = sp.plan;

  return (
    <AppShell role={role} userName={user.full_name} userEmail={user.email} proMember={proMember}>
      <Panel
        tint="billing"
        title="Billing"
        description="Unlock Pro to earn more in the Marketplace, close faster in Messages, and grow with Investing — one membership for the full loop."
      >
        <BillingExperience
          proMember={proMember}
          showSuccess={showSuccess}
          showCanceled={showCanceled}
          planFromUrl={planFromUrl}
        />
      </Panel>
    </AppShell>
  );
}
