import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  trendLabel,
  accentClass = "from-[#F5B942]/35 to-[#F5B942]/10 text-amber-100",
}: {
  label: string;
  value: ReactNode;
  helper: string;
  icon?: LucideIcon;
  /** e.g. “+12% vs last week” — display-only, derived in the page */
  trendLabel?: string;
  accentClass?: string;
}) {
  return (
    <div className="ui-card group p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accentClass} shadow-sm ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105`}
        >
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-50 sm:text-4xl">{value}</p>
      {trendLabel ? (
        <p className="mt-1.5 text-xs font-semibold text-emerald-400/90 tabular-nums">{trendLabel}</p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{helper}</p>
    </div>
  );
}

export const PANEL_TINT: Record<
  "marketplace" | "messages" | "notifications" | "investing" | "billing" | "profile" | "settings",
  string
> = {
  marketplace:
    "bg-gradient-to-br from-[#F5B942]/[0.07] via-[var(--surface)] to-[var(--surface-elevated)] border-[#F5B942]/20",
  messages:
    "bg-gradient-to-br from-[#4A90E2]/[0.07] via-[var(--surface)] to-[var(--surface-elevated)] border-[#4A90E2]/20",
  notifications:
    "bg-gradient-to-br from-[#F2994A]/[0.08] via-[var(--surface)] to-[var(--surface-elevated)] border-[#F2994A]/20",
  investing:
    "bg-gradient-to-br from-[#27AE60]/[0.07] via-[var(--surface)] to-[var(--surface-elevated)] border-[#27AE60]/20",
  billing:
    "bg-gradient-to-br from-[#9B51E0]/[0.08] via-[var(--surface)] to-[var(--surface-elevated)] border-[#9B51E0]/20",
  profile:
    "bg-gradient-to-br from-[#E5D3B3]/[0.06] via-[var(--surface)] to-[var(--surface-elevated)] border-[#E5D3B3]/25",
  settings:
    "bg-gradient-to-br from-slate-500/[0.08] via-[var(--surface)] to-[var(--surface-elevated)] border-slate-500/20",
};

export function Panel({
  id,
  title,
  description,
  action,
  children,
  tint,
}: {
  id?: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  /** Subtle section color (5–10% tint) — Athlete Wealth OS */
  tint?: keyof typeof PANEL_TINT;
}) {
  return (
    <section
      id={id}
      className={[
        "ui-surface p-5 sm:p-6 md:p-8 transition-shadow duration-300",
        tint ? PANEL_TINT[tint] : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between md:mb-7">
        <div className="min-w-0 pr-0 sm:pr-4">
          <h2 className="ui-heading-section text-balance">{title}</h2>
          <p className="ui-muted mt-2 text-sm leading-relaxed sm:max-w-prose">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
