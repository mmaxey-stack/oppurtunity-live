"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Circle, Sparkles, TrendingUp } from "lucide-react";

const STORAGE = "opp-daily-actions-v1";

type Item = { id: string; label: string; href: string; reward: string };

const DEFAULT_ITEMS: Item[] = [
  { id: "deal", label: "Accept 1 deal", href: "/marketplace#deal-mock-nut-house", reward: "+$300 est." },
  { id: "msg", label: "Reply to 2 messages", href: "/messages", reward: "Trust + speed" },
  { id: "campaign", label: "Complete 1 deliverable in an active deal", href: "/messages", reward: "Payout path" },
  { id: "insight", label: "Check today’s market insight", href: "/investing#portfolio-brief", reward: "Edge" },
];

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadChecked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { day: string; ids: string[] };
    if (parsed.day !== dayKey()) return new Set();
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

function saveChecked(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE, JSON.stringify({ day: dayKey(), ids: [...ids] }));
}

export function DailyActionChecklist() {
  const [checked, setChecked] = useState<Set<string>>(() =>
    typeof window !== "undefined" ? loadChecked() : new Set(),
  );

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      saveChecked(n);
      return n;
    });
  }, []);

  const total = DEFAULT_ITEMS.length;
  const done = useMemo(() => DEFAULT_ITEMS.filter((i) => checked.has(i.id)).length, [checked]);
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;

  return (
    <section
      className="rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-6"
      aria-label="Daily action system"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">Daily action system</p>
          <h2 className="ui-heading-section mt-1.5 !text-lg sm:!text-xl">Today&apos;s wins</h2>
          <p className="mt-1 text-sm text-slate-500">Check items off to build momentum — small moves compound into payouts.</p>
        </div>
        {allDone ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#27AE60]/40 bg-[#27AE60]/[0.12] px-3 py-1.5 text-xs font-bold text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            +Momentum
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-500">
            {done}/{total} done
          </span>
        )}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800/90">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4A90E2]/80 to-[#F5B942] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {DEFAULT_ITEMS.map((item) => {
          const isOn = checked.has(item.id);
          return (
            <li key={item.id}>
              <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition-all duration-200 hover:border-white/12">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-slate-300 transition-all duration-200 hover:border-[#F5B942]/50"
                  aria-pressed={isOn}
                  title={isOn ? "Mark incomplete" : "Mark done"}
                >
                  {isOn ? (
                    <Check className="h-4 w-4 text-[#27AE60]" strokeWidth={2.5} />
                  ) : (
                    <Circle className="h-4 w-4 opacity-60" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${isOn ? "text-slate-500 line-through" : "text-slate-200"}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-[#F5B942]/90">{item.reward}</span>
                    {" · "}
                    <Link href={item.href} className="text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline">
                      Open
                    </Link>
                  </p>
                </div>
                {isOn ? (
                  <span className="shrink-0 self-center text-[0.65rem] font-bold uppercase tracking-wide text-emerald-400/90">
                    Nice
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {allDone ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-300/90">
          <TrendingUp className="h-4 w-4 shrink-0" />
          Momentum is compounding. Brands prioritize athletes who move same-day.
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-500">Finish the list to earn the +Momentum signal for today.</p>
      )}
    </section>
  );
}
