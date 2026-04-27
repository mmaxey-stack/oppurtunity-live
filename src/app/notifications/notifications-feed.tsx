"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
  LineChart,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { NotificationItem } from "@/lib/types";
import { formatRelativeTime } from "@/lib/time";
import { markNotificationReadAction } from "@/app/actions";
import {
  ACTIVITY_EVENT,
  ensureSeedBusinessLocalNotifications,
  ensureSeedLocalNotifications,
  getLocalNotifications,
  markLocalNotificationRead,
  type LocalNotification,
} from "@/lib/oppurtunity-activity";
import type { UserRole } from "@/lib/types";

interface NotificationsFeedProps {
  userId: string;
  initialItems: NotificationItem[];
  greetingName?: string;
  role?: UserRole;
}

type FeedRow =
  | { key: string; source: "server"; item: NotificationItem }
  | { key: string; source: "local"; item: LocalNotification };

function kindIcon(kind: LocalNotification["kind"]): LucideIcon {
  switch (kind) {
    case "deal_match":
      return Flame;
    case "message":
      return MessageCircle;
    case "deal_accepted":
      return CheckCircle2;
    case "deal_update":
      return Clock;
    case "payment":
      return DollarSign;
    default:
      return Bell;
  }
}

function mergeAndSort(server: NotificationItem[], local: LocalNotification[]): FeedRow[] {
  const rows: FeedRow[] = [
    ...server.map((item) => ({ key: `s-${item.id}`, source: "server" as const, item })),
    ...local.map((item) => ({ key: `l-${item.id}`, source: "local" as const, item })),
  ];
  function score(r: FeedRow) {
    const title = r.item.title.toLowerCase();
    const detail = r.item.detail.toLowerCase();
    const money = title.includes("$") || detail.includes("$") || title.includes("deal") || detail.includes("deal");
    const unread = r.source === "server" ? !r.item.read : !r.item.read;
    return (money ? 2 : 0) + (unread ? 1 : 0);
  }
  return rows.sort((a, b) => {
    const s = score(b) - score(a);
    if (s !== 0) return s;
    return new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime();
  });
}

export function NotificationsFeed({ userId, initialItems, greetingName, role = "athlete" }: NotificationsFeedProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [serverItems, setServerItems] = useState<NotificationItem[]>(initialItems);
  const [localVersion, setLocalVersion] = useState(0);
  const router = useRouter();

  const localItems = useMemo(() => {
    void localVersion;
    return getLocalNotifications();
  }, [localVersion]);

  const rows = useMemo(
    () => mergeAndSort(serverItems, localItems),
    [serverItems, localItems],
  );

  useEffect(() => {
    if (role === "business") {
      ensureSeedBusinessLocalNotifications(userId);
    } else {
      ensureSeedLocalNotifications(userId);
    }
    setLocalVersion((v) => v + 1);
  }, [userId, role]);

  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const { data } = await supabase
            .from("notifications")
            .select("id, user_id, title, detail, created_at, read, type")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          setServerItems((data ?? []) as NotificationItem[]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStore = () => setLocalVersion((v) => v + 1);
    window.addEventListener(ACTIVITY_EVENT, onStore);
    return () => window.removeEventListener(ACTIVITY_EVENT, onStore);
  }, []);

  function onRowClick(row: FeedRow) {
    if (row.source === "local") {
      if (!row.item.read) markLocalNotificationRead(row.item.id);
      if (row.item.href) {
        router.push(row.item.href);
        return;
      }
    } else {
      const item = row.item;
      if (!item.read) void markNotificationReadAction(item.id);
      if (item.type === "payout" || item.detail.toLowerCase().includes("payout")) {
        router.push("/");
        return;
      }
      if (item.type === "message" || item.title.toLowerCase().includes("message")) {
        router.push("/messages");
        return;
      }
      router.push("/marketplace");
    }
  }

  const firstName = greetingName?.trim().split(/\s+/)[0] ?? "there";

  const briefing =
    role === "business" ? (
      <div
        className="mb-2 overflow-hidden rounded-2xl border border-[#F5B942]/25 bg-gradient-to-br from-[#1a1508] via-[var(--surface-elevated)] to-[var(--surface)] p-4 shadow-[var(--shadow-md)] sm:p-5"
        style={{
          backgroundImage:
            "radial-gradient(640px 280px at 100% 0%, rgba(245, 185, 66, 0.12) 0%, transparent 55%)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#F5B942]/85">
              <Sparkles className="h-3.5 w-3.5" />
              Brand control center
            </p>
            <h2 className="mt-1.5 text-lg font-bold text-slate-50 sm:text-xl">
              {firstName} — your campaigns are in motion
            </h2>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "New accepts", value: "3", tone: "text-[#F5E6B3]" },
            { label: "Messages", value: "1", tone: "text-slate-100" },
            { label: "Deal heat", value: "+12", tone: "text-[#4A90E2]" },
            { label: "Wins in thread", value: "2", tone: "text-emerald-300" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className={`mt-0.5 text-xl font-extrabold tabular-nums ${s.tone}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-medium text-slate-400">
          Treat every ping like pipeline — who you reply to first is who you fill your calendar with.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/marketplace#post-deal" className="btn-gold text-sm">
            Post new deal
          </Link>
          <Link href="/messages" className="btn-primary text-sm">
            Open message threads
          </Link>
          <Link
            href="/#business-analytics"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-bold text-slate-200 shadow-sm transition hover:border-white/20"
          >
            <LineChart className="h-4 w-4 text-[#F5B942]/90" />
            View analytics
          </Link>
        </div>
      </div>
    ) : (
      <div
        className="mb-2 overflow-hidden rounded-2xl border border-[#F2994A]/25 bg-gradient-to-br from-[var(--surface-elevated)] via-[#F2994A]/[0.06] to-[var(--surface)] p-4 shadow-[var(--shadow-md)] sm:p-5"
        style={{
          backgroundImage:
            "radial-gradient(640px 280px at 0% 0%, rgba(242, 153, 74, 0.12) 0%, transparent 55%)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#F2994A]/90">
              <Sparkles className="h-3.5 w-3.5" />
              Your daily briefing
            </p>
            <h2 className="mt-1.5 text-lg font-bold text-slate-50 sm:text-xl">
              Hey {firstName} — here&apos;s your momentum today
            </h2>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Earnings today", value: "$500", tone: "text-[#27AE60]" },
            { label: "New deals", value: "3", tone: "text-slate-100" },
            { label: "Messages", value: "2", tone: "text-slate-100" },
            { label: "Watchlist", value: "+1.2%", tone: "text-[#27AE60]" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className={`mt-0.5 text-xl font-extrabold tabular-nums ${s.tone}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-medium text-slate-400">
          You&apos;re gaining momentum — faster responses unlock higher-paying deals.
        </p>
        <div className="mt-3 space-y-1 text-xs text-slate-300">
          <p>• You missed 2 deals yesterday</p>
          <p>• 3 new deals match your profile</p>
          <p>• Fast replies = higher payouts</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/marketplace" className="btn-primary text-sm">
            View deals
          </Link>
          <Link href="/messages" className="btn-secondary text-sm">
            Reply to messages
          </Link>
          <Link
            href="/investing"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#27AE60]/40 bg-[#27AE60]/[0.1] px-3 py-2 text-sm font-bold text-emerald-200 shadow-sm transition hover:border-[#27AE60]/55"
          >
            <LineChart className="h-4 w-4 text-[#27AE60]" />
            Check investing
          </Link>
        </div>
      </div>
    );

  if (rows.length > 0) {
    return (
      <div className="space-y-4">
        {briefing}
        <div className="space-y-3">
        {rows.map((row, i) => {
          const isServer = row.source === "server";
          const title = isServer ? row.item.title : row.item.title;
          const detail = isServer ? row.item.detail : row.item.detail;
          const at = isServer ? row.item.created_at : row.item.created_at;
          const unread = isServer ? !row.item.read : !row.item.read;
          const Icon: LucideIcon = isServer ? Bell : kindIcon(row.item.kind);

          return (
            <button
              key={row.key}
              type="button"
              onClick={() => onRowClick(row)}
              style={{ animationDelay: `${i * 40}ms` } as CSSProperties}
              className={[
                "notif-pop w-full rounded-2xl border p-4 text-left text-sm transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] sm:p-5",
                unread
                  ? "border-[#F2994A]/40 bg-gradient-to-r from-[#F2994A]/[0.1] to-[var(--surface)]"
                  : "border-white/10 bg-white/[0.03]",
              ].join(" ")}
            >
              <div className="flex gap-3">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    unread
                      ? "border-[#F2994A]/40 bg-[#F2994A]/[0.12] text-orange-200"
                      : "border-white/10 bg-white/[0.04] text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-100">{title}</h3>
                    <span className="shrink-0 text-xs text-slate-500">{formatRelativeTime(at)}</span>
                  </div>
                  <p className="mt-1 text-slate-400">{detail}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span
                      className={`text-[0.7rem] font-bold uppercase tracking-wide ${
                        unread ? "text-[#F2994A]" : "text-slate-500"
                      }`}
                    >
                      {unread ? "Unread" : "Read"}
                    </span>
                    {isServer || (!isServer && row.item.href) ? (
                      <span className="text-xs font-semibold text-[#F5B942]/90">Open →</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {briefing}
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#F2994A]/30 bg-[#F2994A]/[0.04] px-4 py-12 text-center sm:px-6 sm:py-14">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F2994A]/40 to-[#9B51E0]/25 ring-1 ring-white/10 notif-pop">
        <Bell className="h-6 w-6 text-orange-100" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-100">Stay on top of your deals and messages</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        When you apply, get replies, or accept a deal, updates show up here so you can act fast and keep earning.
      </p>
    </div>
    </div>
  );
}
