"use client";

import { TrendingUp } from "lucide-react";
import { ACTIVITY_EVENT, getAcceptedMockDealKeys } from "@/lib/oppurtunity-activity";
import { useCallback, useEffect, useState } from "react";

type MoneyPulseBarProps = {
  isMattDemo: boolean;
};

/**
 * Sticky “money visibility” — demo numbers; pending ticks up slightly when mock deals are accepted.
 */
export function MoneyPulseBar({ isMattDemo }: MoneyPulseBarProps) {
  const [accepted, setAccepted] = useState(0);

  const sync = useCallback(() => {
    if (typeof window === "undefined") return;
    setAccepted(getAcceptedMockDealKeys().length);
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const on = () => sync();
    window.addEventListener(ACTIVITY_EVENT, on);
    return () => window.removeEventListener(ACTIVITY_EVENT, on);
  }, [sync]);

  const today = isMattDemo ? 500 : 180;
  const basePending = isMattDemo ? 900 : 450;
  const extra = accepted * 75;
  const pending = basePending + extra;
  const potential = isMattDemo ? 2300 : 1200;

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex justify-center px-3 pb-3 pt-1 md:px-6"
      role="region"
      aria-label="Money visibility"
    >
      <div className="pointer-events-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0a0c10]/98 via-[#0f1118]/95 to-[#0a0c10]/98 px-4 py-2.5 shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-5">
        <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
          <TrendingUp className="h-3.5 w-3.5 text-[#F5B942]" />
          Your money
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-x-5 gap-y-1 text-sm">
          <div className="text-right">
            <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-500">Today</p>
            <p className="font-bold tabular-nums text-[#F5E6B3]">${today.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-white/10" aria-hidden />
          <div className="text-right">
            <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-500">Pending</p>
            <p className="font-bold tabular-nums text-slate-200">${pending.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-white/10" aria-hidden />
          <div className="text-right">
            <p className="text-[0.6rem] font-bold uppercase tracking-wide text-slate-500">Potential</p>
            <p className="font-bold tabular-nums text-violet-200/90">${potential.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
