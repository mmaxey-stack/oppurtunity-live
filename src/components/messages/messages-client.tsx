"use client";
/* eslint-disable react-hooks/set-state-in-effect -- URL sync + mock thread flows intentionally set selection in effects */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type FormEvent,
  type RefObject,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  markMessagesReadForDealAction,
  markMessagesReadForPeerAction,
  sendMessageAction,
} from "@/app/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  ACTIVITY_EVENT,
  addLocalNotification,
  getMockThreadExtras,
  setMockInboxUnreadCount,
} from "@/lib/oppurtunity-activity";
import { incrementAcceptedDeal } from "@/lib/growth-loop";
import { formatRelativeTime } from "@/lib/time";
import { MOCK_MESSAGE_THREADS } from "@/lib/messages-mock-data";
import { MOCK_BUSINESS_INBOX, MOCK_BUSINESS_THREAD_ORDER } from "@/lib/messages-mock-business";

/** Money threads surface first: nightlife, gym, clothing. */
const MOCK_THREAD_ORDER = [
  "mock-thread-alley-mac",
  "mock-thread-nut-house",
  "mock-thread-prime-hydration",
  "mock-thread-north-thread",
] as const;
import type { MockInboxThread, MockThreadMessage } from "@/lib/messages-mock-data";
import type { DealMessageStatus } from "@/lib/types-messages-mock";
import { UserRole } from "@/lib/types";
import { AtSign, Banknote, Check, CheckCircle2, ChevronRight, MessageCircle, Phone, Send, X } from "lucide-react";

type DbMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
  deal_id: string | null;
  read_by_receiver: boolean;
};

type DealMeta = {
  title: string;
  businessName: string;
  businessId: string;
  athleteId: string | null;
};

type Peer = { id: string; full_name: string; role: string };

type ThreadItem =
  | { kind: "mock"; thread: MockInboxThread; lastPreview: string; lastAt: string; unread: boolean }
  | {
      kind: "real";
      variant: "peer";
      peerId: string;
      peerName: string;
      lastPreview: string;
      lastAt: string;
      unread: boolean;
    }
  | {
      kind: "real";
      variant: "deal";
      dealId: string;
      peerId: string;
      peerName: string;
      dealTitle: string;
      lastPreview: string;
      lastAt: string;
      unread: boolean;
    };

function partnerId(m: DbMessage, userId: string) {
  return m.sender_id === userId ? m.receiver_id : m.sender_id;
}

function igUrl(handle: string) {
  const h = handle.replace(/^@/, "").trim();
  return `https://www.instagram.com/${h}/`;
}

function telUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length >= 8) return `tel:+${digits}`;
  return `tel:${phone}`;
}

function buildRealGroups(peerOnly: DbMessage[], userId: string) {
  const byPeer = new Map<string, DbMessage[]>();
  for (const m of peerOnly) {
    const p = partnerId(m, userId);
    if (!byPeer.has(p)) byPeer.set(p, []);
    byPeer.get(p)!.push(m);
  }
  const out: { peerId: string; messages: DbMessage[]; last: DbMessage; unread: boolean }[] = [];
  for (const [peerId, list] of byPeer) {
    const sorted = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const last = sorted[sorted.length - 1]!;
    const unread = sorted.some((m) => m.receiver_id === userId && !m.read_by_receiver);
    out.push({ peerId, messages: sorted, last, unread });
  }
  out.sort((a, b) => new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime());
  return out;
}

function buildDealGroups(messages: DbMessage[], userId: string) {
  const withDeal = messages.filter((m) => m.deal_id);
  const byDeal = new Map<string, DbMessage[]>();
  for (const m of withDeal) {
    const id = m.deal_id!;
    if (!byDeal.has(id)) byDeal.set(id, []);
    byDeal.get(id)!.push(m);
  }
  const out: { dealId: string; peerId: string; messages: DbMessage[]; last: DbMessage; unread: boolean }[] = [];
  for (const [dealId, list] of byDeal) {
    const sorted = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const last = sorted[sorted.length - 1]!;
    const peerId = partnerId(sorted[0]!, userId);
    const unread = sorted.some((m) => m.receiver_id === userId && !m.read_by_receiver);
    out.push({ dealId, peerId, messages: sorted, last, unread });
  }
  out.sort((a, b) => new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime());
  return out;
}

const QUICK_ATHLETE = [
  "I’m interested — what are deliverables?",
  "When does this need to be completed?",
  "Can we increase payout based on performance?",
  "Auto follow-up",
] as const;
const QUICK_BUSINESS = [
  "Can you go live on the time we set?",
  "Tag us + drop the proof here.",
  "Pushing a bonus if you can bring 2 more.",
  "Auto follow-up",
] as const;

const statusPill: Record<DealMessageStatus, string> = {
  Pending: "border-[#F5B942]/40 bg-[#F5B942]/[0.12] text-[#F5E6B3]",
  Accepted: "border-[#27AE60]/40 bg-[#27AE60]/[0.12] text-emerald-200",
  "In Progress": "border-[#4A90E2]/40 bg-[#4A90E2]/[0.12] text-sky-200",
  Declined: "border-white/12 bg-white/[0.05] text-slate-500",
  Completed: "border-[#9B51E0]/40 bg-[#9B51E0]/[0.12] text-violet-200",
};

export function MessagesClient({
  userId,
  userName,
  role,
  peers,
  messages: dbMessages,
  dealMeta = {},
  senderNameById: senderNameByIdJson,
}: {
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  peers: Peer[];
  messages: DbMessage[];
  dealMeta?: Record<string, DealMeta>;
  senderNameById: Record<string, string>;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [statusByMock, setStatusByMock] = useState<Record<string, DealMessageStatus>>(() => {
    const list = role === "business" ? MOCK_BUSINESS_INBOX : MOCK_MESSAGE_THREADS;
    const s: Record<string, DealMessageStatus> = {};
    for (const t of list) s[t.id] = t.initialStatus;
    return s;
  });
  const [extraByMock, setExtraByMock] = useState<Record<string, MockThreadMessage[]>>({});
  const [unreadMock, setUnreadMock] = useState<Set<string>>(
    () => new Set((role === "business" ? MOCK_BUSINESS_INBOX : MOCK_MESSAGE_THREADS).map((t) => t.id)),
  );
  const [input, setInput] = useState("");
  const [acceptFlash, setAcceptFlash] = useState<string | null>(null);
  const [sendPop, setSendPop] = useState(false);
  const [storageV, setStorageV] = useState(0);
  const [typingMock, setTypingMock] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const showMock = role === "athlete" || role === "business";
  const mockThreads = useMemo(() => {
    if (!showMock) return [];
    if (role === "business") {
      const copy = [...MOCK_BUSINESS_INBOX];
      copy.sort((a, b) => {
        const ia = MOCK_BUSINESS_THREAD_ORDER.indexOf(a.id as (typeof MOCK_BUSINESS_THREAD_ORDER)[number]);
        const ib = MOCK_BUSINESS_THREAD_ORDER.indexOf(b.id as (typeof MOCK_BUSINESS_THREAD_ORDER)[number]);
        if (ia !== -1 || ib !== -1) {
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        }
        return 0;
      });
      return copy;
    }
    const copy = [...MOCK_MESSAGE_THREADS];
    copy.sort((a, b) => {
      const ia = MOCK_THREAD_ORDER.indexOf(a.id as (typeof MOCK_THREAD_ORDER)[number]);
      const ib = MOCK_THREAD_ORDER.indexOf(b.id as (typeof MOCK_THREAD_ORDER)[number]);
      if (ia !== -1 || ib !== -1) {
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      }
      return 0;
    });
    return copy;
  }, [showMock, role]);
  const peerOnlyMessages = useMemo(() => dbMessages.filter((m) => !m.deal_id), [dbMessages]);
  const dealGroups = useMemo(() => buildDealGroups(dbMessages, userId), [dbMessages, userId]);
  const realGroups = useMemo(() => buildRealGroups(peerOnlyMessages, userId), [peerOnlyMessages, userId]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`messages-refresh-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as { sender_id?: string; receiver_id?: string };
          if (row.sender_id === userId || row.receiver_id === userId) router.refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, router]);

  const threadItems: ThreadItem[] = useMemo(() => {
    const mock: ThreadItem[] = mockThreads.map((thread) => {
      const all = [...thread.messages, ...(extraByMock[thread.id] ?? [])].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      const last = all[all.length - 1]!;
      return {
        kind: "mock" as const,
        thread,
        lastPreview: last.body,
        lastAt: last.createdAt,
        unread: unreadMock.has(thread.id),
      };
    });
    const fromDeals: ThreadItem[] = dealGroups.map((g) => {
      const meta = dealMeta[g.dealId];
      const peerName =
        peers.find((p) => p.id === g.peerId)?.full_name ?? senderNameByIdJson[g.peerId] ?? meta?.businessName ?? "Contact";
      return {
        kind: "real" as const,
        variant: "deal" as const,
        dealId: g.dealId,
        peerId: g.peerId,
        peerName,
        dealTitle: meta?.title ?? "Deal thread",
        lastPreview: g.last.body,
        lastAt: g.last.created_at,
        unread: g.unread,
      };
    });
    const fromPeers: ThreadItem[] = realGroups.map((g) => {
      const peerName = peers.find((p) => p.id === g.peerId)?.full_name ?? senderNameByIdJson[g.peerId] ?? "User";
      return {
        kind: "real" as const,
        variant: "peer" as const,
        peerId: g.peerId,
        peerName,
        lastPreview: g.last.body,
        lastAt: g.last.created_at,
        unread: g.unread,
      };
    });
    const realSorted = [...fromDeals, ...fromPeers].sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    );
    return [...mock, ...realSorted];
  }, [mockThreads, extraByMock, dealGroups, realGroups, peers, senderNameByIdJson, unreadMock, dealMeta]);

  const selectedMock = useMemo(
    () =>
      selectedKey && !selectedKey.startsWith("real-") ? mockThreads.find((t) => t.id === selectedKey) : undefined,
    [selectedKey, mockThreads],
  );

  const selectedDealId = useMemo(
    () => (selectedKey?.startsWith("real-deal-") ? selectedKey.slice(9) : null),
    [selectedKey],
  );
  const selectedPeerOnlyId = useMemo(
    () =>
      selectedKey?.startsWith("real-") && !selectedKey.startsWith("real-deal-")
        ? selectedKey.slice(5)
        : null,
    [selectedKey],
  );
  const selectedDealGroup = useMemo(
    () => (selectedDealId ? (dealGroups.find((g) => g.dealId === selectedDealId) ?? null) : null),
    [dealGroups, selectedDealId],
  );
  const selectedRealGroup = useMemo(
    () =>
      selectedPeerOnlyId ? (realGroups.find((g) => g.peerId === selectedPeerOnlyId) ?? null) : null,
    [realGroups, selectedPeerOnlyId],
  );
  const selectedRealName = useMemo(() => {
    if (selectedDealGroup) {
      return (
        peers.find((p) => p.id === selectedDealGroup.peerId)?.full_name ??
        senderNameByIdJson[selectedDealGroup.peerId] ??
        dealMeta[selectedDealGroup.dealId]?.businessName ??
        "Contact"
      );
    }
    if (selectedPeerOnlyId) {
      return (
        peers.find((p) => p.id === selectedPeerOnlyId)?.full_name ??
        senderNameByIdJson[selectedPeerOnlyId] ??
        "Contact"
      );
    }
    return "Contact";
  }, [peers, senderNameByIdJson, dealMeta, selectedDealGroup, selectedPeerOnlyId]);

  useEffect(() => {
    if (searchParams.get("thread") && searchParams.get("apply") === "1") return;
    if (!selectedKey && threadItems.length) {
      const i0 = threadItems[0]!;
      if (i0.kind === "mock") setSelectedKey(i0.thread.id);
      else if (i0.variant === "deal") setSelectedKey(`real-deal-${i0.dealId}`);
      else setSelectedKey(`real-${i0.peerId}`);
    }
  }, [threadItems, selectedKey, searchParams]);

  const lastQueryThread = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!showMock) return;
    const t = searchParams.get("thread");
    if (t === lastQueryThread.current) return;
    lastQueryThread.current = t;
    if (
      t &&
      (MOCK_MESSAGE_THREADS.some((m) => m.id === t) || MOCK_BUSINESS_INBOX.some((m) => m.id === t))
    ) {
      setSelectedKey(t);
    }
  }, [searchParams, showMock]);

  useEffect(() => {
    if (!showMock) return;
    setMockInboxUnreadCount(unreadMock.size);
  }, [unreadMock, showMock]);

  useEffect(() => {
    if (typeof window === "undefined" || !showMock) return;
    const on = () => setStorageV((v) => v + 1);
    window.addEventListener(ACTIVITY_EVENT, on);
    return () => window.removeEventListener(ACTIVITY_EVENT, on);
  }, [showMock]);

  useEffect(() => {
    if (!selectedMock) return;
    if (role === "business") return;
    setTypingMock(true);
    const t = window.setTimeout(() => setTypingMock(false), 1500);
    return () => clearTimeout(t);
  }, [selectedMock, role]);

  const storageExtras = useMemo(() => {
    void storageV;
    return getMockThreadExtras();
  }, [storageV]);

  const mockMessagesForSelected = useMemo(() => {
    if (!selectedMock) return [];
    const fromStorage = storageExtras[selectedMock.id] ?? [];
    const fromLocal = extraByMock[selectedMock.id] ?? [];
    const map = new Map<string, MockThreadMessage>();
    for (const m of [...selectedMock.messages, ...fromLocal, ...fromStorage]) {
      map.set(m.id, m);
    }
    return [...map.values()].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [selectedMock, extraByMock, storageExtras]);

  /** Marketplace “Apply” → open thread, send first line, simulate business reply + notifications. */
  useEffect(() => {
    if (role !== "athlete" || !showMock) return;
    const thread = searchParams.get("thread");
    if (!thread || searchParams.get("apply") !== "1") return;
    if (!MOCK_MESSAGE_THREADS.some((t) => t.id === thread)) {
      router.replace("/messages", { scroll: false });
      return;
    }
    const doneKey = `opp-apply-v1-${thread}`;
    if (typeof window !== "undefined" && localStorage.getItem(doneKey)) {
      router.replace(`/messages?thread=${encodeURIComponent(thread)}`, { scroll: false });
      return;
    }
    if (typeof window !== "undefined") localStorage.setItem(doneKey, "1");
    setSelectedKey(thread);
    setUnreadMock((prev) => {
      const n = new Set(prev);
      n.delete(thread);
      return n;
    });
    const biz = MOCK_MESSAGE_THREADS.find((t) => t.id === thread)!.businessName;
    setTimeout(() => {
      appendMockMessage(thread, "Hey, I’m interested in this opportunity", "user");
    }, 280);
    addLocalNotification(
      {
        kind: "message",
        title: "Application started",
        detail: `We opened a thread with ${biz} from the marketplace.`,
        href: `/messages?thread=${encodeURIComponent(thread)}`,
        read: true,
      },
      userId,
    );
    addLocalNotification(
      {
        kind: "deal_update",
        title: "Viral loop unlocked",
        detail: `Share this win: “I just earned $75 with ${biz} on Oppurtunity.” Invite teammates to unlock higher-paying tiers.`,
        href: "/marketplace",
        read: true,
      },
      userId,
    );
    router.replace(`/messages?thread=${encodeURIComponent(thread)}`, { scroll: false });
    const replyTimer = window.setTimeout(() => {
      appendMockMessage(
        thread,
        "Thanks for reaching out — let’s lock timing and deliverables in this thread.",
        "business",
      );
      addLocalNotification(
        {
          kind: "message",
          title: "New message",
          detail: `${biz} sent you a message about your deal`,
          href: `/messages?thread=${encodeURIComponent(thread)}`,
        },
        userId,
      );
    }, 1900);
    return () => clearTimeout(replyTimer);
  }, [role, showMock, searchParams, router, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedKey, extraByMock, mockMessagesForSelected, selectedMock, selectedRealGroup, dbMessages, typingMock]);

  function onSelectItem(item: ThreadItem) {
    if (item.kind === "mock") {
      setSelectedKey(item.thread.id);
      setUnreadMock((prev) => {
        const n = new Set(prev);
        n.delete(item.thread.id);
        return n;
      });
    } else if (item.variant === "deal") {
      setSelectedKey(`real-deal-${item.dealId}`);
      void markMessagesReadForDealAction(item.dealId);
    } else {
      setSelectedKey(`real-${item.peerId}`);
      void markMessagesReadForPeerAction(item.peerId);
    }
  }

  function defaultSender(): "user" | "business" {
    if (role === "business") return "business";
    return "user";
  }

  function appendMockMessage(threadId: string, body: string, from?: "user" | "business") {
    const f = from ?? defaultSender();
    const isMine = role === "athlete" ? f === "user" : f === "business";
    if (isMine) {
      setSendPop(true);
      window.setTimeout(() => setSendPop(false), 400);
    }
    const msg: MockThreadMessage = {
      id: `local-${f}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from: f,
      body,
      createdAt: new Date().toISOString(),
    };
    setTimeout(
      () => {
        setExtraByMock((ex) => ({ ...ex, [threadId]: [...(ex[threadId] ?? []), msg] }));
      },
      f === "business" ? 120 : 40,
    );
  }

  function onSendMock() {
    if (!selectedMock || !input.trim()) return;
    const body = input.trim();
    setInput("");
    const from = defaultSender();
    appendMockMessage(selectedMock.id, body, from);
    const detail =
      role === "business"
        ? `You messaged ${selectedMock.athleteName ?? "your athlete partner"} about ${selectedMock.dealTitle}.`
        : `You messaged ${selectedMock.businessName} — faster replies keep deals hot.`;
    addLocalNotification(
      {
        kind: "message",
        title: "Message sent",
        detail,
        href: `/messages?thread=${encodeURIComponent(selectedMock.id)}`,
        read: true,
      },
      userId,
    );
  }

  function onRequestPayment(threadId: string) {
    const t = [...MOCK_MESSAGE_THREADS, ...MOCK_BUSINESS_INBOX].find((x) => x.id === threadId);
    if (!t) return;
    addLocalNotification(
      {
        kind: "payment",
        title: "Payment requested",
        detail: `Payout request sent for ${t.dealTitle} — ${t.businessName} will confirm in thread.`,
        href: `/messages?thread=${encodeURIComponent(threadId)}`,
        read: true,
      },
      userId,
    );
  }

  function onAcceptMock(threadId: string) {
    setStatusByMock((s) => ({ ...s, [threadId]: "Accepted" }));
    setAcceptFlash(threadId);
    window.setTimeout(() => setAcceptFlash((f) => (f === threadId ? null : f)), 5000);
    const t = [...MOCK_MESSAGE_THREADS, ...MOCK_BUSINESS_INBOX].find((x) => x.id === threadId);
    if (t) {
      incrementAcceptedDeal(t.payoutAmount);
      addLocalNotification(
        {
          kind: "deal_accepted",
          title: "Deal accepted",
          detail: `You accepted ${t.dealTitle} with ${t.businessName}`,
          href: `/messages?thread=${encodeURIComponent(threadId)}`,
        },
        userId,
      );
    }
  }

  if (threadItems.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#4A90E2]/35 bg-[#4A90E2]/[0.05] px-4 py-14 text-center sm:px-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4A90E2]/40 to-[#1a1f2a] ring-1 ring-white/10">
          <MessageCircle className="h-7 w-7 text-sky-200" />
        </div>
        {role === "business" ? (
          <>
            <h3 className="mt-4 text-lg font-semibold text-slate-100">Your athlete inbox is ready</h3>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              List a deal and nudge athletes in-thread — this is where conversion happens.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link href="/marketplace#post-deal" className="btn-gold inline-flex">
                Post a deal
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/marketplace" className="btn-secondary inline-flex">
                Browse examples
              </Link>
            </div>
          </>
        ) : (
          <>
            <h3 className="mt-4 text-lg font-semibold text-slate-100">You haven’t started any conversations yet</h3>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Browse deals and start messaging businesses to lock in opportunities.
            </p>
            <Link href="/marketplace" className="btn-primary mt-6 inline-flex">
              Browse deals
              <ChevronRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>
    );
  }

  const st = selectedMock ? statusByMock[selectedMock.id] ?? "Pending" : "Pending";
  const canInProgress = st === "Accepted";
  const canComplete = st === "In Progress";
  const acceptDisabled = st === "Accepted" || st === "In Progress" || st === "Completed" || st === "Declined";
  const declineDisabled = st === "Declined";
  const isBusinessMock = Boolean(selectedMock && role === "business" && selectedMock.athleteName);
  const userFirst = userName.split(" ")[0] ?? "You";
  const quick = role === "business" ? QUICK_BUSINESS : QUICK_ATHLETE;

  return (
    <div className="grid min-h-[480px] gap-4 lg:min-h-[560px] lg:grid-cols-[minmax(0,300px)_1fr]">
      <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#4A90E2]/25 bg-gradient-to-b from-[#4A90E2]/[0.06] to-[var(--surface)] p-2 ring-1 ring-white/6 sm:p-3">
        <p className="mb-1.5 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">Conversations</p>
        <ul className="min-h-0 space-y-1.5 overflow-y-auto pr-0.5">
          {threadItems.map((item) => {
            const key =
              item.kind === "mock"
                ? item.thread.id
                : item.variant === "deal"
                  ? `real-deal-${item.dealId}`
                  : `real-${item.peerId}`;
            const active = selectedKey === key;
            const sub =
              item.kind === "mock" && role === "business" && item.thread.athleteName
                ? item.thread.dealTitle
                : item.kind === "mock"
                  ? item.thread.dealTitle
                  : item.variant === "deal"
                    ? item.dealTitle
                    : "Direct thread";
            const pay = item.kind === "mock" ? item.thread.payout : "—";
            const listPrimary =
              item.kind === "mock" && role === "business" && item.thread.athleteName
                ? item.thread.athleteName
                : item.kind === "mock"
                  ? item.thread.businessName
                  : item.peerName;
            const listSubline =
              item.kind === "mock" && role === "business" && item.thread.athleteName
                ? item.thread.businessName
                : null;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onSelectItem(item)}
                  className={[
                    "flex w-full min-w-0 flex-col items-start gap-0.5 rounded-xl border px-2.5 py-2.5 text-left text-sm transition-all duration-200",
                    active
                      ? "border-[#4A90E2]/50 bg-[#4A90E2]/[0.12] shadow-sm ring-1 ring-[#4A90E2]/30"
                      : "border-white/8 bg-white/[0.04] hover:-translate-y-0.5 hover:border-[#4A90E2]/40 hover:shadow-sm",
                  ].join(" ")}
                >
                  <div className="flex w-full items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate font-semibold text-slate-100">
                      {listPrimary}
                    </span>
                    {item.unread ? (
                      <span
                        className="shrink-0 rounded-full bg-[#4A90E2]/20 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-sky-200"
                        aria-label="Unread"
                      >
                        New
                      </span>
                    ) : null}
                    <span className="shrink-0 rounded-md border border-[#F5B942]/30 bg-[#F5B942]/[0.12] px-1.5 py-0.5 text-[0.65rem] font-bold text-[#F5E6B3]">
                      {pay}
                    </span>
                  </div>
                  {listSubline ? (
                    <p className="w-full truncate text-[0.7rem] text-slate-500">{listSubline}</p>
                  ) : null}
                  <p className="w-full truncate text-xs font-medium text-[#F5B942]/85">{sub}</p>
                  <p className="w-full truncate text-xs text-slate-500">{item.lastPreview}</p>
                  <p className="w-full text-[0.65rem] font-medium text-slate-400">
                    {formatRelativeTime(item.lastAt)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-elevated)] shadow-md ring-1 ring-white/5">
        {selectedMock ? (
          <>
            <div className="shrink-0 border-b border-white/8 bg-white/[0.03] px-3 py-3 sm:px-5 sm:py-4">
              {isBusinessMock ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Athlete</p>
                  <h2 className="text-lg font-bold text-slate-100 sm:text-xl">{selectedMock.athleteName}</h2>
                  <p className="text-sm text-slate-400">{selectedMock.dealTitle}</p>
                  <p className="mt-0.5 text-sm font-bold text-[#F5E6B3]">Payout {selectedMock.payout}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Your brand: <span className="font-semibold text-slate-300">{selectedMock.businessName}</span> ·
                    public contact is shown to the athlete in their view.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Business</p>
                  <h2 className="text-lg font-bold text-slate-100 sm:text-xl">{selectedMock.businessName}</h2>
                  <p className="text-sm text-slate-400">{selectedMock.dealTitle}</p>
                  <p className="mt-0.5 text-sm font-bold text-[#F5E6B3]">Payout {selectedMock.payout}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={telUrl(selectedMock.phone)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-slate-200"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {selectedMock.phone}
                    </a>
                    <a
                      href={igUrl(selectedMock.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-slate-200"
                    >
                      <AtSign className="h-3.5 w-3.5" />
                      {selectedMock.instagram}
                    </a>
                    {selectedMock.website ? (
                      <a
                        href={selectedMock.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#F5B942] underline"
                      >
                        Website
                      </a>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            {acceptFlash === selectedMock.id && !isBusinessMock ? (
              <div
                className="animate-fade-succ shrink-0 border-b border-[#27AE60]/30 bg-[#27AE60]/[0.1] px-3 py-2 text-sm font-medium text-emerald-200 sm:px-5"
                role="status"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  You’re locked in. Coordinate details in the thread below.
                </span>
              </div>
            ) : null}

            {isBusinessMock ? (
              <div className="shrink-0 border-b border-white/8 bg-[#F5B942]/[0.05] p-3 sm:p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Campaign</p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{selectedMock.dealTitle}</p>
                    <p className="text-sm text-[#F5E6B3]">Payout {selectedMock.payout}</p>
                    <p className="mt-1 text-xs text-slate-400">{selectedMock.requirements}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${statusPill[st]}`}
                  >
                    {st}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  You&apos;re the brand in this thread — nudge for proof of post and keep response time tight.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInput("Quick follow-up: still good to post on the window we agreed?");
                      document.getElementById("mock-chat-input")?.focus();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#4A90E2]/35 bg-[#4A90E2]/[0.12] px-3 py-1.5 text-sm font-bold text-sky-200"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Nudge athlete
                  </button>
                  <button
                    type="button"
                    disabled={!canComplete}
                    onClick={() => setStatusByMock((s) => ({ ...s, [selectedMock.id]: "Completed" }))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#9B51E0]/40 bg-[#9B51E0]/[0.1] px-2.5 py-1.5 text-xs font-bold text-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Mark completed
                  </button>
                </div>
              </div>
            ) : (
              <div className="shrink-0 border-b border-white/8 bg-[#F5B942]/[0.05] p-3 sm:p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Deal</p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{selectedMock.dealTitle}</p>
                    <p className="text-sm text-[#F5E6B3]">Payout {selectedMock.payout}</p>
                    <p className="mt-1 text-xs text-slate-400">{selectedMock.requirements}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${statusPill[st]}`}
                  >
                    {st}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={acceptDisabled}
                    onClick={() => onAcceptMock(selectedMock.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-600/95 px-3 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" />
                    Accept deal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusByMock((s) => ({ ...s, [selectedMock.id]: "Declined" }));
                      setAcceptFlash(null);
                    }}
                    disabled={declineDisabled}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-1.5 text-sm font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById("mock-chat-input")?.focus()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#4A90E2]/35 bg-[#4A90E2]/[0.12] px-3 py-1.5 text-sm font-bold text-sky-200"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message business
                  </button>
                  <button
                    type="button"
                    disabled={!canInProgress}
                    onClick={() => setStatusByMock((s) => ({ ...s, [selectedMock.id]: "In Progress" }))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#4A90E2]/40 bg-[#4A90E2]/[0.1] px-2.5 py-1.5 text-xs font-bold text-sky-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    In progress
                  </button>
                  <button
                    type="button"
                    disabled={!canComplete}
                    onClick={() => setStatusByMock((s) => ({ ...s, [selectedMock.id]: "Completed" }))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#9B51E0]/40 bg-[#9B51E0]/[0.1] px-2.5 py-1.5 text-xs font-bold text-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Mark completed
                  </button>
                  <button
                    type="button"
                    disabled={st === "Declined"}
                    onClick={() => onRequestPayment(selectedMock.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-amber-100/80 px-2.5 py-1.5 text-xs font-bold text-amber-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Banknote className="h-3.5 w-3.5" />
                    Request payment
                  </button>
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-gradient-to-b from-[#0a0e14] to-[var(--surface)] p-3 sm:p-4">
              {mockMessagesForSelected.map((m, i) => {
                  const mine = role === "athlete" ? m.from === "user" : m.from === "business";
                  const peerLabel =
                    role === "business" && isBusinessMock
                      ? (selectedMock.athleteName ?? "Athlete")
                      : selectedMock.businessName;
                  return (
                    <div
                      key={m.id}
                      className={`message-pop flex w-full [animation-delay:var(--d)] ${mine ? "justify-end" : "justify-start"}`}
                      style={{ "--d": `${i * 25}ms` } as CSSProperties}
                    >
                      <div
                        className={[
                          "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[78%] shadow-sm",
                          mine
                            ? "rounded-tr-md bg-gradient-to-br from-[#F5B942] to-amber-800 text-slate-950"
                            : "rounded-tl-md border border-white/10 bg-white/[0.08] text-slate-200",
                        ].join(" ")}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                        <p
                          className={mine ? "mt-1.5 text-[0.7rem] text-amber-100/90" : "mt-1.5 text-[0.7rem] text-slate-500"}
                        >
                          {new Date(m.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          {mine
                            ? `· ${role === "business" ? "You" : userFirst}`
                            : `· ${peerLabel}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {typingMock && selectedMock ? (
                <div
                  className={`message-pop flex w-full [animation-delay:0ms] ${isBusinessMock ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      isBusinessMock
                        ? "max-w-[92%] rounded-2xl rounded-tr-md border border-[#4A90E2]/35 bg-[#4A90E2]/[0.1] px-3.5 py-2.5 text-sm text-slate-300 shadow-sm sm:max-w-[78%]"
                        : "max-w-[92%] rounded-2xl rounded-tl-md border border-[#4A90E2]/35 bg-[#4A90E2]/[0.1] px-3.5 py-2.5 text-sm text-slate-300 shadow-sm sm:max-w-[78%]"
                    }
                  >
                    <p className="text-xs font-semibold text-sky-200">
                      {isBusinessMock ? selectedMock.athleteName : selectedMock.businessName}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <span className="inline-flex gap-0.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:300ms]" />
                      </span>
                      typing…
                    </p>
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            <div className="shrink-0 border-t border-white/8 bg-[var(--surface)] p-2.5 sm:p-3">
              {mockThreads.length > 1 ? (
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {role === "business" ? "Thread" : "Recipient"}
                  <select
                    className="premium-input mt-1.5 w-full max-w-md text-sm text-slate-200"
                    value={selectedKey ?? ""}
                    onChange={(e) => {
                      setSelectedKey(e.target.value);
                      setUnreadMock((prev) => {
                        const n = new Set(prev);
                        n.delete(e.target.value);
                        return n;
                      });
                    }}
                  >
                    {mockThreads.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.athleteName
                          ? `${t.athleteName} — ${t.dealTitle}`
                          : `${t.businessName} · ${t.payout}`}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="mb-2 flex flex-wrap gap-1.5">
                {quick.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      if (q === "Auto follow-up") {
                        const line =
                          role === "business"
                            ? "Automated follow-up: still good for the posting window we agreed on?"
                            : "Automated follow-up: quick bump on this opportunity — I can lock this in today.";
                        setInput(line);
                      } else {
                        setInput((prev) => (prev ? prev + " " : "") + q);
                      }
                      document.getElementById("mock-chat-input")?.focus();
                    }}
                    className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium text-[#F5E6B3] transition hover:border-[#F5B942]/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <input
                  id="mock-chat-input"
                  className="premium-input min-h-11 flex-1 px-3 text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSendMock();
                    }
                  }}
                  placeholder={
                    isBusinessMock
                      ? `Message ${selectedMock.athleteName ?? "the athlete"} to align deliverables…`
                      : "Message the business to confirm details…"
                  }
                />
                <button
                  type="button"
                  onClick={onSendMock}
                  className={["btn-primary inline-flex shrink-0 items-center gap-1.5 transition-transform", sendPop ? "send-pop" : ""].join(" ")}
                >
                  Send <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : selectedDealGroup && selectedDealId ? (
          <RealThreadPane
            userId={userId}
            userName={userName}
            peerName={selectedRealName}
            messages={selectedDealGroup.messages}
            bottomRef={bottomRef}
            peerId={selectedDealGroup.peerId}
            dealId={selectedDealId}
            dealTitle={dealMeta[selectedDealId]?.title}
            quickChips={quick}
          />
        ) : selectedRealGroup && selectedPeerOnlyId ? (
          <RealThreadPane
            userId={userId}
            userName={userName}
            peerName={selectedRealName}
            messages={selectedRealGroup.messages}
            bottomRef={bottomRef}
            peerId={selectedPeerOnlyId}
            quickChips={quick}
          />
        ) : (
          <p className="m-auto p-4 text-sm text-slate-500">Select a conversation to view messages.</p>
        )}
      </div>
    </div>
  );
}

function RealThreadPane({
  userId,
  userName,
  peerId,
  peerName,
  messages,
  bottomRef,
  dealId,
  dealTitle,
  quickChips = QUICK_ATHLETE,
}: {
  userId: string;
  userName: string;
  peerId: string;
  peerName: string;
  messages: DbMessage[];
  bottomRef: RefObject<HTMLDivElement | null>;
  dealId?: string;
  dealTitle?: string;
  quickChips?: readonly string[];
}) {
  const [sending, start] = useTransition();
  const bodyRef = useRef<HTMLInputElement>(null);
  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const b = (bodyRef.current?.value ?? "").trim();
    if (!b) return;
    const fd = new FormData();
    fd.set("receiverId", peerId);
    fd.set("body", b);
    if (dealId) fd.set("dealId", dealId);
    if (bodyRef.current) bodyRef.current.value = "";
    start(() => {
      void sendMessageAction(fd);
    });
  }

  function addQuick(phrase: string) {
    if (!bodyRef.current) return;
    const v = (bodyRef.current.value ?? "").trim();
    bodyRef.current.value = v ? `${v} ${phrase}` : phrase;
  }

  return (
    <>
      <div className="shrink-0 border-b border-white/8 bg-white/[0.03] px-3 py-3 sm:px-5">
        <h2 className="text-lg font-bold text-slate-100">{peerName}</h2>
        {dealTitle ? <p className="text-sm font-medium text-[#F5E6B3]">{dealTitle}</p> : null}
        {dealId ? (
          <span className="mt-1 inline-flex rounded-md border border-[#F5B942]/30 bg-[#F5B942]/[0.08] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[#F5E6B3]">
            Deal status: Pending
          </span>
        ) : null}
        <p className="text-sm text-slate-500">
          {dealId ? "Deal thread — align on deliverables, payout, and timeline." : "Direct message — align on deliverables and next steps"}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-gradient-to-b from-[#0a0e14] to-[var(--surface)] p-3 sm:p-4">
        {sorted.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No messages in this thread yet. Say hi below.</p>
        ) : null}
        {sorted.map((m, i) => {
          const mine = m.sender_id === userId;
          return (
            <div
              key={m.id}
              className={`message-pop flex w-full [animation-delay:var(--d)] ${mine ? "justify-end" : "justify-start"}`}
              style={{ "--d": `${i * 20}ms` } as CSSProperties}
            >
              <div
                className={[
                  "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[78%] shadow-sm",
                  mine
                    ? "rounded-tr-md bg-gradient-to-br from-[#F5B942] to-amber-800 text-slate-950"
                    : "rounded-tl-md border border-white/10 bg-white/[0.08] text-slate-200",
                ].join(" ")}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                <p className={mine ? "mt-1.5 text-[0.7rem] text-amber-100/90" : "mt-1.5 text-[0.7rem] text-slate-500"}>
                  {formatRelativeTime(m.created_at)}{" "}
                  {mine
                    ? `· ${(userName.split(" ")[0] ?? "You")}`
                    : `· ${peerName}`}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form className="shrink-0 border-t border-white/8 bg-[var(--surface)] p-2.5 sm:p-3" onSubmit={onSubmit}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quickChips.map((q) => (
            <button
              key={q}
              type="button"
              className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium text-[#F5E6B3] transition hover:border-[#F5B942]/40"
              onClick={() => addQuick(q)}
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <input
            name="body"
            ref={bodyRef}
            className="premium-input min-h-11 flex-1 px-3 text-sm"
            placeholder="Message the business to confirm details…"
            required
            autoComplete="off"
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
          />
          <button type="submit" className="btn-primary inline-flex items-center gap-1.5" disabled={sending}>
            {sending ? "Sending…" : "Send"}
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </>
  );
}
