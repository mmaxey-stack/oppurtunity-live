"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CircleUserRound,
  Home,
  MessageSquare,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

type AppShellProps = {
  children: ReactNode;
  role: UserRole;
  userName?: string;
  userEmail?: string;
  proMember?: boolean;
};

function tabActive(pathname: string, href: string) {
  const p = pathname || "/";
  if (href === "/") return p === "/";
  return p === href || p.startsWith(`${href}/`);
}

export function AppShell({ children, role, userName, userEmail, proMember }: AppShellProps) {
  const pathname = usePathname() ?? "/";
  const safeName = userName?.trim() || "Athlete";
  const initials = safeName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AT";

  const homeHref = role === "investor" ? "/investor" : "/";

  const tabs = [
    { href: homeHref, label: "Home", icon: Home },
    { href: "/marketplace", label: "Deals", icon: BriefcaseBusiness },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/earnings", label: "Earnings", icon: BadgeDollarSign },
    { href: "/investing", label: "Investing", icon: TrendingUp },
    { href: "/profile", label: "Profile", icon: CircleUserRound },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_right,#223240_0%,transparent_36%),linear-gradient(165deg,#05070c_0%,#090d16_45%,#05060a_100%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-[1500px] gap-4 px-2 py-2 sm:px-4 sm:py-4 lg:gap-6">
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-4 flex h-[calc(100dvh-2rem)] flex-col rounded-[20px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_14px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <div className="sidebar-user-pulse rounded-2xl border border-[#F5C451]/30 bg-gradient-to-br from-[#F5C451]/14 via-transparent to-transparent p-4">
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.24em] text-[#F5C451]/95">Oppurtunity</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{safeName}</p>
                  <p className="truncate text-xs text-slate-400">{userEmail || "NIL Athlete"}</p>
                </div>
              </div>
            </div>

            <nav className="mt-4 space-y-1.5" aria-label="Main sections">
              {tabs.map((t) => {
                const on = tabActive(pathname, t.href);
                const Icon = t.icon;
                return (
                  <Link
                    key={`${t.href}-${t.label}`}
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    className={[
                      "group flex min-h-[46px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      on
                        ? "bg-gradient-to-r from-[#F5C451]/26 via-[#F5C451]/14 to-transparent text-amber-50 ring-1 ring-[#F5C451]/45 shadow-[0_0_24px_-8px_rgba(245,196,81,0.85)]"
                        : "text-slate-300 ring-1 ring-transparent hover:bg-white/[0.06] hover:text-white",
                    ].join(" ")}
                  >
                    <Icon className={["h-4 w-4", on ? "text-[#F5C451]" : "text-slate-400 group-hover:text-slate-200"].join(" ")} />
                    <span>{t.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-400">Your Tier</p>
              <div className="mt-2 flex items-center gap-2 text-amber-200">
                <Sparkles className="h-4 w-4" />
                <p className="text-lg font-bold">{proMember ? "PRO GOLD" : "GOLD"}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#F5C451] to-[#22C55E]" />
              </div>
              <p className="mt-2 text-xs text-slate-400">72% to next tier</p>
              <Link href="/billing" className="btn-gold sidebar-pro-cta mt-3 w-full">
                <Target className="h-4 w-4" />
                Upgrade now
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 mb-3 border border-white/10 bg-[#070a11]/88 px-2 pt-[max(0.35rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden rounded-2xl">
            <p className="mb-1 px-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#F5C451]/85">Oppurtunity</p>
            <nav
              className="flex gap-2 overflow-x-auto pb-2 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Main sections"
            >
              {tabs.map((t) => {
                const on = tabActive(pathname, t.href);
                const Icon = t.icon;
                return (
                  <Link
                    key={`${t.href}-${t.label}-mobile`}
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    className={[
                      "flex min-h-[44px] min-w-[4.5rem] shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all sm:text-sm",
                      on
                        ? "bg-[#F5C451]/20 font-extrabold text-white shadow-[0_0_18px_-4px_rgba(245,196,81,0.8)] ring-1 ring-[#F5C451]/45"
                        : "bg-white/[0.04] text-slate-400 ring-1 ring-white/10 hover:bg-white/[0.07] hover:text-slate-200",
                    ].join(" ")}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
