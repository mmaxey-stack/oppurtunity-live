import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppUser } from "@/lib/types";

export async function requireCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const fullSelect =
    "id, full_name, role, email, created_at, profile_strength, earnings_total, subscription_plan, settings" as const;

  const { data: fullRow, error: fullErr } = await supabase
    .from("users")
    .select(fullSelect)
    .eq("id", user.id)
    .single();

  let row: Record<string, unknown> | null = null;
  if (fullErr || !fullRow) {
    const { data: minimal, error: minErr } = await supabase
      .from("users")
      .select("id, full_name, role, email, created_at")
      .eq("id", user.id)
      .single();
    if (!minErr && minimal) {
      row = minimal as unknown as Record<string, unknown>;
    }
  } else {
    row = fullRow as unknown as Record<string, unknown>;
  }

  // Prevent auth redirect loops when auth user exists but profile row is missing/incomplete.
  if (!row) {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const roleMeta = String(meta.role ?? "athlete");
    const role = (roleMeta === "athlete" || roleMeta === "business" || roleMeta === "investor"
      ? roleMeta
      : "athlete") as AppUser["role"];
    row = {
      id: user.id,
      full_name: String(meta.full_name ?? user.email?.split("@")[0] ?? "User"),
      role,
      email: user.email ?? "",
      created_at: user.created_at ?? new Date().toISOString(),
      profile_strength: 72,
      earnings_total: 0,
      subscription_plan: "free",
      settings: {},
    };
  }

  const profile: AppUser = {
    id: String(row.id),
    full_name: String(row.full_name),
    role: row.role as AppUser["role"],
    email: String(row.email),
    created_at: String(row.created_at),
    profile_strength: row.profile_strength != null ? Number(row.profile_strength) : 72,
    earnings_total: row.earnings_total != null ? Number(row.earnings_total) : 0,
    subscription_plan: (row.subscription_plan != null
      ? String(row.subscription_plan)
      : "free") as AppUser["subscription_plan"],
    settings: (row.settings && typeof row.settings === "object" ? row.settings : {}) as Record<string, unknown>,
  };

  return { supabase, user: profile };
}
