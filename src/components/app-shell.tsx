"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Cog,
  HandCoins,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { UserRole } from "@/lib/types";
import { signOutAction } from "@/app/actions";
import {
  ACTIVITY_EVENT,
  getAcceptedMockDealKeys,
  getLocalUnreadNotifCount,
  getMockInboxUnreadCount,
} from "@/lib/oppurtunity-activity";
import { MoneyPulseBar } from "@/components/money-pulse-bar";
import { AthleteOnboardingOverlay } from "@/components/onboarding/athlete-onboarding-overlay";

const COLLAPSE_KEY = "opp-sidebar-collapsed";

type NavKind =
  | "dashboard"
  | "marketplace"
  | "messages"
  | "notifications"
  | "billing"
  | "investing"
  | "profile"
  | "settings";

const navItems: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  kind: NavKind;
  tooltip: string;
}[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, kind: "dashboard", tooltip: "Your home — momentum and next moves" },
  { href: "/marketplace", label: "Marketplace", icon: BriefcaseBusiness, kind: "marketplace", tooltip: "Browse and accept deals" },
  { href: "/messages", label: "Messages", icon: MessageCircle, kind: "messages", tooltip: "Talk to businesses" },
  { href: "/notifications", label: "Notifications", icon: Bell, kind: "notifications", tooltip: "Deals, payouts, and alerts" },
  { href: "/billing", label: "Billing", icon: HandCoins, kind: "billing", tooltip: "Plans and checkout" },
  { href: "/investor", label: "Investing", icon: ChartNoAxesCombined, kind: "investing", tooltip: "Grow your money" },
  { href: "/profile", label: "Profile", icon: CircleUserRound, kind: "profile", tooltip: "How brands see you" },
  { href: "/settings", label: "Settings", icon: Cog, kind: "settings", tooltip: "Preferences and notifications" },
];

function navItemClasses(
  kind: NavKind,
  isActive: boolean,
  hasMarketplaceConnect: boolean,
  investingProGlow: boolean,
  proMember: boolean,
): string {
  const base =
    "group relative flex w-full min-w-0 items-center gap-2.5 rounded-2xl border-l-[3px] py-2.5 pl-2.5 pr-2 text-left text-sm font-medium transition-all duration-200 ease-out will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400/40 active:scale-[0.99] active:duration-100";
  if (isActive) {
    const map: Record<NavKind, string> = {
      dashboard:
        "scale-[1.02] border-amber-400/70 bg-gradient-to-r from-amber-500/20 via-amber-500/8 to-transparent text-amber-50 shadow-[0_0_24px_-8px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]",
      marketplace:
        "scale-[1.02] border-amber-500/75 bg-gradient-to-r from-amber-500/22 to-amber-800/5 text-amber-50 shadow-[0_0_24px_-8px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]",
      messages:
        "scale-[1.02] border-sky-400/65 bg-gradient-to-r from-sky-500/18 to-sky-900/5 text-sky-50 shadow-[0_0_24px_-8px_rgba(14,165,233,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]",
      notifications:
        "scale-[1.02] border-orange-400/65 bg-gradient-to-r from-orange-500/18 to-orange-950/10 text-orange-50 shadow-[0_0_24px_-8px_rgba(249,115,22,0.28),inset_0_1px_0_rgba(255,255,255,0.05)]",
      billing:
        "scale-[1.02] border-violet-400/60 bg-gradient-to-r from-violet-500/20 to-violet-950/15 text-violet-50 shadow-[0_0_24px_-8px_rgba(139,92,246,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]",
      investing:
        investingProGlow
          ? "scale-[1.02] border-emerald-400/70 bg-gradient-to-r from-emerald-500/22 to-emerald-950/20 text-emerald-50 shadow-[0_0_28px_-6px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "scale-[1.02] border-emerald-500/60 bg-gradient-to-r from-emerald-500/16 to-emerald-950/5 text-emerald-50 shadow-[0_0_20px_-8px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]",
      profile:
        "scale-[1.02] border-stone-300/50 bg-gradient-to-r from-stone-400/15 to-stone-900/20 text-stone-100 shadow-[0_0_20px_-8px_rgba(214,211,209,0.2),inset_0_1px_0_rgba(255,255,255,0.04)]",
      settings:
        "scale-[1.02] border-slate-500/50 bg-gradient-to-r from-slate-500/18 to-slate-900/30 text-slate-100 shadow-[0_0_20px_-8px_rgba(100,116,139,0.2),inset_0_1px_0_rgba(255,255,255,0.04)]",
    };
    return `${base} ${map[kind]}`;
  }
  const idle: Record<NavKind, string> = {
    dashboard: "border-transparent text-white/60 hover:-translate-y-0.5 hover:border-amber-500/25 hover:bg-amber-500/10 hover:text-amber-50/95 hover:shadow-[0_0_20px_-10px_rgba(245,158,11,0.2)]",
    marketplace: [
      "border-transparent text-white/60 hover:-translate-y-0.5 hover:border-amber-500/20 hover:bg-amber-500/8 hover:text-amber-50/90 hover:shadow-[0_0_20px_-10px_rgba(245,158,11,0.15)]",
      hasMarketplaceConnect
        ? "ring-1 ring-amber-400/20 shadow-[0_0_20px_-12px_rgba(234,179,8,0.2)]"
        : "",
    ].join(" "),
    messages:
      "border-transparent text-white/60 hover:-translate-y-0.5 hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-100 hover:shadow-[0_0_20px_-10px_rgba(14,165,233,0.18)]",
    notifications:
      "border-transparent text-white/60 hover:-translate-y-0.5 hover:border-orange-500/25 hover:bg-orange-500/8 hover:text-orange-50/95 hover:shadow-[0_0_20px_-10px_rgba(249,115,22,0.15)]",
    billing:
      "border-transparent text-white/60 hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-violet-500/8 hover:text-violet-100 hover:shadow-[0_0_20px_-10px_rgba(139,92,246,0.12)]",
    investing: [
      "border-transparent text-white/60 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-emerald-500/9 hover:text-emerald-100 hover:shadow-[0_0_20px_-10px_rgba(16,185,129,0.12)]",
      proMember ? "ring-1 ring-emerald-400/15 shadow-[0_0_16px_-10px_rgba(16,185,129,0.12)]" : "",
    ]
      .filter(Boolean)
      .join(" "),
    profile:
      "border-transparent text-white/60 hover:-translate-y-0.5 hover:border-stone-400/25 hover:bg-stone-400/8 hover:text-stone-100",
    settings:
      "border-transparent text-white/60 hover:-translate-y-0.5 hover:border-slate-500/25 hover:bg-slate-500/8 hover:text-slate-200",
  };
  return `${base} ${idle[kind]}`;
}

function iconClass(kind: NavKind, isActive: boolean): string {
  if (isActive) {
    const a: Record<NavKind, string> = {
      dashboard: "text-amber-200 drop-shadow-[0_0_8px_rgba(250,204,21,0.25)]",
      marketplace: "text-amber-200 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]",
      messages: "text-sky-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]",
      notifications: "text-orange-200 drop-shadow-[0_0_8px_rgba(251,146,60,0.28)]",
      billing: "text-violet-200 drop-shadow-[0_0_8px_rgba(196,181,253,0.2)]",
      investing: "text-emerald-200 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]",
      profile: "text-stone-200",
      settings: "text-slate-300",
    };
    return `h-[1.1rem] w-[1.1rem] shrink-0 transition-transform duration-200 group-hover:scale-105 ${a[kind]}`;
  }
  const h: Record<NavKind, string> = {
    dashboard: "text-amber-400/45 group-hover:text-amber-200/90",
    marketplace: "text-amber-400/45 group-hover:text-amber-200/90",
    messages: "text-sky-400/45 group-hover:text-sky-200/90",
    notifications: "text-orange-400/45 group-hover:text-orange-200/90",
    billing: "text-violet-400/45 group-hover:text-violet-200/80",
    investing: "text-emerald-400/45 group-hover:text-emerald-200/90",
    profile: "text-stone-400/50 group-hover:text-stone-200/90",
    settings: "text-slate-500 group-hover:text-slate-200/80",
  };
  return `h-[1.1rem] w-[1.1rem] shrink-0 transition-all duration-200 group-hover:scale-110 ${h[kind]}`;
}

interface AppShellProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
  proMember?: boolean;
  children: React.ReactNode;
}

function initialsFromName(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "U";
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0]! + p[p.length - 1]![0]!).toUpperCase();
}

export function AppShell({ role, userName, userEmail, proMember, children }: AppShellProps) {
  const pathname = usePathname();
  const [navBadges, setNavBadges] = useState({ notif: 0, inbox: 0 });
  const [activityTick, setActivityTick] = useState(0);
  const [acceptedDeals, setAcceptedDeals] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const roleLabel = role === "athlete" ? "Athlete Account" : role === "business" ? "Business Account" : "Investor View";
  const showAthleteStats = role === "athlete";
  const isPro = Boolean(proMember);
  const isMattDemo = (userEmail ?? "").toLowerCase() === "mpmaxey@icloud.com";

  const syncAccepted = useCallback(() => {
    if (typeof window === "undefined") return;
    setAcceptedDeals(getAcceptedMockDealKeys().length);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    syncAccepted();
  }, [activityTick, syncAccepted, pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const on = () => setActivityTick((t) => t + 1);
    window.addEventListener(ACTIVITY_EVENT, on);
    return () => window.removeEventListener(ACTIVITY_EVENT, on);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const n = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, n ? "1" : "0");
      } catch {
        /* ignore */
      }
      return n;
    });
  };

  const refreshBadges = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const [notifRes, inboxRes] = await Promise.all([
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false),
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("read_by_receiver", false),
    ]);
    setNavBadges({
      notif: (notifRes.count ?? 0) + getLocalUnreadNotifCount(),
      inbox: (inboxRes.count ?? 0) + getMockInboxUnreadCount(),
    });
  }, []);

  useEffect(() => {
    void refreshBadges();
  }, [pathname, refreshBadges]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onActivity = () => {
      void refreshBadges();
    };
    window.addEventListener(ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(ACTIVITY_EVENT, onActivity);
  }, [refreshBadges]);

  const hasMarketplaceConnect = acceptedDeals > 0;
  const showMarketplaceNew = showAthleteStats && pathname !== "/marketplace";
  const inboxCount = navBadges.inbox;
  const notifCount = navBadges.notif;

  return (
    <div className="min-h-screen text-slate-100">
      <div
        className={[
          "mx-auto grid w-full max-w-[1400px] gap-5 px-4 py-5 sm:gap-6 sm:px-5 sm:py-6 md:px-6 md:py-6 lg:gap-10 lg:px-8 lg:py-8",
          "transition-[grid-template-columns] duration-300 ease-out",
          collapsed ? "md:grid-cols-[minmax(0,4.75rem)_1fr]" : "md:grid-cols-[minmax(0,280px)_1fr]",
        ].join(" ")}
      >
        <aside
          className={[
            "flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-white/10",
            "bg-gradient-to-b from-[#0f1118] via-[#0a0c12] to-[#06070b]",
            "p-1 text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]",
            "sm:p-1.5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start",
            "ring-1 ring-white/[0.04]",
            collapsed ? "lg:max-w-[4.75rem]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="flex min-h-0 flex-1 min-w-0 flex-col rounded-[calc(var(--radius-xl)-4px)] border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-2 sm:p-3">
            <div className="mb-1 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/50 transition-all hover:border-amber-400/25 hover:bg-amber-500/10 hover:text-amber-200/90 md:inline-flex"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
              >
                {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div
              className={[
                "mb-3 rounded-2xl border p-3.5 shadow-lg transition-all duration-300",
                "border-amber-400/15 bg-gradient-to-br from-white/[0.1] via-white/[0.04] to-black/20",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)]",
                "hover:border-amber-300/30 hover:shadow-[0_0_40px_-12px_rgba(245,158,11,0.18)]",
                "sidebar-user-pulse",
              ].join(" ")}
              style={{
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              }}
            >
              {!collapsed ? (
                <>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-amber-200/75">Oppurtunity</p>
                  <p className="mt-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/50">Command center</p>
                  <p className="mt-2.5 text-lg font-bold tracking-[-0.02em]">Growth + Money OS</p>
                  <p className="mt-0.5 text-sm text-white/50">
                    {roleLabel}
                    {isPro ? " · Pro" : ""}
                  </p>
                  <div
                    className="mt-4 space-y-3 rounded-xl border border-white/10 p-3"
                    style={{
                      background: "linear-gradient(145deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.03) 100%)",
                    }}
                  >
                    <p className="text-sm font-semibold text-white/95">{userName ?? "Oppurtunity User"}</p>
                    <p className="truncate text-[0.7rem] text-white/45">{userEmail ?? ""}</p>
                    {showAthleteStats ? (
                      <>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-[0.65rem] font-bold uppercase tracking-wider text-white/40">
                            <span>Profile strength</span>
                            <span className="tabular-nums text-amber-200/90">82%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-400/80 to-amber-600/90"
                              style={{ width: "82%" }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2.5 text-[0.7rem]">
                          <div>
                            <p className="text-white/40">Earnings today</p>
                            <p className="mt-0.5 font-bold tabular-nums text-amber-200/95">$500</p>
                          </div>
                          <div>
                            <p className="text-white/40">Active deals</p>
                            <p className="mt-0.5 font-bold tabular-nums text-amber-200/95">2</p>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-1">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-400/25 to-amber-950/50 text-xs font-bold text-amber-100"
                    title={userName ?? "User"}
                  >
                    {initialsFromName(userName ?? "U")}
                  </div>
                </div>
              )}
            </div>

            <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isMessages = item.href === "/messages";
                const isNotif = item.href === "/notifications";
                const isMkt = item.href === "/marketplace";
                const isInvesting = item.href === "/investing";
                const raw = isNotif ? notifCount : isMessages ? inboxCount : 0;
                const hasBadge = raw > 0;
                const countLabel = raw > 9 ? "9+" : String(raw);
                const investingProGlow = isInvesting && isActive && isPro;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.tooltip}
                    className={navItemClasses(
                      item.kind,
                      isActive,
                      hasMarketplaceConnect && isMkt,
                      investingProGlow,
                      isPro,
                    )}
                  >
                    <span className="relative inline-flex shrink-0">
                      <Icon
                        className={iconClass(item.kind, isActive)}
                        style={
                          isMessages && hasBadge
                            ? { filter: "drop-shadow(0 0 6px rgba(56, 189, 248, 0.35))" }
                            : isNotif && hasBadge
                              ? { filter: "drop-shadow(0 0 6px rgba(251, 146, 60, 0.3))" }
                              : undefined
                        }
                      />
                    </span>
                    <span className={`min-w-0 flex-1 ${collapsed ? "sr-only" : "truncate"}`}>{item.label}</span>
                    {!collapsed && isMkt && showMarketplaceNew ? (
                      <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-amber-200/90">
                        New
                      </span>
                    ) : null}
                    {hasBadge && (isMessages || isNotif) ? (
                      <span
                        className={[
                          "shrink-0 rounded-md px-1.5 py-0.5 text-[0.7rem] font-bold tabular-nums",
                          isMessages
                            ? "border border-sky-400/25 bg-sky-500/25 text-sky-100 sidebar-badge-msg"
                            : "border border-orange-400/25 bg-orange-500/20 text-orange-50 sidebar-badge-notif",
                        ].join(" ")}
                      >
                        {countLabel}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            {!isPro ? (
              <div
                className="mt-4 space-y-3 rounded-2xl border border-amber-500/15 p-3.5"
                style={{
                  background: "linear-gradient(165deg, #0a0a0a 0%, #1a1208 38%, #2a1f0a 65%, #0f0d08 100%)",
                  boxShadow: "0 0 0 1px rgba(180, 140, 50, 0.12), inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 40px -24px rgba(0,0,0,0.6)",
                }}
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-200/30 to-amber-900/60 text-amber-200 shadow-[0_0_20px_-4px_rgba(245,158,11,0.45)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold tracking-tight text-amber-100/95">Upgrade to Pro</p>
                <p className="text-[0.7rem] leading-relaxed text-white/55">
                  Turn influence into income. Track what you earn. Keep more of it. Grow it.
                </p>
                <Link
                  href="/billing"
                  className="sidebar-pro-cta btn-gold relative z-0 mt-1 flex w-full justify-center overflow-hidden rounded-xl border border-amber-500/20 px-3 py-2.5 text-center text-xs font-bold text-amber-950 shadow-[0_0_20px_-8px_rgba(234,179,8,0.4)] transition-[transform,box-shadow] duration-200 hover:shadow-[0_0_28px_-6px_rgba(234,179,8,0.55)] active:scale-[0.98]"
                >
                  View Pro Plan
                </Link>
              </div>
            ) : (
              <div
                className={[
                  "mt-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-black/20 p-3.5",
                  collapsed ? "flex justify-center" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                title="Pro — full Wealth OS"
              >
                {collapsed ? (
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-300/90">Pro</span>
                ) : (
                  <>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-400/90">Pro active</p>
                    <p className="mt-1 text-xs text-white/50">Investing + premium deal access unlocked</p>
                  </>
                )}
              </div>
            )}

            <form action={signOutAction} className={["mt-4", collapsed ? "" : "mt-4"].join(" ")}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-white/80 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                title="Sign out"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className={collapsed ? "sr-only" : ""}>Sign Out</span>
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 space-y-5 sm:space-y-6 lg:space-y-8 [view-transition-name:content]">
          <header className="ui-surface p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Oppurtunity</p>
                <h1 className="ui-heading-display mt-2 max-w-2xl text-balance">
                  Built for athletes with NIL money and real financial upside.
                </h1>
              </div>
              <div className="relative w-full min-w-0 max-w-full shrink-0 lg:max-w-md">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  aria-hidden
                />
                <input
                  readOnly
                  value=""
                  placeholder="Search deals, businesses, or athletes..."
                  className="opp-input w-full py-2.5 pl-11 pr-4 shadow-inner"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5B942]/25 bg-[#F5B942]/[0.08] px-3.5 py-1.5 text-xs font-medium text-[#F5E6B3]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#F5B942]/90" />
                Verified athlete-business network
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-400">
                Pro investing intelligence
              </span>
              <div className="ml-auto flex flex-wrap gap-1.5">
                <Link
                  href="/"
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                    role === "athlete"
                      ? "border-[#F5B942]/40 bg-[#F5B942]/[0.1] text-[#F5E6B3]"
                      : "border-white/10 bg-white/[0.04] text-slate-300",
                  ].join(" ")}
                >
                  Athlete
                </Link>
                <Link
                  href="/marketplace#post-deal"
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                    role === "business"
                      ? "border-[#4A90E2]/40 bg-[#4A90E2]/[0.12] text-sky-200"
                      : "border-white/10 bg-white/[0.04] text-slate-300",
                  ].join(" ")}
                >
                  Business
                </Link>
                <Link
                  href="/investor"
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                    role === "investor"
                      ? "border-[#27AE60]/45 bg-[#27AE60]/[0.12] text-emerald-200"
                      : "border-white/10 bg-white/[0.04] text-slate-300",
                  ].join(" ")}
                >
                  Investor
                </Link>
              </div>
            </div>
          </header>
          <main
            className={[
              "min-w-0 space-y-5 sm:space-y-6 lg:space-y-8 motion-safe:duration-300",
              showAthleteStats ? "pb-24 sm:pb-28" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {children}
          </main>
          {showAthleteStats ? <MoneyPulseBar isMattDemo={isMattDemo} /> : null}
          {role === "athlete" ? <AthleteOnboardingOverlay /> : null}
        </div>
      </div>
    </div>
  );
}
