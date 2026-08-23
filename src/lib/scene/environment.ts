"use client";

import type { EligibilityInput } from "@/lib/scene/eligibility";

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
