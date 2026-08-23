"use client";

import { useCallback, useEffect, useRef } from "react";
import { tiltFromPointer } from "@/lib/tilt";

/** Spec'teki kart açısı. Çipler bu hook'u kullanmaz. */
const DEFAULT_MAX_DEG = 7;

type PointerLike = { clientX: number; clientY: number };

/**
 * Elemana imleci takip eden 3D eğim verir.
 *
 * Açıyı React state'ine yazmaz — doğrudan DOM'daki CSS değişkenlerini günceller.
 * Böylece fare her kıpırdadığında yeniden render olmaz. Bu, projelerdeki
 * spotlight'ın (--mx/--my) zaten kullandığı yaklaşımın aynısı.
 *
 * Görsel dönüşümün kendisi globals.css'teki `.tilt` sınıfında; dokunmatik
 * cihaz ve reduced-motion kapıları da orada, medya sorgusuyla.
 */
export function useTilt<T extends HTMLElement>({
  maxDeg = DEFAULT_MAX_DEG,
}: { maxDeg?: number } = {}) {
  const ref = useRef<T>(null);
  const frame = useRef(0);

  useEffect(() => {
    // Bekleyen kare unmount'ta iptal edilmezse sökülmüş elemana yazmaya çalışır.
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onPointerMove = useCallback(
    ({ clientX, clientY }: PointerLike) => {
      // Kare başına en fazla bir güncelleme: pointermove fare hızına göre
      // saniyede yüzlerce kez tetiklenebiliyor.
      if (frame.current) return;

      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const { rotateX, rotateY } = tiltFromPointer({
          width: rect.width,
          height: rect.height,
          x: clientX - rect.left,
          y: clientY - rect.top,
          maxDeg,
        });

        el.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      });
    },
    [maxDeg]
  );

  const onPointerLeave = useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
