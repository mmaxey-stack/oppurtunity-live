"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOutAction, saveUserSettingsAction } from "@/app/actions";
import type { AppSettingsState } from "@/lib/user-settings";
import { Bell, Briefcase, LineChart, LogOut, CreditCard, Shield, Trash2, Wallet } from "lucide-react";

const STORAGE_KEY = "oppurtunity-settings-v1";

type SettingsState = AppSettingsState;

const DEFAULTS: SettingsState = {
  emailNotif: true,
  imAlerts: true,
  weekly: true,
  investingDigest: true,
  dealPromo: true,
  dealEvents: true,
  dealProducts: true,
  locationRadius: "50",
  minPayout: "100",
  investingLevel: "beginner",
  risk: "medium",
};

function load(): SettingsState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function save(s: SettingsState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function Switch({
  checked,
  onChange,
  id,
  label,
  helper,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  label: string;
  helper: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-slate-200">
          {label}
        </label>
        <p className="mt-0.5 text-xs text-slate-500">{helper}</p>
      </div>
      <div className="relative inline-block h-7 w-12 shrink-0">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="block h-7 w-12 cursor-pointer rounded-full border border-slate-200/90 bg-slate-200/90 shadow-inner transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-400/50 peer-checked:border-emerald-500/40 peer-checked:bg-emerald-500" />
        <span
          className="pointer-events-none absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-out peer-checked:translate-x-5"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function SettingsExperience({ initialFromServer }: { initialFromServer?: AppSettingsState }) {
  const [s, setS] = useState<SettingsState>(DEFAULTS);
  const [toast, setToast] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const local = load();
    if (initialFromServer) {
      setS({ ...DEFAULTS, ...local, ...initialFromServer });
    } else {
      setS(local);
    }
    setMounted(true);
  }, [initialFromServer]);

  function patch(p: Partial<SettingsState>) {
    setS((prev) => ({ ...prev, ...p }));
  }

  async function onSave() {
    setSaving(true);
    save(s);
    try {
      await saveUserSettingsAction(s);
      setToast(true);
      window.setTimeout(() => setToast(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-[200px] rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center text-sm text-slate-500">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {toast ? (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-200/80 bg-emerald-50/95 px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg"
          role="status"
        >
          Changes saved successfully
        </div>
      ) : null}

      {/* Notifications */}
      <section className="ui-surface p-5 sm:p-6 md:p-7">
        <div className="mb-4 flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50">
            <Bell className="h-4 w-4 text-amber-800" />
          </div>
          <div>
            <h2 className="ui-heading-section">Notifications</h2>
            <p className="text-sm text-slate-500">Stay in the loop without the noise.</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-slate-400">
          Turning these on helps you respond faster to deals and never miss a time-sensitive thread. Faster replies = higher
          payouts.
        </p>
        <div className="space-y-5">
          <Switch
            id="emailNotif"
            label="Email notifications"
            checked={s.emailNotif}
            onChange={(v) => patch({ emailNotif: v })}
            helper="Summaries and account updates in your inbox."
          />
          <Switch
            id="imAlerts"
            label="Instant message alerts"
            checked={s.imAlerts}
            onChange={(v) => patch({ imAlerts: v })}
            helper="Faster replies = higher payouts — get nudged the second a brand DMs."
          />
          <Switch
            id="weekly"
            label="Weekly growth summary"
            checked={s.weekly}
            onChange={(v) => patch({ weekly: v })}
            helper="One digest of deal momentum and next steps."
          />
          <Switch
            id="investingDigest"
            label="Investing insight digest"
            checked={s.investingDigest}
            onChange={(v) => patch({ investingDigest: v })}
            helper="Market and wealth habits tailored to your level."
          />
        </div>
      </section>

      {/* Deal preferences */}
      <section className="ui-surface p-5 sm:p-6 md:p-7">
        <div className="mb-4 flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50">
            <Briefcase className="h-4 w-4 text-amber-800" />
          </div>
          <div>
            <h2 className="ui-heading-section">Deal preferences</h2>
            <p className="text-sm text-slate-500">What you want to see in the marketplace.</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-slate-600">These preferences shape which opportunities surface first for you.</p>
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Types of deals</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { key: "dealPromo" as const, label: "Promo" },
                { key: "dealEvents" as const, label: "Events" },
                { key: "dealProducts" as const, label: "Products" },
              ] as const
            ).map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-slate-200 has-[:checked]:border-[#F5B942]/45 has-[:checked]:bg-[#F5B942]/[0.08]"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/30"
                  checked={s[key]}
                  onChange={(e) => patch({ [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="radius">
                Location radius (miles)
              </label>
              <input
                id="radius"
                type="number"
                min={0}
                value={s.locationRadius}
                onChange={(e) => patch({ locationRadius: e.target.value })}
                className="premium-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="minpay">
                Minimum payout preference ($)
              </label>
              <input
                id="minpay"
                type="number"
                min={0}
                value={s.minPayout}
                onChange={(e) => patch({ minPayout: e.target.value })}
                className="premium-input w-full px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Investing preferences */}
      <section className="ui-surface p-5 sm:p-6 md:p-7">
        <div className="mb-4 flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50">
            <LineChart className="h-4 w-4 text-amber-800" />
          </div>
          <div>
            <h2 className="ui-heading-section">Investing preferences</h2>
            <p className="text-sm text-slate-500">How you want to learn and take risk.</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-slate-600">
          Your investing level personalizes the insights and language you see. Risk shapes how assertive we are with
          ideas — still educational, not personal advice.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="level">
              Experience level
            </label>
            <select
              id="level"
              value={s.investingLevel}
              onChange={(e) => patch({ investingLevel: e.target.value as SettingsState["investingLevel"] })}
              className="premium-input w-full px-3 py-2.5 text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="risk">
              Risk tolerance
            </label>
            <select
              id="risk"
              value={s.risk}
              onChange={(e) => patch({ risk: e.target.value as SettingsState["risk"] })}
              className="premium-input w-full px-3 py-2.5 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="ui-surface p-5 sm:p-6 md:p-7" aria-label="Privacy">
        <div className="mb-4 flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50">
            <Shield className="h-4 w-4 text-amber-800" />
          </div>
          <div>
            <h2 className="ui-heading-section">Privacy</h2>
            <p className="text-sm text-slate-500">Control what you share with brands.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Profile visibility, blocked contacts, and data exports are managed here in future releases. For now, keep your
          reach fields accurate so you only get relevant deals.
        </p>
        <Link href="/profile" className="btn-secondary mt-4 inline-flex text-sm">
          Review profile visibility
        </Link>
      </section>

      {/* Payments */}
      <section className="ui-surface p-5 sm:p-6 md:p-7" aria-label="Payments">
        <div className="mb-4 flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50">
            <Wallet className="h-4 w-4 text-amber-800" />
          </div>
          <div>
            <h2 className="ui-heading-section">Payments</h2>
            <p className="text-sm text-slate-500">Plans and receipts.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Upgrade, compare plans, or manage card-on-file from billing. Payouts from businesses follow your agreements
          in each thread.
        </p>
        <Link href="/billing" className="btn-secondary mt-4 inline-flex text-sm">
          Open billing
        </Link>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          className="btn-primary w-full min-w-[11rem] transition-transform duration-200 active:scale-[0.98] sm:w-auto disabled:cursor-wait disabled:opacity-70"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Account control */}
      <section className="ui-surface p-5 sm:p-6 md:p-7" aria-label="Account">
        <h2 className="ui-heading-section">Account</h2>
        <p className="mt-1 text-sm text-slate-600">Session, billing, and your data on Oppurtunity.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex w-full min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition-all hover:border-[#F5B942]/40 hover:bg-white/[0.08] sm:w-auto"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
          <Link
            href="/billing"
            className="inline-flex w-full min-w-[10rem] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition-all hover:border-[#F5B942]/40 hover:bg-white/[0.08] sm:w-auto"
          >
            <CreditCard className="h-4 w-4" />
            Manage subscription
          </Link>
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
          <Trash2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span>
            To delete your account, contact support with your sign-in email. We will verify and process requests under
            our policy.
          </span>
        </p>
      </section>

      {/* Security note */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-400 sm:px-5">
        <p className="font-medium text-slate-800">Security</p>
        <p className="mt-1">Use your auth provider to update password and session. You can return to the auth page from here.</p>
        <Link href="/auth" className="btn-secondary mt-3 inline-flex text-sm">
          Open auth page
        </Link>
      </div>
    </div>
  );
}
