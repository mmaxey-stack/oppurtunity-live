"use client";

import { useState } from "react";

export function CheckoutButton({
  planId,
  label,
  className,
}: {
  planId: "basic" | "pro" | "onboarding" | "elite";
  label: string;
  /** Optional; merged with base button styles */
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (response.status === 401) {
        throw new Error("Please sign in again, then return to Billing.");
      }
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Unable to create checkout session.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ??
          "btn-primary w-full transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed"
        }
      >
        {loading ? "Opening Stripe…" : label}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
