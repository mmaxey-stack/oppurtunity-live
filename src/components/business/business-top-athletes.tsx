import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

const leaders = [
  { name: "Matt Maxey", conversions: 8, note: "Nightlife + local retail" },
  { name: "Jake Wilson", conversions: 5, note: "Gym + wellness" },
  { name: "Chris Lane", conversions: 3, note: "Event draw + stories" },
] as const;

export function BusinessTopAthletes() {
  return (
    <section className="rounded-[var(--radius-xl)] border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-[var(--surface)] to-[#0a0a0a] p-5 shadow-md sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200/80">
            <Sparkles className="h-3.5 w-3.5" />
            Roster
          </p>
          <h2 className="mt-1.5 text-xl font-bold text-slate-50 sm:text-2xl">Top performing athletes</h2>
          <p className="mt-1 text-sm text-slate-500">Proven local pull — shortlist and invite in one click.</p>
        </div>
        <Link href="/marketplace" className="text-sm font-bold text-[#F5B942] underline-offset-2 transition hover:underline">
          Open marketplace
        </Link>
      </div>
      <ul className="mt-5 space-y-2.5">
        {leaders.map((a, i) => (
          <li
            key={a.name}
            className="stagger-fade flex flex-col gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <div className="min-w-0">
              <p className="font-bold text-slate-100">{a.name}</p>
              <p className="text-xs text-slate-500">{a.note}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="inline-flex items-center gap-1 rounded-lg border border-[#27AE60]/35 bg-[#27AE60]/[0.1] px-2.5 py-1 text-xs font-bold text-emerald-200">
                {a.conversions} conversions
              </span>
              <Link
                href="/messages"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#F5B942]/40 bg-[#F5B942]/[0.1] px-3 py-1.5 text-xs font-bold text-[#F5E6B3] transition hover:border-[#F5B942]/60 hover:bg-[#F5B942]/[0.16] active:scale-[0.99]"
              >
                Invite to campaign
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
