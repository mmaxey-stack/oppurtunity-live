"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, BriefcaseBusiness, CircleDollarSign, LucideIcon, UserRoundCheck } from "lucide-react";

interface BusinessStat {
  label: string;
  value: string;
  helper: string;
  iconName?: "dollar" | "briefcase" | "bell" | "user";
  accentClass?: string;
}

const iconMap: Record<NonNullable<BusinessStat["iconName"]>, LucideIcon> = {
  dollar: CircleDollarSign,
  briefcase: BriefcaseBusiness,
  bell: BellRing,
  user: UserRoundCheck,
};

function extractNumeric(value: string) {
  const digits = value.replace(/[^\d.]/g, "");
  return Number(digits || 0);
}

function formatAnimatedValue(raw: string, animated: number) {
  if (raw.includes("$")) {
    return `$${Math.round(animated).toLocaleString()}`;
  }
  if (raw.includes("%")) {
    return `${Math.round(animated)}%`;
  }
  return `${Math.round(animated)}`;
}

export function BusinessStatCards({ stats }: { stats: BusinessStat[] }) {
  const targets = useMemo(() => stats.map((stat) => extractNumeric(stat.value)), [stats]);
  const [values, setValues] = useState<number[]>(() => targets.map(() => 0));

  useEffect(() => {
    const durationMs = 900;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      setValues(targets.map((target) => target * progress));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [targets]);

  return (
    <section className="grid gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.iconName ? iconMap[stat.iconName] : undefined;
        return (
          <div key={stat.label} className="ui-card group p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 ${
                  stat.accentClass ?? "from-[#F5B942]/35 to-[#F5B942]/10 text-amber-100"
                }`}
              >
                {Icon ? <Icon className="h-5 w-5" /> : null}
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-50 sm:text-4xl">
              {formatAnimatedValue(stat.value, values[index] ?? 0)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{stat.helper}</p>
          </div>
        );
      })}
    </section>
  );
}
