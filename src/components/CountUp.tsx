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

  // Animasyonun ürettiği ara değer. null ise sayım henüz başlamamıştır.
  const [animated, setAnimated] = useState<string | null>(null);

  useEffect(() => {
    // Sayısal olmayan değerlerde ve hareket kısıtlamasında animasyon yok.
    if (target === null || reduceMotion || !inView) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setAnimated(`${prefix}${current}${suffix}`);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, prefix, suffix, reduceMotion]);

  // Gösterilecek değer render sırasında türetilir; böylece effect gövdesinde
  // senkron setState yapmaya gerek kalmaz (cascading render tetiklemez).
  const display =
    target !== null && !reduceMotion ? animated ?? `${prefix}0${suffix}` : value;

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
