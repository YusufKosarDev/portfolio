"use client";

import { isSceneEligible, type EligibilityInput } from "@/lib/scene/eligibility";

/**
 * WebGL2 bağlamı gerçekten oluşturulabiliyor mu?
 *
 * `"WebGL2RenderingContext" in window` yetmez: tarayıcı sınıfı tanıyıp da
 * sürücü kara listesi yüzünden bağlam vermeyebiliyor. Tek güvenilir yol
 * denemek. Test canvas'ı hemen bırakılır.
 */
function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Uygunluk kararı için gereken ortam bilgisini tarayıcıdan toplar. */
export function readEnvironment(): EligibilityInput {
  return {
    width: window.innerWidth,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    webgl2: hasWebGL2(),
    cores: navigator.hardwareConcurrency || undefined,
  };
}

// Uygunluk React'in dışında, harici bir store olarak sunuluyor —
// theme-store.ts'teki çözümün aynısı. Effect içinde setState çağırmak
// (react-hooks/set-state-in-effect) hem lint kuralına takılıyor hem de
// gereksiz bir ikinci render turu doğuruyor.

/** Ölçüm bir kez yapılır: karar oturum boyunca değişmez. */
let cached: boolean | undefined;

export function getEligibilitySnapshot(): boolean {
  if (cached === undefined) cached = isSceneEligible(readEnvironment());
  return cached;
}

/** Sunucuda tarayıcı yok; sahne hiçbir zaman sunucuda render edilmez. */
export function getEligibilityServerSnapshot(): boolean {
  return false;
}

/**
 * Karar değişmediği için abonelik bir şey yapmaz. Ekran yeniden boyutlanınca
 * yeniden değerlendirmek, sahneyi kurup yıkarak titremeye yol açardı —
 * uygunluk bilinçli olarak bir kez, açılışta belirlenir.
 */
export function subscribeEligibility(): () => void {
  return () => {};
}
