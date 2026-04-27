import { AppUser } from "@/lib/types";

export function isProMember(user: AppUser) {
  const plan = user.subscription_plan;
  if (plan === "pro" || plan === "elite") return true;

  const envList = (process.env.NEXT_PUBLIC_PRO_MEMBER_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (envList.includes(user.email.toLowerCase())) return true;

  return false;
}

export function isEliteMember(user: AppUser) {
  return user.subscription_plan === "elite";
}
