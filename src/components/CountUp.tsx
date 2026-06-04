"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type CountUpProps = {
  /** Ham değer: "4+", "156", "6", "∞" gibi. Sayısal olmayanlar olduğu gibi gösterilir. */
  value: string;
  /** Animasyon süresi (ms) */
  duration?: number;
  className?: string;
};

/**
 * Değerdeki sayıyı, öğe görünür olunca 0'dan hedefe doğru sayar.
 * "4+" → 4 sayılır, "+" eki korunur. "∞" gibi sayısal olmayanlar sabit kalır.
 * prefers-reduced-motion açıksa anında nihai değeri gösterir.
 */
export function CountUp({ value, duration = 1400, className }: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  // Sayı ve ek (suffix/prefix) ayrıştırma: örn "4+" -> {num:4, suffix:"+"}
  const match = value.match(/^(\D*)(\d+)(\D*)$/);
  const prefix = match?.[1] ?? "";
  const target = match ? parseInt(match[2], 10) : null;
  const suffix = match?.[3] ?? "";

  const [display, setDisplay] = useState(
    target === null || reduceMotion ? value : `${prefix}0${suffix}`
  );

  useEffect(() => {
    if (target === null) {
      setDisplay(value);
      return;
    }
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplay(`${prefix}${current}${suffix}`);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, prefix, suffix, value, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
