"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types";
import { Building2, CircleDollarSign, Lock, Mail, User, Wallet } from "lucide-react";

type Mode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("athlete");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          const { error: profileError } = await supabase.from("users").upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            role,
            settings: {},
            subscription_plan: "free",
          });
          // Some deployments may not yet have the latest role enum/columns.
          // Avoid trapping users in auth loop; profile can be hydrated later.
          if (profileError) {
            console.warn("Profile upsert warning:", profileError.message);
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-amber-400/20 bg-[#121216] pl-11 pr-4 py-2.5 text-sm text-white shadow-inner outline-none transition duration-200 ring-0 placeholder:text-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-400/25";

  return (
    <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-amber-400/25 bg-[#0a0a0c]/90 p-6 text-white shadow-[0_24px_64px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/5 backdrop-blur-md sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/85">Oppurtunity</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-[2rem]">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-300/90">Track what you earn. Keep more of it. Grow it.</p>
      <p className="mt-1.5 text-xs text-slate-400">Join athletes already earning and growing their money</p>

      <div className="mt-6 flex rounded-xl border border-amber-500/20 bg-[#111114] p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition duration-200 ${
            mode === "signin" ? "bg-amber-300/95 text-amber-950 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition duration-200 ${
            mode === "signup" ? "bg-amber-300/95 text-amber-950 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        {mode === "signup" ? (
          <>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className={inputClass}
                required
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Choose your path</p>
              <div className="mt-2 grid gap-2">
                {[
                  {
                    id: "athlete",
                    title: "Athlete",
                    sub: "Earn money",
                    icon: CircleDollarSign,
                  },
                  {
                    id: "business",
                    title: "Business",
                    sub: "Grow customers",
                    icon: Building2,
                  },
                  {
                    id: "investor",
                    title: "Investor",
                    sub: "Grow wealth",
                    icon: Wallet,
                  },
                ].map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as UserRole)}
                      className={[
                        "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
                        active
                          ? "border-amber-300/50 bg-amber-300/[0.12] shadow-[0_0_20px_-12px_rgba(245,185,66,0.7)]"
                          : "border-white/10 bg-white/[0.03] hover:border-amber-300/30",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${active ? "text-amber-200" : "text-slate-500"}`} />
                        <span className="text-sm font-semibold text-slate-100">{r.title}</span>
                      </span>
                      <span className={`text-xs ${active ? "text-amber-100" : "text-slate-400"}`}>{r.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-xl border border-[#4A90E2]/25 bg-[#4A90E2]/[0.08] p-3">
              <p className="text-xs font-semibold text-sky-200">What you unlock:</p>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                <li>• Paid deals ($25–$500+)</li>
                <li>• Direct business connections</li>
                <li>• Investing tools to grow your money</li>
              </ul>
            </div>
          </>
        ) : null}
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className={inputClass}
            required
          />
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className={inputClass}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_0_24px_-10px_rgba(245,185,66,0.85)] disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account & Start Earning"}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {mode === "signup" ? (
        <p className="mt-3 text-center text-xs text-slate-500">Free to start • No risk • Takes 30 seconds</p>
      ) : null}
    </div>
  );
}
