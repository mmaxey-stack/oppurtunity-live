import { Eye, Footprints, Gem, Users } from "lucide-react";

export function BusinessCampaignPerformance({
  activeAthletes,
  estimatedReach,
  footTraffic,
  revenueEstimate,
  roiLow,
  roiHigh,
}: {
  activeAthletes: number;
  estimatedReach: number;
  footTraffic: number;
  revenueEstimate: number;
  roiLow: number;
  roiHigh: number;
}) {
  return (
    <section
      className="overflow-hidden rounded-[var(--radius-xl)] border border-[#F5B942]/25 bg-gradient-to-br from-[#141108] via-[#0b0c10] to-[#060708] p-5 shadow-[var(--shadow-lg)] sm:p-6 md:p-7"
      style={{
        backgroundImage: "radial-gradient(800px 320px at 100% 0%, rgba(245, 185, 66, 0.08) 0%, transparent 55%)",
      }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F5B942]/80">Here&apos;s how to make money today</p>
      <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-50 sm:text-3xl">Your campaign performance</h2>
      <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
        A live snapshot of pipeline and results — nudge what&apos;s working and double down.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Athletes active",
            value: activeAthletes,
            sub: "On accepted + open work",
            icon: Users,
          },
          {
            label: "Estimated reach",
            value: estimatedReach.toLocaleString(),
            sub: "Story + feed impressions (est.)",
            icon: Eye,
          },
          {
            label: "Foot traffic this week",
            value: footTraffic,
            sub: "Scanned visits to your offer",
            icon: Footprints,
          },
          {
            label: "Revenue generated",
            value: `~$${revenueEstimate.toLocaleString()}`,
            sub: "Attribution window (est.)",
            icon: Gem,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="group rounded-2xl border border-white/8 bg-white/[0.04] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F5B942]/30 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
              <item.icon className="h-4 w-4 text-[#F5B942]/80 transition-transform group-hover:scale-110" />
            </div>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-50 sm:text-3xl">
              {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
          Total athletes in network: <span className="font-bold text-slate-100">42</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
          Avg turnout per deal: <span className="font-bold text-slate-100">18 people</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
          Top athlete reach: <span className="font-bold text-slate-100">12k followers</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-300">
          <span className="text-slate-500">Estimated return: </span>
          <span className="font-extrabold text-[#F5E6B3]">
            ${roiLow.toLocaleString()}–${roiHigh.toLocaleString()}
          </span>{" "}
          <span className="text-slate-500">based on current participation and posted payouts.</span>
        </p>
        <p className="shrink-0 text-xs text-slate-500">Model updates as athletes accept and deliver.</p>
      </div>
    </section>
  );
}
