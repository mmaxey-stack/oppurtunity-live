import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/cards";
import { MarketplaceExperience } from "@/components/marketplace/marketplace-experience";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";
import { BusinessDealCreatorForm } from "@/components/business/business-deal-creator-form";
import { redirect } from "next/navigation";

export default async function MarketplacePage() {
  const { supabase, user } = await requireCurrentUser();
  const role = user.role;
  if (role === "investor") redirect("/investor");
  const proMember = isProMember(user);

  const { data: deals } = await supabase
    .from("deals")
    .select(
      "id, title, business_id, athlete_id, payout, sport, location, summary, status, created_at, business_name, description, requirements, phone, instagram",
    )
    .order("created_at", { ascending: false });

  const openDeals = (deals ?? []).filter((d) => d.status === "open" && d.athlete_id == null);
  const activeDbDeals =
    role === "athlete"
      ? (deals ?? []).filter((d) => d.athlete_id === user.id && d.status === "accepted")
      : [];

  const businessIds = Array.from(new Set((deals ?? []).map((deal) => deal.business_id)));
  const { data: businesses } = await supabase
    .from("users")
    .select("id, full_name")
    .in("id", businessIds.length ? businessIds : ["00000000-0000-0000-0000-000000000000"]);
  const businessMap = new Map((businesses ?? []).map((business) => [business.id, business.full_name]));
  const businessNameById = Object.fromEntries(businessMap.entries()) as Record<string, string>;

  return (
    <AppShell role={role} userName={user.full_name} userEmail={user.email} proMember={proMember}>
      <Panel
        tint="marketplace"
        title="Opportunities you can earn from right now"
        description={
          role === "business"
            ? "These are real-style example deals athletes respond to — post your campaign below and it appears in the same feed. Filter to see how you stack up."
            : "These are real-style deals from businesses looking for athletes like you — plus live campaigns from the community. Filter, apply, and follow up the same day."
        }
      >
        {role === "business" ? <BusinessDealCreatorForm /> : null}
        <MarketplaceExperience
          role={role}
          dbDeals={openDeals as Parameters<typeof MarketplaceExperience>[0]["dbDeals"]}
          activeDbDeals={activeDbDeals as Parameters<typeof MarketplaceExperience>[0]["activeDbDeals"]}
          businessNameById={businessNameById}
          userId={role === "athlete" ? user.id : undefined}
          viewerBusinessId={role === "business" ? user.id : undefined}
        />
      </Panel>
    </AppShell>
  );
}
