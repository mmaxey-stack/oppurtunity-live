"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, ChevronRight, Star } from "lucide-react";

const STORAGE = "oppurtunity-saved-deal-ids";

function loadSaved() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(STORAGE) ?? "[]") as string[]);
  } catch {
    return new Set<string>();
  }
}

function saveId(id: string) {
  const s = loadSaved();
  s.add(id);
  localStorage.setItem(STORAGE, JSON.stringify([...s]));
}

function removeId(id: string) {
  const s = loadSaved();
  s.delete(id);
  localStorage.setItem(STORAGE, JSON.stringify([...s]));
}

export function SpotlightDealCard({
  id,
  title,
  businessName,
  location,
  sport,
  payout,
  index,
  detailHref = "/marketplace",
}: {
  id: string;
  title: string;
  businessName: string;
  location: string;
  sport: string;
  payout: string;
  index: number;
  detailHref?: string;
}) {
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeId(id);
      setSaved(false);
    } else {
      saveId(id);
      setSaved(true);
    }
  }

  const tag =
    index === 0
      ? { text: "Best match for you", className: "bg-[#F5B942]/15 text-[#F5E6B3] border-[#F5B942]/35" }
      : index === 1
        ? { text: "Worth a look", className: "bg-white/[0.06] text-slate-200 border-white/12" }
        : { text: "Act soon", className: "bg-rose-500/10 text-rose-200 border-rose-500/30" };

  return (
    <div className="group relative">
      <Link
        href={detailHref}
        className="ui-card-interactive flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold ${tag.className}`}
            >
              {index === 0 ? <Star className="h-3 w-3" /> : null}
              {tag.text}
            </span>
            {index === 0 ? (
              <span className="text-[0.7rem] font-medium uppercase tracking-wide text-[#F5B942]/80">
                High fit
              </span>
            ) : null}
          </div>
          <p className="text-sm text-slate-500">{businessName}</p>
          <h3 className="text-base font-semibold text-slate-100 transition-colors group-hover:text-[#F5E6B3] sm:text-lg">
            {title}
          </h3>
          <p className="text-sm text-slate-500">
            {location} — {sport}
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
          <p className="text-xl font-bold tabular-nums text-[#F5E6B3] sm:text-2xl">${payout}</p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSave}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                saved
                  ? "border-[#F5B942]/50 bg-[#F5B942]/[0.15] text-[#F5E6B3]"
                  : "border-white/12 bg-white/[0.04] text-slate-300 hover:border-[#F5B942]/40"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-[#F5B942]" : ""}`} />
              {saved ? "Saved" : "Save"}
            </button>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#F5B942]/90 sm:hidden">
              View
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
      <p className="mt-1.5 hidden pl-1 text-xs text-slate-500 sm:block">
        Hover to preview — click through to the marketplace to accept or message.
      </p>
    </div>
  );
}
