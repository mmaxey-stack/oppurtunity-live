import { AppShell } from "@/components/app-shell";
import { PremiumHomeDashboard } from "@/components/dashboard/premium-home-dashboard";
import { requireCurrentUser } from "@/lib/auth";
import { isProMember } from "@/lib/membership";

export default async function InvestorPage() {
  const { user } = await requireCurrentUser();
  const proMember = isProMember(user);
  const firstName = (user.full_name?.trim().split(/\s+/)[0] || "there").trim();
  const earningsTotal = Math.max(320, Math.round(Number(user.earnings_total || 0)));

  return (
    <AppShell role="investor" userName={user.full_name} userEmail={user.email} proMember={proMember}>
      <div className="space-y-5 px-2 pb-6 pt-2 sm:px-3 md:px-4">
        <PremiumHomeDashboard
          role="athlete"
          firstName={firstName}
          totalEarnings={earningsTotal}
          earningsTrendPct="+12.4% vs last week"
          activeDealsCount={3}
          unreadMessages={2}
          profileStrength={78}
          activeDeals={[
            {
              id: "investor-alley-mac",
              title: "BOGO Mac Bowls",
              businessName: "Alley Mac",
              location: "Kent, OH",
              payout: "$75",
              href: "/deal/alley-mac",
              status: "Accepted",
            },
            {
              id: "investor-coffee",
              title: "Morning Rush Promo",
              businessName: "Coffee Shop",
              location: "Kent, OH",
              payout: "$50",
              href: "/marketplace",
              status: "Pending",
            },
            {
              id: "investor-mezeh",
              title: "Healthy Food Promo",
              businessName: "Mezeh Grill",
              location: "Kent, OH",
              payout: "$80",
              href: "/marketplace",
              status: "Applied",
            },
          ]}
          messageItems={[
            "Alley Mac: Perfect post, looks great.",
            "Coffee Shop: Can you post the story today?",
            "Mezeh Grill: Deal confirmed. Thanks.",
          ]}
        />
      </div>
    </AppShell>
  );
}

