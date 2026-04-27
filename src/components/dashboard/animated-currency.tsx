"use client";

import { useEffect, useState } from "react";

function parseCurrency(raw: string) {
  const n = Number(String(raw).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Animates a dollar amount from 0 to target for a subtle “live data” feel.
 * Pass-through for non-numeric display strings.
 */
export function AnimatedCurrency({ value, className = "" }: { value: string; className?: string }) {
  if (!value.includes("$") && !/^\$?[\d,]+/.test(value)) {
    return <span className={className}>{value}</span>;
  }
  const target = parseCurrency(value);
  const [n, setN] = useState(0);
  const formatted = (x: number) => `$${Math.round(x).toLocaleString()}`;

  useEffect(() => {
    if (target === 0) {
      setN(0);
      return;
    }
    const start = performance.now();
    const dur = 800;
    function frame(now: number) {
      const p = Math.min(1, (now - start) / dur);
      setN(target * (0.2 + 0.8 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [target]);

  if (String(value).includes("$") && /[\d,]+/.test(value)) {
    return <span className={className}>{formatted(n)}</span>;
  }
  return <span className={className}>{value}</span>;
}
