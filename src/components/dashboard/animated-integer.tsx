"use client";

import { useEffect, useState } from "react";

export function AnimatedInteger({ value, className = "" }: { value: number; className?: string }) {
  const [n, setN] = useState(0);
  const target = Math.max(0, Math.floor(value));

  useEffect(() => {
    const start = performance.now();
    const dur = 600;
    function frame(t: number) {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(target * (0.15 + 0.85 * (1 - Math.pow(1 - p, 2.5)))));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [target]);

  return <span className={className}>{n.toLocaleString()}</span>;
}
