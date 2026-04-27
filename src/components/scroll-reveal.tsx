"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** True if any part of the element is in (or just above) the viewport — avoids “permanent black” if IO never fires. */
function isInViewport(el: Element) {
  const r = el.getBoundingClientRect();
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  return r.top < vh * 0.99 && r.bottom > -8;
}

export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const show = () => {
      if (cancelled) return;
      if (delayMs > 0) {
        timeout = setTimeout(() => setVisible(true), delayMs);
      } else {
        setVisible(true);
      }
    };

    if (isInViewport(el)) {
      show();
      return () => {
        cancelled = true;
        if (timeout) clearTimeout(timeout);
      };
    }

    const ob = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          ob.unobserve(entry.target);
          show();
        }
      },
      { root: null, rootMargin: "0px 0px 0px 0px", threshold: 0 },
    );
    ob.observe(el);
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
      ob.disconnect();
    };
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={["reveal", visible ? "reveal-visible" : "reveal-pending", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
